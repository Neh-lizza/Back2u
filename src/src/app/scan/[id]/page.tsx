// src/app/scan/[id]/page.tsx
// NEW FILE
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Clock, MessageCircle, AlertTriangle, CheckCircle, Search, Loader2, QrCode } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Item = {
  id: string;
  type: string;
  title: string;
  description: string;
  photos: string[];
  location_name: string | null;
  city: string | null;
  category: string | null;
  created_at: string;
  is_missing_person: boolean;
  sensitivity: string;
  user: { id: string; full_name: string } | null;
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function ScanLandingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await (supabase as any)
        .from("items")
        .select("*, user:users(id, full_name)")
        .eq("id", id)
        .single();

      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setItem(data);
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#061209" }}>
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ background: "#061209" }}>
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <h1 className="text-2xl font-black text-white mb-2">Item Not Found</h1>
      <p className="text-white/40 text-sm mb-6">This QR code may be expired or invalid.</p>
      <Link href="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm">Go to Back2U</Link>
    </div>
  );

  if (!item) return null;

  const isFound = item.type === "found";
  const isMissing = item.is_missing_person;
  const isSensitive = item.sensitivity === "sensitive" || item.sensitivity === "very_sensitive";
  const firstPhoto = item.photos?.[0];

  const badgeColor = isMissing ? "#CE1126" : isFound ? "#FCD116" : "#FF4D4D";
  const badgeText = isMissing ? "Missing Person" : isFound ? "Found Item" : "Lost Item";
  const badgeTextColor = isFound && !isMissing ? "#061209" : "white";

  const message = isMissing
    ? `Someone is looking for this person. If you have any information, please contact the reporter immediately.`
    : isFound
    ? `Someone found this item and reported it on Back2U. If this belongs to you, contact the finder now.`
    : `This item was reported lost on Back2U. If you found it, please contact the owner.`;

  return (
    <main className="min-h-screen" style={{ background: "#061209" }}>
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
      `}</style>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-black text-white tracking-tight">back2u</span>
          <span className="text-2xl font-black leading-none" style={{ color: "#009A49" }}>.</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
          <QrCode size={12} className="text-primary" />
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">QR Scan</span>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 py-8">

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide"
            style={{ background: badgeColor, color: badgeTextColor }}>
            {isMissing ? <AlertTriangle size={11} /> : isFound ? <CheckCircle size={11} /> : <Search size={11} />}
            {badgeText}
          </div>
          {item.category && (
            <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/5 text-white/40 border border-white/10 capitalize">
              {item.category}
            </span>
          )}
        </motion.div>

        {/* Photo */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="relative w-full rounded-3xl overflow-hidden mb-6"
          style={{ aspectRatio: "4/3", background: "rgba(255,255,255,0.03)" }}>
          {firstPhoto ? (
            <Image src={firstPhoto} alt={item.title} fill sizes="400px"
              className={`object-cover ${isSensitive ? "blur-2xl scale-110" : ""}`} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Search size={40} className="text-white/10" />
            </div>
          )}
          {isSensitive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Sensitive Content</span>
            </div>
          )}
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mb-4">
          <h1 className="text-3xl font-black text-white leading-tight mb-2" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
            {item.title}
          </h1>
          {item.description && (
            <p className="text-white/40 text-sm font-medium leading-relaxed">{item.description}</p>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 space-y-3">
          {(item.location_name || item.city) && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin size={13} className="text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Location</p>
                <p className="text-white text-sm font-semibold">{item.location_name || item.city}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
              <Clock size={13} className="text-white/40" />
            </div>
            <div>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Reported On</p>
              <p className="text-white text-sm font-semibold">{formatDate(item.created_at)}</p>
            </div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-4 mb-6 border"
          style={{
            background: isMissing ? "rgba(206,17,38,0.08)" : isFound ? "rgba(0,154,73,0.08)" : "rgba(255,77,77,0.08)",
            borderColor: isMissing ? "rgba(206,17,38,0.3)" : isFound ? "rgba(0,154,73,0.3)" : "rgba(255,77,77,0.3)",
          }}>
          <p className="text-sm font-medium leading-relaxed"
            style={{ color: isMissing ? "#ff6b6b" : isFound ? "#4ade80" : "#ff9999" }}>
            {message}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="space-y-3">
          <button onClick={() => router.push(`/browse/${item.id}`)}
            className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: badgeColor, color: badgeTextColor }}>
            <MessageCircle size={16} />
            {isMissing ? "I Have Information" : isFound ? "This Is Mine — Contact Finder" : "I Found This — Contact Owner"}
          </button>
          <Link href="/browse"
            className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 text-white/40 hover:text-white/60 transition-colors">
            Browse All Reports
          </Link>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
            Powered by Back2U — Cameroon&apos;s Recovery Network
          </p>
        </div>
      </div>
    </main>
  );
}