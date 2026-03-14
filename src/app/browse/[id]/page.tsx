"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, Flag, MessageSquare,
  ShieldAlert, EyeOff, User, Loader2, AlertCircle,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ItemRow, UserRow, ChatRow } from "@/types/database";

type ItemWithUser = ItemRow & {
  user: Pick<UserRow, "id" | "full_name" | "avatar_url" | "rating" | "recovery_count"> | null;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [item, setItem] = useState<ItemWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Fetch item + current user
  useEffect(() => {
    const load = async () => {
      const [{ data: { user } }, { data: itemData, error: itemError }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("items")
          .select("*, user:users(id, full_name, avatar_url, rating, recovery_count)")
          .eq("id", id)
          .single(),
      ]);

      setCurrentUser(user);
      if (itemError || !itemData) {
        setError("Item not found.");
      } else {
        setItem(itemData as ItemWithUser);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  // ── Claim / Contact handler ──
  const handleClaim = async () => {
    if (!currentUser) { router.push("/auth"); return; }
    if (!item) return;
    setClaiming(true);
    setClaimError(null);

    try {
      // Check if chat already exists for this item between these two users
      const { data: existingChat } = await supabase
        .from("chats")
        .select("id")
        .eq("item_id", item.id)
        .or(`participant_a.eq.${currentUser.id},participant_b.eq.${currentUser.id}`)
        .maybeSingle();

      if (existingChat) {
        router.push(`/chat?id=${existingChat.id}`);
        return;
      }

      // Create new chat
      const { data: newChat, error: chatError } = await supabase
        .from("chats")
        .insert({
          item_id:       item.id,
          participant_a: item.user_id,      // poster
          participant_b: currentUser.id,    // claimant
          match_id:      null,
        })
        .select()
        .single();

      if (chatError) throw new Error(chatError.message);

      // Update item status to matched
      await supabase
        .from("items")
        .update({ status: "matched" })
        .eq("id", item.id);

      // Notify the poster
      await supabase.from("notifications").insert({
        user_id: item.user_id,
        type:    "chat_message",
        title:   "Someone contacted you about your item",
        body:    `A user wants to discuss your ${item.type} item: "${item.title}"`,
        data:    { item_id: item.id, chat_id: newChat.id },
      });

      router.push(`/chat?id=${newChat.id}`);
    } catch (err: any) {
      setClaimError(err.message);
      setClaiming(false);
    }
  };

  const isOwnItem = currentUser && item && currentUser.id === item.user_id;
  const isSensitive = item?.sensitivity !== "normal";
  const photos = item?.photos ?? [];

  if (loading) return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </main>
  );

  if (error || !item) return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <AlertCircle size={32} className="text-red-400" />
      <p className="font-clash font-black text-2xl uppercase text-dark">{error || "Item not found"}</p>
      <button onClick={() => router.back()} className="text-primary font-black text-sm uppercase tracking-widest">Go Back</button>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">

      {/* Back button */}
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-black text-[10px] uppercase tracking-widest mb-8"
        >
          <ArrowLeft size={16} /> Back to Browse
        </button>

        <div className="grid md:grid-cols-2 gap-12">

          {/* ── LEFT: Photos ── */}
          <div className="space-y-4">
            <div className="aspect-square rounded-[3rem] overflow-hidden bg-slate-100 relative">
              {photos.length > 0 ? (
                <>
                  <img
                    src={photos[photoIndex]}
                    className={`w-full h-full object-cover transition-all duration-500 ${isSensitive ? "blur-2xl scale-110" : ""}`}
                    alt={item.title}
                  />
                  {isSensitive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      {item.sensitivity === "very_sensitive"
                        ? <EyeOff size={40} className="text-white" />
                        : <ShieldAlert size={40} className="text-white" />
                      }
                      <span className="text-white font-black text-sm uppercase tracking-widest">
                        {item.sensitivity === "very_sensitive" ? "High Risk Item" : "Sensitive Item"}
                      </span>
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest px-8 text-center">
                        Image hidden for privacy. Start a chat to see full details.
                      </span>
                    </div>
                  )}
                  {/* Photo navigation */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      <button
                        onClick={() => setPhotoIndex(i => Math.max(0, i - 1))}
                        className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-[10px] font-black">
                        {photoIndex + 1} / {photos.length}
                      </span>
                      <button
                        onClick={() => setPhotoIndex(i => Math.min(photos.length - 1, i + 1))}
                        className="w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin size={48} className="text-slate-300" />
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${photoIndex === i ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={photo} className={`w-full h-full object-cover ${isSensitive ? "blur-md" : ""}`} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Details ── */}
          <div className="space-y-8">
            {/* Type + sensitivity badges */}
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${item.type === "found" ? "bg-primary text-dark" : "bg-[#FF4D4D] text-white"}`}>
                {item.type}
              </span>
              {item.sensitivity !== "normal" && (
                <span className="px-4 py-1.5 bg-secondary/20 text-secondary rounded-full text-[9px] font-black uppercase tracking-widest">
                  {item.sensitivity === "very_sensitive" ? "High Risk" : "Sensitive"}
                </span>
              )}
              {item.status === "pending_review" && (
                <span className="px-4 py-1.5 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                  Pending Review
                </span>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-black font-clash uppercase tracking-tighter text-dark mb-4">
                {item.title}
              </h1>
              {item.category && (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  {item.category}
                </span>
              )}
            </div>

            {/* Description — hidden for very_sensitive until chat */}
            {item.sensitivity !== "very_sensitive" && item.description && (
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Description</p>
                <p className="text-slate-700 font-medium leading-relaxed text-sm">{item.description}</p>
              </div>
            )}

            {/* Meta info */}
            <div className="space-y-3">
              {item.location_name && (
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <MapPin size={16} className="text-primary" />
                  {item.location_name}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                <Clock size={16} className="text-primary" />
                Reported {timeAgo(item.created_at)}
              </div>
              {item.date_occurred && (
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <Clock size={16} className="text-slate-300" />
                  {item.type === "lost" ? "Lost on" : "Found on"} {new Date(item.date_occurred).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
            </div>

            {/* Poster info — hidden if anonymous */}
            {!item.is_anonymous && item.user && (
              <div className="flex items-center gap-4 bg-white rounded-[2rem] p-5 border border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg">
                  {item.user.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-tight text-dark">{item.user.full_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ⭐ {item.user.rating?.toFixed(1) ?? "New"} · {item.user.recovery_count ?? 0} recoveries
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            {!isOwnItem && item.status !== "recovered" && (
              <div className="space-y-3">
                {claimError && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest bg-red-50 rounded-2xl p-4">
                    <AlertCircle size={14} /> {claimError}
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full py-6 bg-dark text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary hover:text-dark transition-all shadow-2xl shadow-dark/10 disabled:opacity-50"
                >
                  {claiming ? (
                    <><Loader2 size={20} className="animate-spin" /> Opening Chat...</>
                  ) : (
                    <><MessageSquare size={20} /> {item.type === "found" ? "This Is Mine" : "I Found This"}</>
                  )}
                </motion.button>
                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  A private chat will open between you and the poster
                </p>
              </div>
            )}

            {isOwnItem && (
              <div className="bg-primary/10 rounded-[2rem] p-6 text-center">
                <p className="text-primary font-black text-sm uppercase tracking-widest">This is your listing</p>
              </div>
            )}

            {item.status === "recovered" && (
              <div className="bg-primary/10 rounded-[2rem] p-6 text-center">
                <p className="text-primary font-black text-sm uppercase tracking-widest">✅ Item Recovered</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}