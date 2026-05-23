// src/app/browse/[id]/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, MessageSquare,
  ShieldAlert, EyeOff, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Share2, Flag,
  Star, Shield, Calendar, Tag
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ItemWithUser = {
  id: string; user_id: string; type: string; title: string;
  description: string | null; category: string | null; photos: string[];
  location_name: string | null; city: string | null; status: string;
  sensitivity: string; is_anonymous: boolean; date_occurred: string | null;
  created_at: string;
  user: {
    id: string; full_name: string; avatar_url: string | null;
    rating: number; recovery_count: number;
  } | null;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  }) + " · " + new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
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
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: { user } }, { data: itemData, error: itemError }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("items").select("*, user:users(id, full_name, avatar_url, rating, recovery_count)").eq("id", id).single(),
      ]);
      setCurrentUser(user);
      if (itemError || !itemData) setError("Item not found.");
      else setItem(itemData as ItemWithUser);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleClaim = async () => {
    if (!currentUser) { router.push("/auth"); return; }
    if (!item) return;
    setClaiming(true); setClaimError(null);
    try {
      const { data: existingChat } = await (supabase.from("chats") as any)
        .select("id").eq("item_id", item.id)
        .or(`participant_a.eq.${currentUser.id},participant_b.eq.${currentUser.id}`)
        .maybeSingle();
      if (existingChat) { router.push(`/chat?id=${existingChat.id}`); return; }
      const { data: newChat, error: chatError } = await (supabase.from("chats") as any)
        .insert({ item_id: item.id, participant_a: item.user_id, participant_b: currentUser.id, match_id: null })
        .select().single();
      if (chatError) throw new Error(chatError.message);
      await (supabase.from("items") as any).update({ status: "matched" }).eq("id", item.id);
      await (supabase.from("notifications") as any).insert({
        user_id: item.user_id, type: "chat_message",
        title: "Someone contacted you about your item",
        body: `A user wants to discuss your ${item.type} item: "${item.title}"`,
        data: { item_id: item.id, chat_id: newChat.id },
      });
      router.push(`/chat?id=${newChat.id}`);
    } catch (err: any) {
      setClaimError(err.message);
      setClaiming(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: item?.title, url });
    } else {
      navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const isOwnItem = currentUser && item && currentUser.id === item.user_id;
  const isSensitive = item?.sensitivity !== "normal";
  const photos = item?.photos ?? [];
  const isFound = item?.type === "found";

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "#061209" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-white" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Loading item</p>
      </div>
    </main>
  );

  if (error || !item) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#061209" }}>
      <AlertCircle size={32} className="text-red-400" />
      <p className="font-black text-xl text-white">{error || "Item not found"}</p>
      <button onClick={() => router.back()} className="text-primary font-black text-sm uppercase tracking-widest">Go Back</button>
    </main>
  );

  return (
    <main className="min-h-screen" style={{
      background: "#061209",
      backgroundImage: "linear-gradient(rgba(0,154,73,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,154,73,0.06) 1px,transparent 1px)",
      backgroundSize: "24px 24px",
    }}>
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-12">

        {/* Back button */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-8 transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <ArrowLeft size={15} /> Back to Browse
        </motion.button>

        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* LEFT — Photos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

            {/* Main photo */}
            <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: "4/3", background: "rgba(0,154,73,0.08)", border: "1px solid rgba(0,154,73,0.2)" }}>
              {photos.length > 0 ? (
                <>
                  <img src={photos[photoIndex]} alt={item.title}
                    className={`w-full h-full object-cover transition-all duration-500 ${isSensitive ? "blur-2xl scale-110" : ""}`}
                  />
                  {isSensitive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "rgba(0,0,0,0.5)" }}>
                      {item.sensitivity === "very_sensitive" ? <EyeOff size={36} className="text-white" /> : <ShieldAlert size={36} className="text-white" />}
                      <span className="text-white font-black text-sm uppercase tracking-widest">
                        {item.sensitivity === "very_sensitive" ? "High Risk Item" : "Sensitive Item"}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-8 text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Image hidden for privacy. Start a chat to see full details.
                      </span>
                    </div>
                  )}
                  {photos.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      <button onClick={() => setPhotoIndex(i => Math.max(0, i - 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <ChevronLeft size={16} />
                      </button>
                      <span className="px-3 py-1 rounded-full text-white text-[10px] font-black" style={{ background: "rgba(0,0,0,0.5)" }}>
                        {photoIndex + 1} / {photos.length}
                      </span>
                      <button onClick={() => setPhotoIndex(i => Math.min(photos.length - 1, i + 1))}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin size={48} style={{ color: "rgba(0,154,73,0.3)" }} />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((photo, i) => (
                  <button key={i} onClick={() => setPhotoIndex(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-all"
                    style={{ border: `2px solid ${photoIndex === i ? "#009A49" : "transparent"}`, opacity: photoIndex === i ? 1 : 0.5 }}>
                    <img src={photo} className={`w-full h-full object-cover ${isSensitive ? "blur-md" : ""}`} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick info pills */}
            <div className="flex flex-wrap gap-2">
              {item.category && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                  <Tag size={11} /> {item.category}
                </div>
              )}
              {item.city && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                  <MapPin size={11} /> {item.city}
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                <Clock size={11} /> {formatDate(item.created_at)}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-5">

            {/* Type badge + share */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                  style={isFound ? { background: "#FCD116", color: "#061209" } : { background: "#FF4D4D", color: "white" }}>
                  {item.type}
                </span>
                {item.sensitivity !== "normal" && (
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{ background: "rgba(252,209,22,0.15)", color: "#FCD116", border: "1px solid rgba(252,209,22,0.3)" }}>
                    {item.sensitivity === "very_sensitive" ? "High Risk" : "Sensitive"}
                  </span>
                )}
                {item.status === "recovered" && (
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{ background: "rgba(0,154,73,0.15)", color: "#009A49", border: "1px solid rgba(0,154,73,0.3)" }}>
                    Recovered
                  </span>
                )}
              </div>
              <button onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: shared ? "#009A49" : "rgba(255,255,255,0.5)" }}>
                <Share2 size={13} /> {shared ? "Copied!" : "Share"}
              </button>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                {item.title}
              </h1>
            </div>

            {/* Description */}
            {item.sensitivity !== "very_sensitive" && item.description && (
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: "#009A49" }}>Description</p>
                <p className="font-medium leading-relaxed text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{item.description}</p>
              </div>
            )}

            {/* Location + date details */}
            <div className="space-y-2.5">
              {item.location_name && (
                <div className="flex items-center gap-3 text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <MapPin size={15} className="text-primary shrink-0" />
                  {item.location_name}
                </div>
              )}
              <div className="flex items-center gap-3 text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Clock size={15} className="text-primary shrink-0" />
                Reported on {formatDate(item.created_at)}
              </div>
              {item.date_occurred && (
                <div className="flex items-center gap-3 text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Calendar size={15} style={{ color: "rgba(255,255,255,0.3)" }} className="shrink-0" />
                  {item.type === "lost" ? "Lost on" : "Found on"} {new Date(item.date_occurred).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
            </div>

            {/* Reporter card */}
            {!item.is_anonymous && item.user && (
              <div className="flex items-center gap-4 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0"
                  style={{ background: "rgba(0,154,73,0.2)", color: "#009A49" }}>
                  {item.user.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-white">{item.user.full_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: "#FCD116" }}>
                      <Star size={10} fill="#FCD116" /> {item.user.rating?.toFixed(1) ?? "New"}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {item.user.recovery_count ?? 0} recoveries
                    </span>
                  </div>
                </div>
                <Shield size={18} style={{ color: "rgba(0,154,73,0.4)" }} />
              </div>
            )}

            {/* CTA */}
            {!isOwnItem && item.status !== "recovered" && (
              <div className="space-y-3">
                {claimError && (
                  <div className="flex items-center gap-2 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{ background: "rgba(255,77,77,0.1)", border: "1px solid rgba(255,77,77,0.2)", color: "#FF4D4D" }}>
                    <AlertCircle size={13} /> {claimError}
                  </div>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleClaim} disabled={claiming}
                  className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                  style={{ background: "#009A49", color: "white", boxShadow: "0 8px 32px rgba(0,154,73,0.3)" }}
                >
                  {claiming
                    ? <><Loader2 size={18} className="animate-spin" /> Opening Chat...</>
                    : <><MessageSquare size={18} /> {item.type === "found" ? "This Is Mine" : "I Found This"}</>
                  }
                </motion.button>
                <p className="text-center text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
                  A private chat will open between you and the poster
                </p>
              </div>
            )}

            {isOwnItem && (
              <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(0,154,73,0.1)", border: "1px solid rgba(0,154,73,0.2)" }}>
                <p className="text-primary font-black text-sm uppercase tracking-widest">This is your listing</p>
              </div>
            )}

            {item.status === "recovered" && (
              <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(0,154,73,0.1)", border: "1px solid rgba(0,154,73,0.2)" }}>
                <p className="text-primary font-black text-sm uppercase tracking-widest">Item Recovered</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}