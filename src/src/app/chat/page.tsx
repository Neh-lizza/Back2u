// src/app/chat/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MoreVertical, Send, Paperclip,
  ShieldCheck, CheckCheck, Clock, Loader2,
  ArrowLeft, CheckCircle2, Star
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ── TYPES DEFINED LOCALLY ──────────────────────────────────
type ChatListItem = {
  id:            string;
  item_id:       string;
  participant_a: string;
  participant_b: string;
  status:        string;
  created_at:    string;
  item:          { id: string; title: string; type: string; photos: string[] } | null;
  other_user:    { id: string; full_name: string; avatar_url: string | null; rating: number } | null;
  last_message:  { content: string; created_at: string; type: string; sender_id: string; read_at: string | null } | null;
  unread_count:  number;
};

type MessageWithSender = {
  id:         string;
  chat_id:    string;
  sender_id:  string;
  content:    string;
  type:       string;
  read_at:    string | null;
  created_at: string;
  sender:     { id: string; full_name: string; avatar_url: string | null } | null;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  if (hrs < 48) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

import { Suspense } from "react";
import { useI18n } from "@/lib/i18n";

function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t } = useI18n();
  const db = supabase as any; // bypass strict TypeScript on all db calls
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [activeChat, setActiveChat] = useState<ChatListItem | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [message, setMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) { router.push("/auth"); return; }
      setCurrentUser(user);
    });
  }, []);

  const fetchChats = useCallback(async (userId: string) => {
    const { data, error } = await db
      .from("chats")
      .select(`*, item:items(id, title, type, photos), messages(id, content, created_at, sender_id, read_at, type)`)
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error || !data) return;

    const enriched: ChatListItem[] = await Promise.all(
      data.map(async (chat: any) => {
        const otherId = chat.participant_a === userId ? chat.participant_b : chat.participant_a;
        const { data: otherUser } = await db.from("users").select("id, full_name, avatar_url, rating").eq("id", otherId).single();
        const msgs = chat.messages ?? [];
        const sorted = [...msgs].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const lastMessage = sorted[0] ?? null;
        const unreadCount = msgs.filter((m: any) => m.sender_id !== userId && !m.read_at).length;
        return { ...chat, other_user: otherUser ?? null, last_message: lastMessage, unread_count: unreadCount, messages: undefined };
      })
    );

    enriched.sort((a, b) => {
      const aTime = a.last_message?.created_at ?? a.created_at;
      const bTime = b.last_message?.created_at ?? b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    setChats(enriched);
    setLoadingChats(false);

    const chatIdParam = searchParams.get("id");
    if (chatIdParam) {
      const target = enriched.find((c: ChatListItem) => c.id === chatIdParam);
      if (target) openChat(target);
    }
  }, [searchParams]);

  useEffect(() => { if (currentUser) fetchChats(currentUser.id); }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase.channel("chat-list-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => fetchChats(currentUser.id))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chats" }, () => fetchChats(currentUser.id))
      .subscribe();

    // Polling fallback every 5 seconds in case real-time is not working
    const poll = setInterval(() => fetchChats(currentUser.id), 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [currentUser]);

  const openChat = async (chat: ChatListItem) => {
    setActiveChat(chat);
    setShowMobileChat(true);
    setLoadingMessages(true);
    setMessages([]);

    const { data } = await db.from("messages").select("*, sender:users(id, full_name, avatar_url)").eq("chat_id", chat.id).order("created_at", { ascending: true });
    setMessages((data as MessageWithSender[]) ?? []);
    setLoadingMessages(false);

    await db.from("messages").update({ read_at: new Date().toISOString() }).eq("chat_id", chat.id).neq("sender_id", currentUser?.id).is("read_at", null);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread_count: 0 } : c));

    const msgChannel = supabase.channel(`messages-${chat.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chat.id}` },
        async (payload: any) => {
          const { data: newMsg } = await db.from("messages").select("*, sender:users(id, full_name, avatar_url)").eq("id", payload.new.id).single();
          if (newMsg) {
            setMessages((prev: MessageWithSender[]) => [...prev, newMsg as MessageWithSender]);
            if (newMsg.sender_id !== currentUser?.id) {
              await db.from("messages").update({ read_at: new Date().toISOString() }).eq("id", newMsg.id);
            }
          }
        }
      ).subscribe();

    const { data: recovery } = await db.from("recoveries").select("*").eq("chat_id", chat.id).maybeSingle();
    if (recovery) {
      setRecoveryId(recovery.id);
      const myConfirmed = recovery.participant_a === currentUser?.id ? recovery.confirmed_by_a : recovery.confirmed_by_b;
      if (!myConfirmed && chat.status !== "recovered") setShowRecoveryPrompt(true);
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Polling fallback for messages — updates every 3s when a chat is open
  useEffect(() => {
    if (!activeChat) return;
    const poll = setInterval(async () => {
      const { data } = await db.from("messages").select("*, sender:users(id, full_name, avatar_url)").eq("chat_id", activeChat.id).order("created_at", { ascending: true });
      if (data) setMessages(data as MessageWithSender[]);
    }, 3000);
    return () => clearInterval(poll);
  }, [activeChat]);

  const handleSend = async () => {
    if (!message.trim() || !activeChat || !currentUser || sending) return;
    setSending(true);
    const content = message.trim();
    setMessage("");
    await db.from("messages").insert({ chat_id: activeChat.id, sender_id: currentUser.id, content, type: "text" });
    const otherId = activeChat.participant_a === currentUser.id ? activeChat.participant_b : activeChat.participant_a;
    await db.from("notifications").insert({ user_id: otherId, type: "chat_message", title: "New message", body: content.slice(0, 80), data: { chat_id: activeChat.id } });
    setSending(false);
  };

  const handlePhotoSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !currentUser) return;
    const path = `chats/${activeChat.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("item-photos").upload(path, file);
    if (error) return;
    const { data: { publicUrl } } = supabase.storage.from("item-photos").getPublicUrl(path);
    await db.from("messages").insert({ chat_id: activeChat.id, sender_id: currentUser.id, content: publicUrl, type: "image" });
  };

  const handleConfirmRecovery = async () => {
    if (!activeChat || !currentUser || !recoveryId) return;
    setRecovering(true);
    const isParticipantA = activeChat.participant_a === currentUser.id;
    await db.from("recoveries").update(isParticipantA ? { confirmed_by_a: true } : { confirmed_by_b: true }).eq("id", recoveryId);
    const { data: recovery } = await db.from("recoveries").select("*").eq("id", recoveryId).single();
    setShowRecoveryPrompt(false);
    setRecovering(false);
    if (recovery?.confirmed_by_a && recovery?.confirmed_by_b) {
  // Mark item as recovered so it disappears from browse
  await db.from("items").update({ status: "recovered" }).eq("id", activeChat.item_id);
  // Notify both users
  await db.from("notifications").insert({
    user_id: activeChat.participant_a,
    type: "recovery_confirmed",
    title: "Item Successfully Recovered! 🎉",
    body: `"${activeChat.item?.title}" has been marked as recovered.`,
    data: { chat_id: activeChat.id },
  });
  await db.from("notifications").insert({
    user_id: activeChat.participant_b,
    type: "recovery_confirmed",
    title: "Item Successfully Recovered! 🎉",
    body: `"${activeChat.item?.title}" has been marked as recovered.`,
    data: { chat_id: activeChat.id },
  });
  setShowRating(true);
} else {
      await db.from("messages").insert({ chat_id: activeChat.id, sender_id: currentUser.id, content: "✅ Recovery confirmed. Waiting for the other party to confirm.", type: "system" });
    }
  };

  const handleSubmitRating = async () => {
    if (!recoveryId || !activeChat || !currentUser) return;
    const isParticipantA = activeChat.participant_a === currentUser.id;
    await db.from("recoveries").update(isParticipantA ? { rating_by_a: rating } : { rating_by_b: rating }).eq("id", recoveryId);
    const otherId = isParticipantA ? activeChat.participant_b : activeChat.participant_a;
    const { data: otherUser } = await db.from("users").select("rating, rating_count").eq("id", otherId).single();
    if (otherUser) {
      const newCount = (otherUser.rating_count ?? 0) + 1;
      const newRating = ((otherUser.rating ?? 0) * (newCount - 1) + rating) / newCount;
      await db.from("users").update({ rating: newRating, rating_count: newCount }).eq("id", otherId);
    }
    setShowRating(false);
    router.push(`/recovery/success?recovery_id=${recoveryId}&chat_id=${activeChat?.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredChats = chats.filter(chat =>
    chat.other_user?.full_name?.toLowerCase().includes(searchInput.toLowerCase()) ||
    chat.item?.title?.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <main className="h-[calc(100vh-56px)] flex overflow-hidden" style={{ background: "#F0F4F8" }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .chat-bg {
          background-color: #F0F4F8;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23009A49' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>

      {/* SIDEBAR */}
      <aside className={`${showMobileChat ? "hidden md:flex" : "flex"} w-full md:w-[340px] flex-col shrink-0`}
        style={{ background: "#fff", borderRight: "1px solid #e2e8f0" }}>

        {/* Sidebar header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-black text-xl text-slate-900 mb-4" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
            <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 text-sm outline-none text-slate-900 placeholder:text-slate-300 rounded-xl"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }} />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loadingChats && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          )}
          {!loadingChats && filteredChats.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: "rgba(0,154,73,0.08)" }}>
                <Send size={22} className="text-primary" />
              </div>
              <p className="font-bold text-sm text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">When someone contacts you about an item, it will appear here.</p>
            </div>
          )}
          {filteredChats.map(chat => {
            const isActive = activeChat?.id === chat.id;
            const firstName = chat.other_user?.full_name?.split(" ")[0] ?? "?";
            return (
              <button key={chat.id} onClick={() => openChat(chat)}
                className="w-full px-4 py-3.5 flex gap-3 transition-all text-left"
                style={{
                  background: isActive ? "rgba(0,154,73,0.06)" : "transparent",
                  borderLeft: `3px solid ${isActive ? "#009A49" : "transparent"}`,
                }}>
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-base overflow-hidden shrink-0 relative"
                  style={{ background: isActive ? "#009A49" : "#f1f5f9", color: isActive ? "#fff" : "#64748b" }}>
                  {chat.other_user?.avatar_url
                    ? <img src={chat.other_user.avatar_url} className="w-full h-full object-cover" alt="" />
                    : firstName[0]}
                  {/* Online dot */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                    style={{ background: "#009A49" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm text-slate-900 truncate">{chat.other_user?.full_name ?? "Unknown"}</span>
                    <span className="text-[10px] text-slate-300 font-medium shrink-0 ml-2">
                      {chat.last_message ? timeAgo(chat.last_message.created_at) : timeAgo(chat.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate leading-snug">
                    {chat.last_message?.type === "image" ? "Photo" : chat.last_message?.content ?? "No messages yet"}
                  </p>
                  {chat.item && (
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{
                        background: chat.item.type === "found" ? "rgba(0,154,73,0.08)" : "rgba(206,17,38,0.08)",
                        color: chat.item.type === "found" ? "#009A49" : "#CE1126",
                      }}>
                      {chat.item.title}
                    </span>
                  )}
                </div>
                {chat.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 self-center"
                    style={{ background: "#009A49" }}>
                    {chat.unread_count > 9 ? "9+" : chat.unread_count}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* CHAT AREA */}
      <section className={`${!showMobileChat ? "hidden md:flex" : "flex"} flex-1 flex-col`}>

        {/* No chat selected */}
        {!activeChat && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8 chat-bg">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(0,154,73,0.1)", border: "1.5px dashed rgba(0,154,73,0.3)" }}>
              <Send size={26} className="text-primary" />
            </div>
            <p className="font-black text-lg text-slate-900" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
              Select a conversation
            </p>
            <p className="text-slate-400 text-sm max-w-xs">Choose a chat from the left to start messaging</p>
          </div>
        )}

        {activeChat && (
          <>
            {/* Chat header — WhatsApp/IG style */}
            <header className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", minHeight: "64px" }}>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowMobileChat(false)} className="md:hidden p-1.5 text-slate-400 hover:text-primary transition-colors">
                  <ArrowLeft size={20} />
                </button>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-black text-sm text-white relative"
                  style={{ background: "#009A49" }}>
                  {activeChat.other_user?.avatar_url
                    ? <img src={activeChat.other_user.avatar_url} className="w-full h-full object-cover" alt="" />
                    : activeChat.other_user?.full_name?.[0]}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-400" />
                </div>
                <div>
                  <p className="font-black text-sm text-slate-900 leading-none" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                    {activeChat.other_user?.full_name ?? "User"}
                  </p>
                  <p className="text-[10px] font-medium mt-0.5 flex items-center gap-1" style={{ color: "#009A49" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
                    Re: {activeChat.item?.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {activeChat.status !== "recovered" && (
                  <button onClick={() => setShowRecoveryPrompt(true)}
                    className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    style={{ background: "rgba(0,154,73,0.08)", color: "#009A49", border: "1px solid rgba(0,154,73,0.15)" }}>
                    <CheckCircle2 size={13} /> Item Recovered
                  </button>
                )}
                <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                  <MoreVertical size={17} />
                </button>
              </div>
            </header>

            {/* Messages area — chat background pattern like WhatsApp */}
            <div className="flex-1 overflow-y-auto no-scrollbar chat-bg px-4 py-4 space-y-2">
              {loadingMessages && (
                <div className="flex justify-center py-10">
                  <Loader2 size={22} className="animate-spin text-primary" />
                </div>
              )}
              {!loadingMessages && messages.map((msg, idx) => {
                const isMe = msg.sender_id === currentUser?.id;
                const isSystem = msg.type === "system";

                // Date separator
                const showDate = idx === 0 || (
                  new Date(msg.created_at).toDateString() !==
                  new Date(messages[idx - 1].created_at).toDateString()
                );

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-3">
                        <span className="text-[10px] font-bold text-slate-400 px-3 py-1 rounded-full"
                          style={{ background: "rgba(255,255,255,0.8)" }}>
                          {new Date(msg.created_at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                      </div>
                    )}

                    {isSystem ? (
                      <div className="flex justify-center my-2">
                        <div className="px-4 py-1.5 rounded-full flex items-center gap-2"
                          style={{ background: "rgba(0,154,73,0.08)", border: "1px solid rgba(0,154,73,0.15)" }}>
                          <ShieldCheck size={11} className="text-primary" />
                          <p className="text-[10px] font-bold text-primary">{msg.content}</p>
                        </div>
                      </div>
                    ) : msg.type === "image" ? (
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                        <div className="relative">
                          <img src={msg.content} alt="shared"
                            className="rounded-2xl object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                            style={{ maxWidth: "220px", maxHeight: "220px", width: "100%", height: "100%" }}
                            onClick={() => window.open(msg.content, "_blank")} />
                          <span className="absolute bottom-2 right-2 text-[9px] font-bold text-white/80"
                            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                        {/* Other user avatar — show only on first message in a group */}
                        {!isMe && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 mb-0.5"
                            style={{ background: "#009A49" }}>
                            {msg.sender?.full_name?.[0] ?? "?"}
                          </div>
                        )}
                        <div className="max-w-[72%] md:max-w-[60%]">
                          <div className={`px-4 py-2.5 shadow-sm ${isMe ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"}`}
                            style={{
                              background: isMe ? "#009A49" : "#fff",
                              color: isMe ? "#fff" : "#1e293b",
                              border: isMe ? "none" : "1px solid #e2e8f0",
                            }}>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMe ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] font-medium text-slate-300">{formatTime(msg.created_at)}</span>
                            {isMe && msg.read_at && <CheckCheck size={11} style={{ color: "#00ADB5" }} />}
                            {isMe && !msg.read_at && <CheckCheck size={11} className="text-slate-300" />}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar — WhatsApp style */}
            <footer className="px-4 py-3 shrink-0" style={{ background: "#fff", borderTop: "1px solid #e2e8f0" }}>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSend} />
              <div className="flex items-end gap-2">
                {/* Attach */}
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105"
                  style={{ background: "#f1f5f9", color: "#94a3b8" }}>
                  <Paperclip size={18} />
                </button>
                {/* Input */}
                <div className="flex-1 flex items-end rounded-2xl px-4 py-2.5 min-h-[44px]"
                  style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${activeChat.other_user?.full_name?.split(" ")[0] ?? ""}...`}
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-300 resize-none leading-relaxed"
                    style={{ maxHeight: "120px" }}
                  />
                </div>
                {/* Send */}
                <button onClick={handleSend} disabled={!message.trim() || sending}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                  style={{ background: "#009A49", color: "#fff", boxShadow: "0 4px 12px rgba(0,154,73,0.3)" }}>
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      {/* RECOVERY MODAL */}
      <AnimatePresence>
        {showRecoveryPrompt && activeChat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowRecoveryPrompt(false)}>
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 24, stiffness: 280 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm overflow-hidden"
              style={{ borderRadius: "24px", background: "#fff", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>

              {/* Green header band */}
              <div className="relative px-6 pt-8 pb-6 text-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, #e8f5ee 0%, #f0fdfa 100%)" }}>
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: "rgba(0,154,73,0.1)" }} />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full pointer-events-none"
                  style={{ background: "rgba(0,173,181,0.1)" }} />
                {/* Icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "#009A49", boxShadow: "0 8px 24px rgba(0,154,73,0.3)" }}>
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="relative z-10 font-black text-xl text-slate-900 leading-tight"
                  style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                  Item Recovered?
                </h3>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                {/* Item pill */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
                  style={{ background: "rgba(0,154,73,0.06)", border: "1px solid rgba(0,154,73,0.15)" }}>
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm font-bold text-slate-900 truncate">{activeChat.item?.title}</p>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  Confirm that this item has been successfully returned. Both parties must confirm before it is marked as recovered.
                </p>

                {/* How it works — 2 steps */}
                <div className="space-y-2 mb-6">
                  {[
                    { n: "1", text: "You confirm below" },
                    { n: "2", text: "Other party confirms in their chat" },
                  ].map(step => (
                    <div key={step.n} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                        style={{ background: "#00ADB5" }}>{step.n}</div>
                      <p className="text-xs font-medium text-slate-500">{step.text}</p>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button onClick={() => setShowRecoveryPrompt(false)}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-400 transition-all hover:bg-slate-50"
                    style={{ border: "1.5px solid #e2e8f0" }}>
                    Not Yet
                  </button>
                  <button onClick={handleConfirmRecovery} disabled={recovering}
                    className="flex-[2] py-3 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "#009A49", boxShadow: "0 6px 20px rgba(0,154,73,0.25)" }}>
                    {recovering
                      ? <><Loader2 size={15} className="animate-spin" /> Confirming...</>
                      : <><CheckCircle2 size={15} /> Yes, Confirmed!</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RATING MODAL */}
      <AnimatePresence>
        {showRating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6"><Star size={40} className="text-primary fill-primary" /></div>
              <h3 className="font-clash font-black text-3xl uppercase tracking-tighter mb-2">Rate Your Experience</h3>
              <p className="text-slate-500 text-sm mb-8">How was your experience with <span className="font-black text-dark">{activeChat?.other_user?.full_name}</span>?</p>
              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                    <Star size={36} className={star <= rating ? "text-secondary fill-secondary" : "text-slate-200"} />
                  </button>
                ))}
              </div>
              <button onClick={handleSubmitRating} disabled={rating === 0} className="w-full py-5 bg-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-dark transition-all disabled:opacity-40">
                Submit & Finish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <ChatPage />
    </Suspense>
  );
}