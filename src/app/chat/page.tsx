// src/app/chat/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MoreVertical, Send, Paperclip,
  ShieldCheck, CheckCheck, Clock, Loader2,
  AlertCircle, ArrowLeft, ImageIcon, MapPin,
  CheckCircle2, Star, X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRow, ItemRow, MessageRow } from "@/types/database";

// ── TYPES ──────────────────────────────────────────────────
type ChatListItem = {
  id: string;
  item_id: string;
  participant_a: string;
  participant_b: string;
  status: string;
  created_at: string;
  item: Pick<ItemRow, "id" | "title" | "type" | "photos"> | null;
  other_user: Pick<UserRow, "id" | "full_name" | "avatar_url" | "rating"> | null;
  last_message: MessageRow | null;
  unread_count: number;
};

type MessageWithSender = MessageRow & {
  sender: Pick<UserRow, "id" | "full_name" | "avatar_url"> | null;
};
// Note: we could optimize by not fetching sender for every message, but it's simpler for this example

// ── HELPERS ────────────────────────────────────────────────
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

// ── MAIN PAGE ───────────────────────────────────────────────
export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
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

  // Recovery flow state
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [recoveryId, setRecoveryId] = useState<string | null>(null);

  // ── Get current user ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push("/auth"); return; }
      setCurrentUser(user);
    });
  }, []);

  // ── Fetch all chats for current user ──
  const fetchChats = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("chats")
      .select(`
        *,
        item:items(id, title, type, photos),
        messages(id, content, created_at, sender_id, read_at, type)
      `)
      .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error || !data) return;

    // Enrich with other user + unread count
    const enriched: ChatListItem[] = await Promise.all(
      data.map(async (chat: any) => {
        const otherId = chat.participant_a === userId
          ? chat.participant_b
          : chat.participant_a;

        const { data: otherUser } = await supabase
          .from("users")
          .select("id, full_name, avatar_url, rating")
          .eq("id", otherId)
          .single();

        const msgs: MessageRow[] = chat.messages ?? [];
        const sorted = [...msgs].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const lastMessage = sorted[0] ?? null;
        const unreadCount = msgs.filter(
          m => m.sender_id !== userId && !m.read_at
        ).length;

        return {
          ...chat,
          other_user: otherUser ?? null,
          last_message: lastMessage,
          unread_count: unreadCount,
          messages: undefined,
        };
      })
    );

    // Sort by last message time
    enriched.sort((a, b) => {
      const aTime = a.last_message?.created_at ?? a.created_at;
      const bTime = b.last_message?.created_at ?? b.created_at;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    setChats(enriched);
    setLoadingChats(false);

    // Auto-open chat from URL param (?id=...)
    const chatIdParam = searchParams.get("id");
    if (chatIdParam) {
      const target = enriched.find(c => c.id === chatIdParam);
      if (target) openChat(target);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentUser) fetchChats(currentUser.id);
  }, [currentUser]);

  // ── Realtime: update chat list on new message ──
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("chat-list-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchChats(currentUser.id)
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chats" },
        () => fetchChats(currentUser.id)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  // ── Open a chat and load its messages ──
  const openChat = async (chat: ChatListItem) => {
    setActiveChat(chat);
    setShowMobileChat(true);
    setLoadingMessages(true);
    setMessages([]);

    const { data } = await supabase
      .from("messages")
      .select("*, sender:users(id, full_name, avatar_url)")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: true });

    setMessages((data as MessageWithSender[]) ?? []);
    setLoadingMessages(false);

    // Mark all as read
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("chat_id", chat.id)
      .neq("sender_id", currentUser?.id)
      .is("read_at", null);

    // Update unread count in list
    setChats(prev => prev.map(c =>
      c.id === chat.id ? { ...c, unread_count: 0 } : c
    ));

    // Subscribe to new messages for this chat
    const channel = supabase
      .channel(`messages-${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chat.id}`,
        },
        async (payload) => {
          const { data: newMsg } = await supabase
            .from("messages")
            .select("*, sender:users(id, full_name, avatar_url)")
            .eq("id", payload.new.id)
            .single();

          if (newMsg) {
            setMessages(prev => [...prev, newMsg as MessageWithSender]);
            // Mark as read immediately if chat is open
            if (newMsg.sender_id !== currentUser?.id) {
              await supabase
                .from("messages")
                .update({ read_at: new Date().toISOString() })
                .eq("id", newMsg.id);
            }
          }
        }
      )
      .subscribe();

    // Check if recovery record exists
    const { data: recovery } = await supabase
      .from("recoveries")
      .select("*")
      .eq("chat_id", chat.id)
      .maybeSingle();

    if (recovery) {
      setRecoveryId(recovery.id);
      const myConfirmed = recovery.participant_a === currentUser?.id
        ? recovery.confirmed_by_a
        : recovery.confirmed_by_b;
      if (!myConfirmed && chat.status !== "recovered") {
        setShowRecoveryPrompt(true);
      }
    }
  };

  // ── Auto scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──
  const handleSend = async () => {
    if (!message.trim() || !activeChat || !currentUser || sending) return;
    setSending(true);
    const content = message.trim();
    setMessage("");

    await supabase.from("messages").insert({
      chat_id:   activeChat.id,
      sender_id: currentUser.id,
      content,
      type:      "text",
    });

    // Notify other participant
    const otherId = activeChat.participant_a === currentUser.id
      ? activeChat.participant_b
      : activeChat.participant_a;

    await supabase.from("notifications").insert({
      user_id: otherId,
      type:    "chat_message",
      title:   "New message",
      body:    content.slice(0, 80),
      data:    { chat_id: activeChat.id },
    });

    setSending(false);
  };

  // ── Send photo ──
  const handlePhotoSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !currentUser) return;

    const path = `chats/${activeChat.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("item-photos")
      .upload(path, file);
    if (error) return;

    const { data: { publicUrl } } = supabase.storage
      .from("item-photos")
      .getPublicUrl(path);

    await supabase.from("messages").insert({
      chat_id:   activeChat.id,
      sender_id: currentUser.id,
      content:   publicUrl,
      type:      "image",
    });
  };

  // ── Confirm recovery ──
  const handleConfirmRecovery = async () => {
    if (!activeChat || !currentUser || !recoveryId) return;
    setRecovering(true);

    const isParticipantA = activeChat.participant_a === currentUser.id;
    await supabase
      .from("recoveries")
      .update(isParticipantA
        ? { confirmed_by_a: true }
        : { confirmed_by_b: true }
      )
      .eq("id", recoveryId);

    // Check if other party already confirmed
    const { data: recovery } = await supabase
      .from("recoveries")
      .select("*")
      .eq("id", recoveryId)
      .single();

    setShowRecoveryPrompt(false);
    setRecovering(false);

    if (recovery?.confirmed_by_a && recovery?.confirmed_by_b) {
      // Both confirmed — show rating
      setShowRating(true);
    } else {
      // Send system message
      await supabase.from("messages").insert({
        chat_id:   activeChat.id,
        sender_id: currentUser.id,
        content:   "✅ Recovery confirmed. Waiting for the other party to confirm.",
        type:      "system",
      });
    }
  };

  // ── Submit rating ──
  const handleSubmitRating = async () => {
    if (!recoveryId || !activeChat || !currentUser) return;
    const isParticipantA = activeChat.participant_a === currentUser.id;

    await supabase
      .from("recoveries")
      .update(isParticipantA
        ? { rating_by_a: rating }
        : { rating_by_b: rating }
      )
      .eq("id", recoveryId);

    // Update other user's average rating
    const otherId = isParticipantA
      ? activeChat.participant_b
      : activeChat.participant_a;

    const { data: otherUser } = await supabase
      .from("users")
      .select("rating, rating_count")
      .eq("id", otherId)
      .single();

    if (otherUser) {
      const newCount = (otherUser.rating_count ?? 0) + 1;
      const newRating = ((otherUser.rating ?? 0) * (newCount - 1) + rating) / newCount;
      await supabase
        .from("users")
        .update({ rating: newRating, rating_count: newCount })
        .eq("id", otherId);
    }

    setShowRating(false);
    router.push(`/recovery/success?recovery_id=${recoveryId}&chat_id=${activeChat?.id}`);
  };

  // ── Enter key ──
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Filter chats by search ──
  const filteredChats = chats.filter(chat =>
    chat.other_user?.full_name?.toLowerCase().includes(searchInput.toLowerCase()) ||
    chat.item?.title?.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <main className="h-[calc(100vh-80px)] bg-white flex overflow-hidden mt-20">

      {/* ════ LEFT SIDEBAR: CHAT LIST ════ */}
      <aside className={`${showMobileChat ? "hidden md:flex" : "flex"} w-full md:w-[380px] flex-col border-r border-slate-100 shrink-0`}>

        <div className="p-6 border-b border-slate-100">
          <h2 className="font-clash font-black text-2xl uppercase tracking-tighter text-dark mb-4">Messages</h2>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-12 pr-6 py-3 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 ring-primary/20 transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {loadingChats && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          )}

          {!loadingChats && filteredChats.length === 0 && (
            <div className="text-center py-20 px-6">
              <p className="font-clash font-black text-xl uppercase text-slate-300 tracking-tighter">No conversations yet</p>
              <p className="text-slate-400 text-sm mt-2">When someone contacts you about an item, it'll appear here.</p>
            </div>
          )}

          {filteredChats.map(chat => (
            <button
              key={chat.id}
              onClick={() => openChat(chat)}
              className={`w-full p-5 flex gap-4 transition-all border-l-4 ${activeChat?.id === chat.id ? "bg-primary/5 border-primary" : "bg-white border-transparent hover:bg-slate-50"}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg overflow-hidden">
                  {chat.other_user?.avatar_url ? (
                    <img src={chat.other_user.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    chat.other_user?.full_name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-sm text-dark truncate">
                    {chat.other_user?.full_name ?? "Unknown"}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 ml-2">
                    {chat.last_message ? timeAgo(chat.last_message.created_at) : timeAgo(chat.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-2">
                  {chat.last_message?.type === "image"
                    ? "📷 Photo"
                    : chat.last_message?.content ?? "No messages yet"
                  }
                </p>
                {chat.item && (
                  <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-black uppercase tracking-tighter text-slate-400">
                    {chat.item.type === "lost" ? "🔴" : "🟢"} {chat.item.title}
                  </span>
                )}
              </div>

              {/* Unread badge */}
              {chat.unread_count > 0 && (
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-dark shrink-0">
                  {chat.unread_count > 9 ? "9+" : chat.unread_count}
                </div>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* ════ RIGHT: ACTIVE CHAT ════ */}
      <section className={`${!showMobileChat ? "hidden md:flex" : "flex"} flex-1 flex-col relative bg-[#FDFDFD]`}>

        {/* No chat selected */}
        {!activeChat && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center">
              <Send size={32} className="text-primary" />
            </div>
            <p className="font-clash font-black text-2xl uppercase tracking-tighter text-dark">Select a conversation</p>
            <p className="text-slate-400 text-sm max-w-xs">Choose a chat from the left to start messaging</p>
          </div>
        )}

        {activeChat && (
          <>
            {/* DM Header — unchanged layout */}
            <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10 shrink-0">
              <div className="flex items-center gap-4">
                {/* Mobile back button */}
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-2 text-slate-400 hover:text-dark transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="w-10 h-10 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center font-black text-primary">
                  {activeChat.other_user?.avatar_url ? (
                    <img src={activeChat.other_user.avatar_url} className="w-full h-full object-cover" alt="" />
                  ) : (
                    activeChat.other_user?.full_name?.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <h3 className="font-black text-sm uppercase tracking-tight text-dark">
                    {activeChat.other_user?.full_name ?? "User"}
                  </h3>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    Re: {activeChat.item?.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Confirm recovery button */}
                {activeChat.status !== "recovered" && (
                  <button
                    onClick={() => setShowRecoveryPrompt(true)}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-dark transition-all"
                  >
                    <CheckCircle2 size={14} /> Item Recovered
                  </button>
                )}
                <button className="p-3 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 no-scrollbar">

              {loadingMessages && (
                <div className="flex justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              )}

              {!loadingMessages && messages.map(msg => {
                const isMe = msg.sender_id === currentUser?.id;
                const isSystem = msg.type === "system";

                if (isSystem) return (
                  <div key={msg.id} className="flex justify-center">
                    <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                      <Clock size={14} className="text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                );

                if (msg.type === "image") return (
                  <div key={msg.id} className={`flex gap-4 max-w-[70%] ${isMe ? "flex-row-reverse ml-auto" : ""}`}>
                    <img
                      src={msg.content}
                      className="w-56 h-56 object-cover rounded-[2rem] shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                      alt="shared"
                      onClick={() => window.open(msg.content, "_blank")}
                    />
                  </div>
                );

                return (
                  <div key={msg.id} className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${isMe ? "flex-row-reverse ml-auto" : ""}`}>
                    {/* Avatar */}
                    {!isMe && (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0 self-end overflow-hidden flex items-center justify-center text-[10px] font-black text-slate-400">
                        {msg.sender?.full_name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Bubble */}
                    {isMe ? (
                      <div className="bg-dark p-5 rounded-3xl rounded-br-none shadow-xl shadow-dark/10">
                        <p className="text-sm font-medium text-primary leading-relaxed">{msg.content}</p>
                        <div className="flex justify-end items-center gap-1 mt-2">
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                            {formatTime(msg.created_at)}
                          </p>
                          {msg.read_at && <CheckCheck size={12} className="text-primary" />}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-bl-none shadow-sm">
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">{msg.content}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input — unchanged layout */}
            <footer className="p-6 md:p-8 bg-white border-t border-slate-100 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSend}
              />
              <div className="max-w-4xl mx-auto flex items-center gap-4 bg-slate-50 border border-slate-200 p-2 rounded-[2.5rem]">
                <div className="flex items-center">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-slate-400 hover:text-dark transition-colors"
                  >
                    <Paperclip size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeChat.other_user?.full_name?.split(" ")[0] ?? ""}...`}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2 text-dark placeholder:text-slate-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="bg-dark text-primary p-4 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-dark/20 disabled:opacity-40"
                >
                  {sending
                    ? <Loader2 size={18} className="animate-spin" />
                    : <Send size={18} strokeWidth={3} />
                  }
                </button>
              </div>
            </footer>
          </>
        )}
      </section>

      {/* ════ RECOVERY CONFIRMATION MODAL ════ */}
      <AnimatePresence>
        {showRecoveryPrompt && activeChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
            onClick={() => setShowRecoveryPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
              <h3 className="font-clash font-black text-3xl uppercase tracking-tighter mb-3">
                Confirm Recovery
              </h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Confirm that <span className="font-black text-dark">{activeChat.item?.title}</span> has been successfully returned. Both parties must confirm.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRecoveryPrompt(false)}
                  className="flex-1 py-4 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Not Yet
                </button>
                <button
                  onClick={handleConfirmRecovery}
                  disabled={recovering}
                  className="flex-[2] py-4 bg-primary text-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {recovering
                    ? <Loader2 size={14} className="animate-spin" />
                    : <CheckCircle2 size={14} />
                  }
                  Yes, Confirmed!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════ RATING MODAL ════ */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Star size={40} className="text-primary fill-primary" />
              </div>
              <h3 className="font-clash font-black text-3xl uppercase tracking-tighter mb-2">
                Rate Your Experience
              </h3>
              <p className="text-slate-500 text-sm mb-8">
                How was your experience with{" "}
                <span className="font-black text-dark">
                  {activeChat?.other_user?.full_name}
                </span>?
              </p>

              {/* Stars */}
              <div className="flex justify-center gap-3 mb-8">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={star <= rating ? "text-secondary fill-secondary" : "text-slate-200"}
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmitRating}
                disabled={rating === 0}
                className="w-full py-5 bg-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-dark transition-all disabled:opacity-40"
              >
                Submit & Finish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}