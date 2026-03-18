// src/components/shared/NotificationBell.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, X, Sparkles, MessageSquare,
  Clock, CheckCircle2, ShieldCheck,
  ShieldX, Package, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/types/database";

// Icon per notification type
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

// Where to navigate on notification click
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

export default function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch notifications ──
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

    // Realtime
    const channel = supabase
      .channel(`notif-bell-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // ── Close on outside click ──
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Mark all as read when dropdown opens ──
  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open && unreadCount > 0) {
      await db
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  // ── Click notification ──
  const handleNotifClick = async (notif: NotificationRow) => {
    if (!notif.read) {
      await db
        .from("notifications")
        .update({ read: true })
        .eq("id", notif.id);
    }
    setOpen(false);
    router.push(getNotifLink(notif));
  };

  // ── Clear all ──
  const handleClearAll = async () => {
    await db
      .from("notifications")
      .delete()
      .eq("user_id", userId);
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative text-white/50 hover:text-primary transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[8px] font-black text-dark"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 w-80 bg-dark border border-white/10 rounded-[2rem] shadow-2xl shadow-black/40 overflow-hidden z-[200]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-clash font-black text-sm uppercase tracking-tight text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-white/20 hover:text-white/40 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {loading && (
                <div className="flex justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-primary" />
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="text-center py-12 px-6">
                  <Bell size={32} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/20 font-black text-xs uppercase tracking-widest">
                    No notifications yet
                  </p>
                </div>
              )}

              {notifications.map((notif, i) => (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleNotifClick(notif)}
                  className={`w-full px-6 py-4 flex items-start gap-4 text-left transition-all hover:bg-white/5 border-b border-white/5 last:border-0 ${!notif.read ? "bg-primary/5" : ""}`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${!notif.read ? "bg-primary/10" : "bg-white/5"}`}>
                    <NotifIcon type={notif.type} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black uppercase tracking-tight leading-snug mb-1 ${!notif.read ? "text-white" : "text-white/50"}`}>
                      {notif.title}
                    </p>
                    {notif.body && (
                      <p className="text-[10px] text-white/30 font-medium leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>
                    )}
                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-1">
                      {timeAgo(notif.created_at)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}