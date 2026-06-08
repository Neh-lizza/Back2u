// src/app/admin/page.tsx
// ♻️ REPLACE
"use client";
// @ts-ignore
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid, Flag, ShieldAlert, Users,
  Package, CheckCircle2, TrendingUp, Ban,
  Eye, Trash2, ShieldCheck, RefreshCw,
  Loader2, ChevronRight, DollarSign, Archive,
  AlertTriangle, ShieldX, UserX, Share2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AdminStats = {
  totalItems: number; activeItems: number; totalUsers: number;
  totalRecoveries: number; pendingFlags: number; pendingReview: number;
  totalTips: number; archivedItems: number; bannedUsers: number; flaggedUsers: number; pendingFbShares: number;
};
type FlaggedItem = {
  id: string; title: string; type: string; photos: string[];
  flag_count: number; user_id: string; location_name: string | null;
  city: string | null; description: string | null;
  user: { id: string; full_name: string } | null;
  flags: { reason: string }[];
};
type PendingItem = {
  id: string; title: string; type: string; photos: string[];
  user_id: string; location_name: string | null; city: string | null;
  description: string | null;
  user: { id: string; full_name: string } | null;
};
type ArchivedItem = { id: string; title: string; type: string; photos: string[]; updated_at: string; };
type UserItem = {
  id: string; full_name: string; avatar_url: string | null;
  city: string | null; role: string; rating: number;
  is_banned: boolean; is_flagged: boolean; items_count: number;
};
type AdminTab = "overview" | "flags" | "pending" | "users" | "archived" | "fraud" | "facebook" | "analytics";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [analytics, setAnalytics] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [fbShareRequests, setFbShareRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
      if ((profile as any)?.role !== "admin") { router.push("/dashboard"); return; }
      setIsAdmin(true);
      loadAll();
    };
    checkAdmin();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadFlaggedItems(), loadPendingItems(), loadUsers(), loadArchivedItems(), loadFraudAlerts(), loadFbShareRequests()]);
    setLoading(false);
  };

  const loadStats = async () => {
    const db = supabase as any;
    const [
      { count: totalItems }, { count: activeItems }, { count: totalUsers },
      { count: totalRecoveries }, { count: pendingFlags }, { count: pendingReview },
      { count: archivedItems }, { count: bannedUsers }, { count: flaggedUsers }, { count: pendingFbShares },
      { data: tipsData },
    ] = await Promise.all([
      supabase.from("items").select("*", { count: "exact", head: true }),
      supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("recoveries").select("*", { count: "exact", head: true }).eq("confirmed_by_a", true).eq("confirmed_by_b", true),
      supabase.from("flags").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
      supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "archived"),
      db.from("users").select("*", { count: "exact", head: true }).eq("is_banned", true),
      db.from("users").select("*", { count: "exact", head: true }).eq("is_flagged", true),
      db.from("facebook_share_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("recoveries").select("tip_amount").eq("tip_status", "paid"),
    ]);
    const totalTips = (tipsData as any[])?.reduce((sum: number, r: any) => sum + (r.tip_amount ?? 0), 0) ?? 0;
    setStats({
      totalItems: totalItems ?? 0, activeItems: activeItems ?? 0, totalUsers: totalUsers ?? 0,
      totalRecoveries: totalRecoveries ?? 0, pendingFlags: pendingFlags ?? 0,
      pendingReview: pendingReview ?? 0, totalTips, archivedItems: archivedItems ?? 0,
      bannedUsers: bannedUsers ?? 0, flaggedUsers: flaggedUsers ?? 0, pendingFbShares: pendingFbShares ?? 0,
    });
  };

  const loadFlaggedItems = async () => {
    const { data } = await supabase.from("items").select("*, user:users(id, full_name), flags(*)").gt("flag_count", 0).order("flag_count", { ascending: false });
    setFlaggedItems((data as any[]) ?? []);
  };

  const loadPendingItems = async () => {
    const { data } = await supabase.from("items").select("*, user:users(id, full_name)").eq("status", "pending_review").order("created_at", { ascending: true });
    setPendingItems((data as any[]) ?? []);
  };

  const loadUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (!data) return;
    const enriched = await Promise.all((data as any[]).map(async (u: any) => {
      const { count } = await supabase.from("items").select("*", { count: "exact", head: true }).eq("user_id", u.id);
      return { ...u, items_count: count ?? 0 };
    }));
    setUsers(enriched as UserItem[]);
  };

  const loadArchivedItems = async () => {
    const { data } = await supabase.from("items").select("id, title, type, photos, updated_at").eq("status", "archived").order("updated_at", { ascending: false });
    setArchivedItems((data as any[]) ?? []);
  };

  const loadFraudAlerts = async () => {
    const { data } = await (supabase as any).from("notifications")
      .select("*").eq("type", "fraud_alert").order("created_at", { ascending: false }).limit(50);
    setFraudAlerts(data ?? []);
  };

  const loadFbShareRequests = async () => {
    const { data } = await (supabase as any).from("facebook_share_requests")
      .select("*, item:items(id, title, type, photos, city, location_name), user:users(id, full_name)")
      .order("created_at", { ascending: false });
    setFbShareRequests(data ?? []);
  };

  const markAsPosted = async (requestId: string, itemId: string, userId: string) => {
    setActionLoading(requestId);
    await (supabase as any).from("facebook_share_requests")
      .update({ status: "posted", posted_at: new Date().toISOString() })
      .eq("id", requestId);
    await (supabase as any).from("notifications").insert({
      user_id: userId,
      type: "facebook_posted",
      title: "Your report was shared on Facebook!",
      body: "The Back2U team has shared your report on the official Back2U Facebook account.",
      data: { item_id: itemId },
    });
    await loadFbShareRequests(); await loadStats(); setActionLoading(null);
  };

  const declineShareRequest = async (requestId: string, userId: string) => {
    setActionLoading(requestId);
    await (supabase as any).from("facebook_share_requests")
      .update({ status: "declined" })
      .eq("id", requestId);
    await (supabase as any).from("notifications").insert({
      user_id: userId,
      type: "facebook_declined",
      title: "Facebook share request declined",
      body: "Your request to share on the Back2U Facebook account was not approved at this time.",
      data: {},
    });
    await loadFbShareRequests(); await loadStats(); setActionLoading(null);
  };

  const approveItem = async (itemId: string) => {
    setActionLoading(itemId);
    await (supabase.from("items") as any).update({ status: "active", admin_approved: true }).eq("id", itemId);
    const item = pendingItems.find(i => i.id === itemId);
    if (item) await (supabase.from("notifications") as any).insert({ user_id: item.user_id, type: "admin_approved", title: "Your item has been approved", body: `"${item.title}" is now live on Back2U.`, data: { item_id: itemId } });
    await loadPendingItems(); await loadStats(); setActionLoading(null);
  };

  const rejectItem = async (itemId: string) => {
    setActionLoading(itemId);
    await (supabase.from("items") as any).update({ status: "rejected", admin_approved: false }).eq("id", itemId);
    const item = pendingItems.find(i => i.id === itemId);
    if (item) await (supabase.from("notifications") as any).insert({ user_id: item.user_id, type: "admin_rejected", title: "Your item was not approved", body: `"${item.title}" did not meet our guidelines.`, data: { item_id: itemId } });
    await loadPendingItems(); await loadStats(); setActionLoading(null);
  };

  const resolveFlag = async (itemId: string) => {
    setActionLoading(itemId);
    await (supabase.from("flags") as any).update({ status: "resolved" }).eq("item_id", itemId);
    await (supabase.from("items") as any).update({ flag_count: 0 }).eq("id", itemId);
    await loadFlaggedItems(); await loadStats(); setActionLoading(null);
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    setActionLoading(itemId);
    await supabase.from("items").delete().eq("id", itemId);
    await loadFlaggedItems(); await loadStats(); setActionLoading(null);
  };

  const toggleBan = async (userId: string, isBanned: boolean) => {
    setActionLoading(userId);
    await (supabase.from("users") as any).update({
      is_banned: !isBanned,
      ban_reason: !isBanned ? "Banned by admin" : null
    }).eq("id", userId);
    await loadUsers(); setActionLoading(null);
  };

  const unflagUser = async (userId: string) => {
    setActionLoading(userId);
    await (supabase.from("users") as any).update({ is_flagged: false }).eq("id", userId);
    await loadUsers(); setActionLoading(null);
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm("Promote this user to admin?")) return;
    setActionLoading(userId);
    await (supabase.from("users") as any).update({ role: "admin" }).eq("id", userId);
    await loadUsers(); setActionLoading(null);
  };

  const restoreItem = async (itemId: string) => {
    setActionLoading(itemId);
    const newExpiry = new Date(); newExpiry.setMonth(newExpiry.getMonth() + 6);
    await (supabase.from("items") as any).update({ status: "active", expires_at: newExpiry.toISOString() }).eq("id", itemId);
    await loadArchivedItems(); await loadStats(); setActionLoading(null);
  };

  const permanentDelete = async (itemId: string) => {
    if (!confirm("Permanently delete? This cannot be undone.")) return;
    setActionLoading(itemId);
    await supabase.from("items").delete().eq("id", itemId);
    await loadArchivedItems(); await loadStats(); setActionLoading(null);
  };

  if (!isAdmin) return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: "#F0F4F8" }}>
      <Loader2 size={32} className="animate-spin text-primary" />
    </main>
  );

  const TABS = [
    { id: "overview", label: "Overview",  icon: LayoutGrid },
    { id: "pending",  label: "Pending",   icon: ShieldAlert, badge: stats?.pendingReview },
    { id: "flags",    label: "Flagged",   icon: Flag,        badge: stats?.pendingFlags },
    { id: "fraud",    label: "Fraud",     icon: AlertTriangle, badge: (stats?.bannedUsers ?? 0) + (stats?.flaggedUsers ?? 0) },
    { id: "facebook", label: "Facebook",  icon: Share2,      badge: stats?.pendingFbShares },
    { id: "users",    label: "Users",     icon: Users },
    { id: "archived", label: "Archived",  icon: Archive },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <main className="min-h-screen" style={{ background: "#F0F4F8" }}>
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* ── TOP BAR ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm font-medium">Admin Portal</p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight"
              style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
              Control <span className="text-primary">Centre.</span>
            </h1>
          </div>
          <button onClick={loadAll} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#061209] text-white"
                  : "bg-white border border-slate-200 text-slate-400 hover:border-primary hover:text-primary"
              }`}>
              <tab.icon size={13} /> {tab.label}
              {(tab.badge ?? 0) > 0 && (
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                  activeTab === tab.id ? "bg-primary text-[#061209]" : "bg-red-500 text-white"
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && stats && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Stat cards — same style as user dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Total Items",    value: stats.totalItems,      bg: "bg-emerald-500", icon: Package,       trend: "" },
                { label: "Active Items",   value: stats.activeItems,     bg: "bg-blue-500",    icon: TrendingUp,    trend: "" },
                { label: "Total Users",    value: stats.totalUsers,      bg: "bg-violet-500",  icon: Users,         trend: "" },
                { label: "Recoveries",     value: stats.totalRecoveries, bg: "bg-primary",     icon: CheckCircle2,  trend: "" },
                { label: "Tips (XAF)",     value: stats.totalTips.toLocaleString(), bg: "", icon: DollarSign, trend: "", style: { background: "#FCD116" } },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`${s.bg} rounded-2xl p-3 md:p-4 shadow-sm relative overflow-hidden`}
                  style={(s as any).style ?? {}}>
                  <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                      <s.icon size={14} className="text-white" />
                    </div>
                    <p className="text-base md:text-xl font-black text-white leading-none"
                      style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{s.value}</p>
                    <p className="text-[9px] font-medium text-white/70 mt-1">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Second row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Pending Review", value: stats.pendingReview, icon: ShieldAlert, bg: "bg-amber-400",  onClick: () => setActiveTab("pending") },
                { label: "Flagged Items",  value: stats.pendingFlags,  icon: Flag,        bg: "bg-red-500",    onClick: () => setActiveTab("flags")   },
                { label: "Banned Users",   value: stats.bannedUsers,   icon: ShieldX,     bg: "",              onClick: () => setActiveTab("fraud"), style: { background: "#CE1126" } },
                { label: "Flagged Users",  value: stats.flaggedUsers,  icon: UserX,       bg: "bg-orange-400", onClick: () => setActiveTab("fraud")   },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}
                  onClick={s.onClick}
                  className={`${s.bg} rounded-2xl p-3 md:p-4 shadow-sm relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
                  style={(s as any).style ?? {}}>
                  <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                      <s.icon size={14} className="text-white" />
                    </div>
                    <p className="text-base md:text-xl font-black text-white leading-none"
                      style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{s.value}</p>
                    <p className="text-[9px] font-medium text-white/70 mt-1">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick action cards */}
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { label: "Pending Review", count: stats.pendingReview, icon: ShieldAlert, color: "#FCD116", bg: "#fff8e1", tab: "pending" as AdminTab, desc: "High-risk items awaiting approval" },
                { label: "Flagged Items",  count: stats.pendingFlags,  icon: Flag,        color: "#FF4D4D", bg: "#fff0f0", tab: "flags"   as AdminTab, desc: "Reports flagged by the community" },
                { label: "Fraud Alerts",   count: (stats.bannedUsers ?? 0) + (stats.flaggedUsers ?? 0), icon: AlertTriangle, color: "#CE1126", bg: "#fff0f0", tab: "fraud" as AdminTab, desc: "Suspicious activity detected" },
              ].map((card, i) => (
                <motion.div key={i} whileHover={{ y: -2 }} onClick={() => setActiveTab(card.tab)}
                  className="bg-white rounded-2xl border border-slate-100 p-4 cursor-pointer hover:border-slate-200 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.bg }}>
                      <card.icon size={18} style={{ color: card.color }} />
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                  <p className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{card.count}</p>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{card.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PENDING ── */}
        {activeTab === "pending" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {pendingItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center py-16 gap-3">
                <ShieldCheck size={36} className="text-primary" />
                <p className="font-bold text-slate-300 text-sm">All clear — no items pending review</p>
              </div>
            ) : pendingItems.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-amber-100 overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {item.photos?.[0]
                      ? <img src={item.photos[0]} className="w-full h-full object-cover blur-md" alt="" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-slate-300" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[8px] font-black uppercase tracking-widest">Very Sensitive</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${item.type === "found" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-500"}`}>{item.type}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">By {item.user?.full_name ?? "Unknown"} · {item.location_name ?? item.city ?? "No location"}</p>
                    {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>}
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => approveItem(item.id)} disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50">
                        {actionLoading === item.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Approve
                      </button>
                      <button onClick={() => rejectItem(item.id)} disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50">
                        <Ban size={11} /> Reject
                      </button>
                      <button onClick={() => router.push(`/browse/${item.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                        <Eye size={11} /> View
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── FLAGGED ── */}
        {activeTab === "flags" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {flaggedItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center py-16 gap-3">
                <ShieldCheck size={36} className="text-primary" />
                <p className="font-bold text-slate-300 text-sm">No flagged items</p>
              </div>
            ) : flaggedItems.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-red-100 overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {item.photos?.[0]
                      ? <img src={item.photos[0]} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={24} className="text-slate-300" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-red-100 text-red-500 rounded-full text-[8px] font-black uppercase">{item.flag_count} Flag{item.flag_count !== 1 ? "s" : ""}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.type === "found" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-500"}`}>{item.type}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 font-medium">By {item.user?.full_name ?? "Unknown"}</p>
                    {item.flags?.slice(0, 2).map((flag, i) => <p key={i} className="text-[10px] text-slate-400 italic mt-0.5">"{flag.reason}"</p>)}
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => resolveFlag(item.id)} disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all disabled:opacity-50">
                        {actionLoading === item.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Dismiss
                      </button>
                      <button onClick={() => deleteItem(item.id)} disabled={actionLoading === item.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all disabled:opacity-50">
                        <Trash2 size={11} /> Delete
                      </button>
                      <button onClick={() => router.push(`/browse/${item.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                        <Eye size={11} /> View
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── FRAUD ALERTS (NEW) ── */}
        {activeTab === "fraud" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Fraud stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-red-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldX size={18} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{stats?.bannedUsers ?? 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Banned Users</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-orange-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-900" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{stats?.flaggedUsers ?? 0}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Flagged Users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Flagged users */}
            {users.filter(u => u.is_flagged || u.is_banned).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="font-bold text-xs text-slate-900">Flagged & Banned Users</h3>
                </div>
                {users.filter(u => u.is_flagged || u.is_banned).map((u, i) => (
                  <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-slate-50" : ""}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500 shrink-0 overflow-hidden">
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : u.full_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{u.full_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {u.is_banned && <span className="px-1.5 py-0.5 bg-red-100 text-red-500 rounded text-[8px] font-black uppercase">Banned</span>}
                        {u.is_flagged && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-500 rounded text-[8px] font-black uppercase">Flagged</span>}
                        <span className="text-[9px] text-slate-400">{u.city}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {u.is_flagged && (
                        <button onClick={() => unflagUser(u.id)} disabled={actionLoading === u.id}
                          className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black uppercase hover:bg-slate-200 transition-all">
                          Unflag
                        </button>
                      )}
                      {u.role !== "admin" && (
                        <button onClick={() => toggleBan(u.id, u.is_banned)} disabled={actionLoading === u.id}
                          className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${u.is_banned ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-500 hover:bg-red-100"}`}>
                          {actionLoading === u.id ? <Loader2 size={10} className="animate-spin" /> : u.is_banned ? "Unban" : "Ban"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fraud alert log */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <h3 className="font-bold text-xs text-slate-900">Fraud Alert Log</h3>
              </div>
              {fraudAlerts.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <ShieldCheck size={24} className="text-slate-200" />
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">No fraud alerts</p>
                </div>
              ) : fraudAlerts.map((alert, i) => (
                <div key={alert.id} className={`flex items-start gap-3 px-4 py-3 ${i > 0 ? "border-t border-slate-50" : ""}`}>
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={13} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900">{alert.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{alert.body}</p>
                    <p className="text-[9px] text-slate-300 mt-0.5 font-mono">
                      {alert.data?.rule ?? ""} · {new Date(alert.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── FACEBOOK SHARE REQUESTS ── */}
        {activeTab === "facebook" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#1877F2" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900">Facebook Share Requests</p>
                <p className="text-[10px] text-slate-400">Users requesting their reports to be shared on the Back2U Facebook account. Copy the link and post manually.</p>
              </div>
            </div>

            {fbShareRequests.filter(r => r.status === "pending").length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 flex flex-col items-center py-12 gap-2">
                <Share2 size={28} className="text-slate-200" />
                <p className="font-bold text-slate-300 text-sm">No pending share requests</p>
              </div>
            )}

            {fbShareRequests.filter(r => r.status === "pending").map(req => (
              <motion.div key={req.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-blue-100 overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {req.item?.photos?.[0]
                      ? <img src={req.item.photos[0]} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-slate-300" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${req.item?.type === "found" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-500"}`}>
                        {req.item?.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{req.item?.title}</h3>
                    <p className="text-[10px] text-slate-400">By {req.user?.full_name} · {req.item?.city}</p>
                    <p className="text-[9px] text-slate-300 mt-0.5">{new Date(req.created_at).toLocaleDateString("en-GB")}</p>

                    {/* Link to copy */}
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-[9px] font-mono text-slate-500 truncate flex-1">
                        https://back2u.vercel.app/browse/{req.item?.id}
                      </p>
                      <button onClick={() => navigator.clipboard.writeText(`https://back2u.vercel.app/browse/${req.item?.id}`)}
                        className="text-[8px] font-black uppercase text-primary shrink-0 hover:underline">
                        Copy
                      </button>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button onClick={() => markAsPosted(req.id, req.item?.id, req.user_id)} disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                        style={{ background: "#1877F2" }}>
                        {actionLoading === req.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />} Mark as Posted
                      </button>
                      <button onClick={() => declineShareRequest(req.id, req.user_id)} disabled={actionLoading === req.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50">
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Posted history */}
            {fbShareRequests.filter(r => r.status === "posted").length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-bold text-xs text-slate-900">Posted History</p>
                </div>
                {fbShareRequests.filter(r => r.status === "posted").map((req, i) => (
                  <div key={req.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-slate-50" : ""}`}>
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      {req.item?.photos?.[0] && <img src={req.item.photos[0]} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-600 truncate">{req.item?.title}</p>
                      <p className="text-[9px] text-slate-400">Posted {new Date(req.posted_at).toLocaleDateString("en-GB")}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[8px] font-black uppercase">Posted</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {users.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all ${i > 0 ? "border-t border-slate-50" : ""}`}>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0 overflow-hidden">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : u.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-bold text-xs text-slate-900 truncate">{u.full_name}</p>
                    {u.role === "admin" && <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[8px] font-black uppercase">Admin</span>}
                    {u.is_banned && <span className="px-1.5 py-0.5 bg-red-100 text-red-500 rounded text-[8px] font-black uppercase">Banned</span>}
                    {u.is_flagged && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-500 rounded text-[8px] font-black uppercase">Flagged</span>}
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">{u.city ?? "No city"} · {u.items_count} reports · ⭐ {u.rating?.toFixed(1) ?? "0.0"}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {u.role !== "admin" && (
                    <button onClick={() => promoteToAdmin(u.id)} disabled={actionLoading === u.id}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[8px] font-black uppercase hover:bg-primary/20 transition-all disabled:opacity-50">
                      Promote
                    </button>
                  )}
                  <button onClick={() => toggleBan(u.id, u.is_banned)} disabled={actionLoading === u.id || u.role === "admin"}
                    className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all disabled:opacity-30 ${
                      u.is_banned ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-500 hover:bg-red-100"
                    }`}>
                    {actionLoading === u.id ? <Loader2 size={10} className="animate-spin" /> : u.is_banned ? "Unban" : "Ban"}
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── ARCHIVED ── */}
        {activeTab === "archived" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {archivedItems.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-2">
                <Archive size={28} className="text-slate-200" />
                <p className="font-bold text-slate-300 text-sm">Nothing archived</p>
              </div>
            ) : archivedItems.map((item, i) => (
              <div key={item.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all ${i > 0 ? "border-t border-slate-50" : ""}`}>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  {item.photos?.[0]
                    ? <img src={item.photos[0]} className="w-full h-full object-cover grayscale opacity-60" alt="" />
                    : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-slate-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-500 truncate">{item.title}</p>
                  <p className="text-[9px] text-slate-300 font-medium uppercase tracking-widest">{item.type} · {new Date(item.updated_at).toLocaleDateString("en-GB")}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => restoreItem(item.id)} disabled={actionLoading === item.id}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[8px] font-black uppercase hover:bg-primary/20 transition-all disabled:opacity-50">
                    {actionLoading === item.id ? <Loader2 size={10} className="animate-spin" /> : "Restore"}
                  </button>
                  <button onClick={() => permanentDelete(item.id)} disabled={actionLoading === item.id}
                    className="px-2 py-1 bg-red-50 text-red-500 rounded-lg text-[8px] font-black uppercase hover:bg-red-100 transition-all disabled:opacity-50">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Stats summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Reports",  value: stats?.total ?? 0,     color: "#009A49" },
                { label: "Recovered",      value: stats?.recovered ?? 0,  color: "#FCD116" },
                { label: "Active",         value: stats?.active ?? 0,     color: "#3b82f6" },
                { label: "Recovery Rate",  value: stats?.total ? Math.round((stats.recovered / stats.total) * 100) + "%" : "0%", color: "#009A49" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Daily reports line chart */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-sm font-black text-slate-900 mb-1">Reports — Last 14 Days</p>
              <p className="text-xs text-slate-400 mb-4">Daily report activity across Cameroon</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics?.dailyData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Line type="monotone" dataKey="count" stroke="#009A49" strokeWidth={2.5} dot={{ fill: "#009A49", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Category bar chart */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-sm font-black text-slate-900 mb-1">Reports by Category</p>
                <p className="text-xs text-slate-400 mb-4">Most common item types reported</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics?.categoryData ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} width={70} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="count" fill="#009A49" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* City bar chart */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-sm font-black text-slate-900 mb-1">Reports by City</p>
                <p className="text-xs text-slate-400 mb-4">Where items are being lost and found</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics?.cityData ?? []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} width={70} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="count" fill="#FCD116" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lost vs Found pie */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <p className="text-sm font-black text-slate-900 mb-1">Lost vs Found Distribution</p>
              <p className="text-xs text-slate-400 mb-4">Breakdown of report types</p>
              <div className="flex items-center gap-8 justify-center">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Lost",  value: analytics?.lostCount  ?? 0 },
                        { name: "Found", value: analytics?.foundCount ?? 0 },
                      ]}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" paddingAngle={4}>
                      <Cell fill="#FF4D4D" />
                      <Cell fill="#009A49" />
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <p className="text-xs font-bold text-slate-600">Lost — {analytics?.lostCount ?? 0} reports</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <p className="text-xs font-bold text-slate-600">Found — {analytics?.foundCount ?? 0} reports</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <p className="text-xs font-bold text-slate-600">Recovered — {stats?.recovered ?? 0} items</p>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </main>
  );
}