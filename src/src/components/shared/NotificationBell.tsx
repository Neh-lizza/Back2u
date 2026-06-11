// src/components/shared/NotificationBell.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, X, Sparkles, MessageSquare,
  Clock, CheckCircle2, ShieldCheck,
  ShieldX, Package, Loader2, MapPin,
  TrendingUp, ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/types/database";

function NotifIcon({ type }: { type: string }) {
  const cls = "shrink-0";
  switch (type) {
    case "match_found":        return <Sparkles size={16} className={`text-primary ${cls}`} />;
    case "chat_message":       return <MessageSquare size={16} className={`text-primary ${cls}`} />;
    case "recovery_confirmed": return <CheckCircle2 size={16} className={`text-primary ${cls}`} />;
    case "item_expiring":      return <Clock size={16} className={`text-secondary ${cls}`} />;
    case "item_archived":      return <Package size={16} className={`text-slate-400 ${cls}`} />;
    case "admin_approved":     return <ShieldCheck size={16} className={`text-primary ${cls}`} />;
    case "admin_rejected":     return <ShieldX size={16} className={`text-red-400 ${cls}`} />;
    default:                   return <Bell size={16} className={`text-slate-400 ${cls}`} />;
  }
}

function getNotifLink(notif: NotificationRow): string {
  const data = notif.data as Record<string, any>;
  switch (notif.type) {
    case "match_found":        return data.item_id ? `/browse/${data.item_id}` : "/browse";
    case "chat_message":       return data.chat_id ? `/chat?id=${data.chat_id}` : "/chat";
    case "recovery_confirmed": return "/dashboard";
    case "item_expiring":      return "/dashboard";
    case "item_archived":      return "/dashboard";
    case "admin_approved":     return "/browse";
    case "admin_rejected":     return "/dashboard";
    default:                   return "/dashboard";
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── AI MATCH REPORT MODAL ─────────────────────────────────
function AIMatchReportModal({
  notif,
  onClose,
  onViewItem,
}: {
  notif: NotificationRow;
  onClose: () => void;
  onViewItem: () => void;
}) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const db = supabase as any;

  useEffect(() => {
    const generateReport = async () => {
      const data = notif.data as Record<string, any>;
      const itemId   = data?.item_id;
      const matchId  = data?.match_id;
      const score    = data?.score ?? 0;

      if (!itemId || !matchId) {
        setReport(notif.body ?? "A potential match was found for your report.");
        setLoading(false);
        return;
      }

      // Fetch both items
      const [{ data: itemA }, { data: itemB }] = await Promise.all([
        db.from("items").select("title, type, city, location_name, created_at, category").eq("id", itemId).single(),
        db.from("items").select("title, type, city, location_name, created_at, category").eq("id", matchId).single(),
      ]);

      if (!itemA || !itemB) {
        setReport(notif.body ?? "A potential match was found for your report.");
        setLoading(false);
        return;
      }

      // Smart report generation from match data
      try {
        const sameCity = itemA.city && itemB.city && itemA.city.toLowerCase() === itemB.city.toLowerCase();
        const sameCategory = itemA.category && itemB.category && itemA.category.toLowerCase() === itemB.category.toLowerCase();
        const daysApart = Math.abs(Math.round((new Date(itemA.created_at).getTime() - new Date(itemB.created_at).getTime()) / 86400000));
        const probability = Math.min(98, Math.round(50 + score * 0.48));

        const cityText = sameCity
          ? `Both reports are from ${itemA.city}`
          : `The reports are from ${itemA.city ?? "different areas"} and ${itemB.city ?? "nearby"}`;

        const dateText = daysApart === 0
          ? "both posted on the same day"
          : daysApart === 1
          ? "posted just 1 day apart"
          : `posted ${daysApart} days apart`;

        const categoryText = sameCategory
          ? `Both are in the ${itemA.category} category`
          : "The categories are similar";

        const confidence = score >= 80 ? "strong" : score >= 60 ? "good" : "potential";

        const report = `We found a ${confidence} match for your ${itemA.type} report "${itemA.title}". ${cityText}, ${dateText}. ${categoryText} — match score ${score}/100. We estimate a ${probability}% probability this is your item. We recommend contacting the other party as soon as possible.`;

        setReport(report);
      } catch {
        setReport(notif.body ?? "A potential match was found for your report.");
      }

      setLoading(false);
    };

    generateReport();
  }, [notif]);

  const score = (notif.data as any)?.score ?? 0;
  const probability = Math.min(98, Math.round(50 + score * 0.48));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-sm w-full"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-white font-black text-sm">AI Match Report</p>
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Powered by Back2U AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/40 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Distance pill */}
        {(notif.data as any)?.distance && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mb-4">
            <MapPin size={11} className="text-primary" />
            <span className="text-white/60 text-[10px] font-bold">{(notif.data as any).distance}</span>
          </div>
        )}

        {/* Score bar */}
        <div className="bg-white/5 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Match Score</p>
            <p className="text-primary font-black text-sm">{score}/100</p>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-primary" />
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <TrendingUp size={11} className="text-primary" />
            <p className="text-[10px] font-bold text-white/40">
              Estimated <span className="text-primary font-black">{probability}%</span> probability this is your item
            </p>
          </div>
        </div>

        {/* AI Report */}
        <div className="bg-white/5 rounded-2xl p-4 mb-5 min-h-[100px] flex items-center">
          {loading ? (
            <div className="flex items-center gap-3 w-full justify-center">
              <Loader2 size={16} className="animate-spin text-primary" />
              <p className="text-white/30 text-xs font-medium">Analyzing match...</p>
            </div>
          ) : (
            <p className="text-white/70 text-xs font-medium leading-relaxed">{report}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 text-xs font-bold hover:bg-white/5 transition-all">
            Later
          </button>
          <button onClick={onViewItem}
            className="flex-[2] py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            View Match <ArrowRight size={13} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeMatchNotif, setActiveMatchNotif] = useState<NotificationRow | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data as NotificationRow[]) ?? []);
    setUnreadCount(data?.filter((n: any) => !n.read).length ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    const channel = supabase.channel(`notif-bell-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => fetchNotifications())
      .subscribe();
    const poll = setInterval(() => fetchNotifications(), 10000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [userId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open && unreadCount > 0) {
      await db.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleNotifClick = async (notif: NotificationRow) => {
    if (!notif.read) {
      await db.from("notifications").update({ read: true }).eq("id", notif.id);
    }
    setOpen(false);

    // Show AI report modal for match notifications
    if (notif.type === "match_found") {
      setActiveMatchNotif(notif);
      return;
    }

    router.push(getNotifLink(notif));
  };

  const handleClearAll = async () => {
    await db.from("notifications").delete().eq("user_id", userId);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <>
      <div ref={dropdownRef} className="relative">
        <button onClick={handleOpen} className="relative text-white/50 hover:text-primary transition-colors">
          <Bell size={18} />
          {unreadCount > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[8px] font-black text-dark">
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 w-80 bg-dark border border-white/10 rounded-[2rem] shadow-2xl shadow-black/40 overflow-hidden z-[200]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h3 className="font-clash font-black text-sm uppercase tracking-tight text-white">Notifications</h3>
                <div className="flex items-center gap-3">
                  {notifications.length > 0 && (
                    <button onClick={handleClearAll}
                      className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors">
                      Clear all
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} className="text-white/20 hover:text-white/40 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {loading && (
                  <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                )}
                {!loading && notifications.length === 0 && (
                  <div className="text-center py-12 px-6">
                    <Bell size={32} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/20 font-black text-xs uppercase tracking-widest">No notifications yet</p>
                  </div>
                )}
                {notifications.map((notif, i) => (
                  <motion.button key={notif.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full px-6 py-4 flex items-start gap-4 text-left transition-all hover:bg-white/5 border-b border-white/5 last:border-0 ${!notif.read ? "bg-primary/5" : ""}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${!notif.read ? "bg-primary/10" : "bg-white/5"}`}>
                      <NotifIcon type={notif.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black uppercase tracking-tight leading-snug mb-1 ${!notif.read ? "text-white" : "text-white/50"}`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-[10px] text-white/30 font-medium leading-relaxed line-clamp-2">{notif.body}</p>
                      )}
                      {notif.type === "match_found" && (
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-[9px] text-primary font-black uppercase tracking-widest">Tap for AI analysis</p>
                          {(notif.data as any)?.distance && (
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">· {(notif.data as any).distance}</span>
                          )}
                        </div>
                      )}
                      <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                    {!notif.read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Match Report Modal */}
      <AnimatePresence>
        {activeMatchNotif && (
          <AIMatchReportModal
            notif={activeMatchNotif}
            onClose={() => setActiveMatchNotif(null)}
            onViewItem={() => {
              const data = activeMatchNotif.data as Record<string, any>;
              setActiveMatchNotif(null);
              router.push(data.item_id ? `/browse/${data.item_id}` : "/browse");
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}