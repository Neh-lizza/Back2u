// src/components/MatchAndChat.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, X, Send, ShieldCheck,
  ImageIcon, Sparkles, Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type MatchWithItems = any;
type ActiveChat = {
  id: string;
  item_id: string;
  participant_a: string;
  participant_b: string;
  other_user: { id: string; full_name: string; avatar_url: string | null } | null;
  item: { id: string; title: string; type: string; photos: string[] } | null;
};
type MessageWithSender = {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  type: string;
  read_at: string | null;
  created_at: string;
  sender: { id: string; full_name: string; avatar_url: string | null } | null;
};

export default function MatchSystem() {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingMatch, setPendingMatch] = useState<MatchWithItems | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      setCurrentUser(user);
    });
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const checkExistingMatches = async () => {
      const { data } = await db
        .from("matches")
        .select(`*, lost_item:items!matches_lost_item_id_fkey(*, user:users(id, full_name, avatar_url)), found_item:items!matches_found_item_id_fkey(*, user:users(id, full_name, avatar_url))`)
        .eq("status", "pending")
        .or(`lost_item.user_id.eq.${currentUser.id},found_item.user_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setPendingMatch(data);
        setShowMatch(true);
      }
    };

    checkExistingMatches();

    const channel = supabase
      .channel("match-system")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "matches" },
        async (payload: any) => {
          const { data } = await db
            .from("matches")
            .select(`*, lost_item:items!matches_lost_item_id_fkey(*, user:users(id, full_name, avatar_url)), found_item:items!matches_found_item_id_fkey(*, user:users(id, full_name, avatar_url))`)
            .eq("id", payload.new.id)
            .single();

          if (!data) return;
          const isInvolved = data.lost_item?.user_id === currentUser.id || data.found_item?.user_id === currentUser.id;
          if (isInvolved) { setPendingMatch(data); setShowMatch(true); }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser]);

  const handleOpenChatFromMatch = async () => {
    if (!pendingMatch || !currentUser) return;
    setOpeningChat(true);

    try {
      const myItem = pendingMatch.lost_item?.user_id === currentUser.id ? pendingMatch.lost_item : pendingMatch.found_item;
      const otherItem = pendingMatch.lost_item?.user_id === currentUser.id ? pendingMatch.found_item : pendingMatch.lost_item;
      if (!myItem || !otherItem) return;

      const { data: existingChat } = await db.from("chats").select("*").eq("match_id", pendingMatch.id).maybeSingle();
      let chatId = existingChat?.id;

      if (!chatId) {
        const { data: newChat, error } = await db
          .from("chats")
          .insert({ match_id: pendingMatch.id, item_id: myItem.id, participant_a: myItem.user_id, participant_b: otherItem.user_id })
          .select()
          .single();
        if (error) throw error;
        chatId = newChat.id;
        await db.from("matches").update({ status: "accepted" }).eq("id", pendingMatch.id);
        await db.from("messages").insert({ chat_id: chatId, sender_id: currentUser.id, content: `Match accepted! ${pendingMatch.score}% match for "${myItem.title}". Let's connect.`, type: "system" });
      }

      await loadChat(chatId, otherItem.user_id);
      setShowMatch(false);
      setShowChat(true);
    } catch (err) {
      console.error(err);
    } finally {
      setOpeningChat(false);
    }
  };

  const loadChat = async (chatId: string, otherUserId: string) => {
    const [{ data: chatData }, { data: otherUser }, { data: msgs }] = await Promise.all([
      db.from("chats").select("*, item:items(id, title, type, photos)").eq("id", chatId).single(),
      db.from("users").select("id, full_name, avatar_url").eq("id", otherUserId).single(),
      db.from("messages").select("*, sender:users(id, full_name, avatar_url)").eq("chat_id", chatId).order("created_at", { ascending: true }),
    ]);

    if (chatData) {
      setActiveChat({ ...chatData, other_user: otherUser, item: chatData.item } as ActiveChat);
    }
    setMessages((msgs as MessageWithSender[]) ?? []);

    await db.from("messages").update({ read_at: new Date().toISOString() }).eq("chat_id", chatId).neq("sender_id", currentUser?.id).is("read_at", null);
    subscribeToChat(chatId);
  };

  const subscribeToChat = (chatId: string) => {
    supabase.channel(`chat-${chatId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        async (payload: any) => {
          const { data } = await db.from("messages").select("*, sender:users(id, full_name, avatar_url)").eq("id", payload.new.id).single();
          if (data) {
            setMessages((prev: MessageWithSender[]) => [...prev, data as MessageWithSender]);
            if (data.sender_id !== currentUser?.id) {
              await db.from("messages").update({ read_at: new Date().toISOString() }).eq("id", data.id);
            }
          }
        }
      )
      .subscribe();
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !activeChat || !currentUser || sending) return;
    setSending(true);
    const content = message.trim();
    setMessage("");
    await db.from("messages").insert({ chat_id: activeChat.id, sender_id: currentUser.id, content, type: "text" });
    const otherId = activeChat.participant_a === currentUser.id ? activeChat.participant_b : activeChat.participant_a;
    await db.from("notifications").insert({ user_id: otherId, type: "chat_message", title: "New message", body: content.slice(0, 60), data: { chat_id: activeChat.id } });
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const goToFullChat = () => {
    if (activeChat) { setShowChat(false); router.push(`/chat?id=${activeChat.id}`); }
  };

  const myMatchItem = pendingMatch
    ? (pendingMatch.lost_item?.user_id === currentUser?.id ? pendingMatch.lost_item : pendingMatch.found_item)
    : null;
  const otherMatchItem = pendingMatch
    ? (pendingMatch.lost_item?.user_id === currentUser?.id ? pendingMatch.found_item : pendingMatch.lost_item)
    : null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center p-6">

      <AnimatePresence>
        {showMatch && pendingMatch && (
          <motion.div initial={{ scale: 0.8, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="pointer-events-auto w-full max-w-md rounded-[3rem] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.2)] border-2 border-primary/30 relative overflow-hidden bg-white/95 backdrop-blur-2xl">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/30 mb-6 rotate-3">
                <Sparkles className="text-dark" size={32} />
              </div>
              <div className="mb-3 px-4 py-1 bg-primary/10 border border-primary/20 rounded-full">
                <span className="text-primary font-black text-xs uppercase tracking-widest">{pendingMatch.score}% Match</span>
              </div>
              <h2 className="font-clash text-3xl font-black uppercase tracking-tighter mb-2">It's a Match!</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 px-4">
                We found a <span className="text-dark font-black">{pendingMatch.score}% match</span> for your <span className="text-primary font-black italic">{myMatchItem?.title}</span>
              </p>
              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Your Item</p>
                  {myMatchItem?.photos?.[0] ? <img src={myMatchItem.photos[0]} className="w-full h-20 object-cover rounded-xl grayscale" alt="" /> : <div className="w-full h-20 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold uppercase">No photo</div>}
                  <p className="text-[9px] font-black uppercase tracking-tight text-dark mt-2 truncate">{myMatchItem?.title}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border-2 border-primary shadow-inner">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary mb-2">{otherMatchItem?.type === "found" ? "Found Item" : "Lost Item"}</p>
                  {otherMatchItem?.photos?.[0] ? <img src={otherMatchItem.photos[0]} className="w-full h-20 object-cover rounded-xl" alt="" /> : <div className="w-full h-20 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xs font-bold uppercase">No photo</div>}
                  <p className="text-[9px] font-black uppercase tracking-tight text-dark mt-2 truncate">{otherMatchItem?.title}</p>
                </div>
              </div>
              <div className="flex flex-col w-full gap-3">
                <button onClick={handleOpenChatFromMatch} disabled={openingChat} className="w-full py-5 bg-dark text-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-60">
                  {openingChat ? <><Loader2 size={18} className="animate-spin" /> Opening Chat...</> : <><MessageSquare size={18} /> Chat with Finder</>}
                </button>
                <button onClick={() => setShowMatch(false)} className="text-slate-400 text-[10px] font-black uppercase tracking-widest py-2 hover:text-dark transition-colors">Dismiss for now</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChat && activeChat && (
          <motion.div initial={{ opacity: 0, x: 50, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="pointer-events-auto absolute bottom-10 right-10 w-[420px] h-[600px] rounded-[3.5rem] shadow-2xl flex flex-col border border-white bg-white/98 backdrop-blur-2xl overflow-hidden">
            <header className="p-6 pb-4 border-b border-black/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg overflow-hidden">
                    {activeChat.other_user?.avatar_url ? <img src={activeChat.other_user.avatar_url} className="w-full h-full object-cover" alt="" /> : activeChat.other_user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-white rounded-full" />
                </div>
                <div>
                  <h4 className="font-clash font-black uppercase text-sm tracking-tight text-dark">{activeChat.other_user?.full_name ?? "User"}</h4>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase text-primary tracking-widest">
                    <ShieldCheck size={10} /> Verified
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={goToFullChat} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-dark transition-colors text-[9px] font-black uppercase tracking-widest">Full</button>
                <button onClick={() => setShowChat(false)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-dark transition-colors"><X size={15} /></button>
              </div>
            </header>

            {activeChat.item && (
              <div className="px-6 py-3 bg-primary/5 border-b border-primary/10 flex items-center gap-3 shrink-0">
                <div className={`w-2 h-2 rounded-full ${activeChat.item.type === "found" ? "bg-primary" : "bg-[#FF4D4D]"}`} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">Re: {activeChat.item.title}</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              <div className="flex justify-center">
                <span className="px-4 py-1.5 bg-slate-50 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">🔒 Chat is private</span>
              </div>
              {messages.map(msg => {
                const isMe = msg.sender_id === currentUser?.id;
                const isSystem = msg.type === "system";
                if (isSystem) return (
                  <div key={msg.id} className="flex justify-center">
                    <span className="px-4 py-1.5 bg-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">{msg.content}</span>
                  </div>
                );
                if (msg.type === "image") return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""} max-w-[85%] ${isMe ? "ml-auto" : ""}`}>
                    <img src={msg.content} className="w-48 h-48 object-cover rounded-2xl shadow-sm" alt="shared image" />
                  </div>
                );
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""} max-w-[85%] ${isMe ? "ml-auto" : ""}`}>
                    {!isMe && <div className="w-7 h-7 rounded-lg bg-slate-100 shrink-0 self-end overflow-hidden flex items-center justify-center text-[10px] font-black text-slate-400">{msg.sender?.full_name?.charAt(0).toUpperCase()}</div>}
                    <div className={`p-4 rounded-2xl ${isMe ? "bg-dark text-primary rounded-br-none" : "bg-slate-100 text-slate-700 rounded-bl-none"}`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                      <p className={`text-[8px] font-bold mt-1 uppercase tracking-widest ${isMe ? "text-white/30 text-right" : "text-slate-400"}`}>
                        {new Date(msg.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        {msg.read_at && isMe && " · ✓✓"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t border-slate-100 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-2 flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSend} />
                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-dark transition-colors"><ImageIcon size={18} /></button>
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2 text-dark placeholder:text-slate-400" />
                <button onClick={handleSend} disabled={!message.trim() || sending} className="p-3 bg-dark text-primary rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all disabled:opacity-40">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={3} />}
                </button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}