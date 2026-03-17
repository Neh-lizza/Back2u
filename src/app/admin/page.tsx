// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid, Flag, ShieldAlert, Users,
  Package, CheckCircle2, TrendingUp, Ban,
  Eye, Trash2, ShieldCheck, RefreshCw,
  Loader2, ChevronRight, DollarSign, Archive
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ── ALL TYPES DEFINED LOCALLY — no external import needed ──
type AdminStats = {
  totalItems:      number;
  activeItems:     number;
  totalUsers:      number;
  totalRecoveries: number;
  pendingFlags:    number;
  pendingReview:   number;
  totalTips:       number;
  archivedItems:   number;
};

type FlaggedItem = {
  id:            string;
  title:         string;
  type:          string;
  photos:        string[];
  flag_count:    number;
  user_id:       string;
  location_name: string | null;
  city:          string | null;
  description:   string | null;
  user:          { id: string; full_name: string } | null;
  flags:         { reason: string }[];
};

type PendingItem = {
  id:            string;
  title:         string;
  type:          string;
  photos:        string[];
  user_id:       string;
  location_name: string | null;
  city:          string | null;
  description:   string | null;
  user:          { id: string; full_name: string } | null;
};

type ArchivedItem = {
  id:         string;
  title:      string;
  type:       string;
  photos:     string[];
  updated_at: string;
};

type UserItem = {
  id:          string;
  full_name:   string;
  avatar_url:  string | null;
  city:        string | null;
  role:        string;
  rating:      number;
  is_banned:   boolean;
  items_count: number;
};

type AdminTab = "overview" | "flags" | "pending" | "users" | "archived";

function StatCard({ label, value, icon: Icon, color = "text-primary", sub }: {
  label: string; value: number | string; icon: any; color?: string; sub?: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className={`text-3xl font-black font-clash tracking-tighter ${color}`}>{value}</p>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">{label}</p>
      {sub && <p className="text-white/20 text-[9px] uppercase tracking-widest mt-0.5">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
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
    await Promise.all([loadStats(), loadFlaggedItems(), loadPendingItems(), loadUsers(), loadArchivedItems()]);
    setLoading(false);
  };

  const loadStats = async () => {
    const [
      { count: totalItems }, { count: activeItems }, { count: totalUsers },
      { count: totalRecoveries }, { count: pendingFlags }, { count: pendingReview },
      { count: archivedItems }, { data: tipsData },
    ] = await Promise.all([
      supabase.from("items").select("*", { count: "exact", head: true }),
      supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("recoveries").select("*", { count: "exact", head: true }).eq("confirmed_by_a", true).eq("confirmed_by_b", true),
      supabase.from("flags").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
      supabase.from("items").select("*", { count: "exact", head: true }).eq("status", "archived"),
      supabase.from("recoveries").select("tip_amount").eq("tip_status", "paid"),
    ]);
    const totalTips = tipsData?.reduce((sum: number, r: any) => sum + (r.tip_amount ?? 0), 0) ?? 0;
    setStats({ totalItems: totalItems ?? 0, activeItems: activeItems ?? 0, totalUsers: totalUsers ?? 0, totalRecoveries: totalRecoveries ?? 0, pendingFlags: pendingFlags ?? 0, pendingReview: pendingReview ?? 0, totalTips, archivedItems: archivedItems ?? 0 });
  };

  const loadFlaggedItems = async () => {
    const { data } = await supabase.from("items").select("*, user:users(id, full_name), flags(*)").gt("flag_count", 0).order("flag_count", { ascending: false });
    setFlaggedItems((data as FlaggedItem[]) ?? []);
  };

  const loadPendingItems = async () => {
    const { data } = await supabase.from("items").select("*, user:users(id, full_name)").eq("status", "pending_review").order("created_at", { ascending: true });
    setPendingItems((data as PendingItem[]) ?? []);
  };

  const loadUsers = async () => {
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    if (!data) return;
    const enriched = await Promise.all(data.map(async (u: any) => {
      const { count } = await supabase.from("items").select("*", { count: "exact", head: true }).eq("user_id", u.id);
      return { ...u, items_count: count ?? 0 };
    }));
    setUsers(enriched as UserItem[]);
  };

  const loadArchivedItems = async () => {
    const { data } = await supabase.from("items").select("id, title, type, photos, updated_at").eq("status", "archived").order("updated_at", { ascending: false });
    setArchivedItems((data as ArchivedItem[]) ?? []);
  };

  const approveItem = async (itemId: string) => {
    setActionLoading(itemId);
    await supabase.from("items").update({ status: "active", admin_approved: true }).eq("id", itemId);
    const item = pendingItems.find(i => i.id === itemId);
    if (item) await supabase.from("notifications").insert({ user_id: item.user_id, type: "admin_approved", title: "Your item has been approved", body: `"${item.title}" is now live on Back2U.`, data: { item_id: itemId } });
    await loadPendingItems(); await loadStats(); setActionLoading(null);
  };

  const rejectItem = async (itemId: string) => {
    setActionLoading(itemId);
    await supabase.from("items").update({ status: "rejected", admin_approved: false }).eq("id", itemId);
    const item = pendingItems.find(i => i.id === itemId);
    if (item) await supabase.from("notifications").insert({ user_id: item.user_id, type: "admin_rejected", title: "Your item was not approved", body: `"${item.title}" did not meet our guidelines.`, data: { item_id: itemId } });
    await loadPendingItems(); await loadStats(); setActionLoading(null);
  };

  const resolveFlag = async (itemId: string) => {
    setActionLoading(itemId);
    await supabase.from("flags").update({ status: "resolved" }).eq("item_id", itemId);
    await supabase.from("items").update({ flag_count: 0 }).eq("id", itemId);
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
    await supabase.from("users").update({ is_banned: !isBanned, ban_reason: !isBanned ? "Banned by admin" : null }).eq("id", userId);
    await loadUsers(); setActionLoading(null);
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm("Promote this user to admin?")) return;
    setActionLoading(userId);
    await supabase.from("users").update({ role: "admin" }).eq("id", userId);
    await loadUsers(); setActionLoading(null);
  };

  const restoreItem = async (itemId: string) => {
    setActionLoading(itemId);
    const newExpiry = new Date(); newExpiry.setMonth(newExpiry.getMonth() + 6);
    await supabase.from("items").update({ status: "active", expires_at: newExpiry.toISOString() }).eq("id", itemId);
    await loadArchivedItems(); await loadStats(); setActionLoading(null);
  };

  const permanentDelete = async (itemId: string) => {
    if (!confirm("Permanently delete? This cannot be undone.")) return;
    setActionLoading(itemId);
    await supabase.from("items").delete().eq("id", itemId);
    await loadArchivedItems(); await loadStats(); setActionLoading(null);
  };

  if (!isAdmin) return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </main>
  );

  const TABS = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "pending",  label: "Pending",  icon: ShieldAlert, badge: stats?.pendingReview },
    { id: "flags",    label: "Flagged",  icon: Flag,        badge: stats?.pendingFlags },
    { id: "users",    label: "Users",    icon: Users },
    { id: "archived", label: "Archived", icon: Archive },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Admin Portal</p>
          <h1 className="text-6xl font-black font-clash uppercase tracking-tighter leading-none">Control <br /><span className="text-primary">Centre.</span></h1>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10 pb-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-primary text-dark" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>
              <tab.icon size={14} /> {tab.label}
              {tab.badge ? <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${activeTab === tab.id ? "bg-dark text-primary" : "bg-primary text-dark"}`}>{tab.badge}</span> : null}
            </button>
          ))}
          <button onClick={loadAll} disabled={loading} className="ml-auto flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/40 hover:bg-white/10 transition-all">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && stats && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Items"    value={stats.totalItems}      icon={Package} />
              <StatCard label="Active Items"   value={stats.activeItems}     icon={TrendingUp} />
              <StatCard label="Total Users"    value={stats.totalUsers}      icon={Users} />
              <StatCard label="Recoveries"     value={stats.totalRecoveries} icon={CheckCircle2} />
              <StatCard label="Pending Flags"  value={stats.pendingFlags}    icon={Flag}       color="text-red-400" />
              <StatCard label="Pending Review" value={stats.pendingReview}   icon={ShieldAlert} color="text-secondary" />
              <StatCard label="Archived"       value={stats.archivedItems}   icon={Archive}    color="text-white/40" />
              <StatCard label="Tips Collected" value={`${stats.totalTips.toLocaleString()} XAF`} icon={DollarSign} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <motion.button whileHover={{ y: -4 }} onClick={() => setActiveTab("pending")} className="bg-secondary/10 border border-secondary/20 rounded-[2rem] p-6 text-left">
                <ShieldAlert size={28} className="text-secondary mb-4" />
                <h3 className="font-clash font-black text-xl uppercase tracking-tight text-white mb-1">{stats.pendingReview} Pending</h3>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">High-risk items awaiting review</p>
                <div className="flex items-center gap-2 mt-4 text-secondary text-[10px] font-black uppercase tracking-widest">Review Now <ChevronRight size={14} /></div>
              </motion.button>
              <motion.button whileHover={{ y: -4 }} onClick={() => setActiveTab("flags")} className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 text-left">
                <Flag size={28} className="text-red-400 mb-4" />
                <h3 className="font-clash font-black text-xl uppercase tracking-tight text-white mb-1">{stats.pendingFlags} Flagged</h3>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Items reported by users</p>
                <div className="flex items-center gap-2 mt-4 text-red-400 text-[10px] font-black uppercase tracking-widest">Moderate Now <ChevronRight size={14} /></div>
              </motion.button>
              <motion.button whileHover={{ y: -4 }} onClick={() => setActiveTab("users")} className="bg-primary/10 border border-primary/20 rounded-[2rem] p-6 text-left">
                <Users size={28} className="text-primary mb-4" />
                <h3 className="font-clash font-black text-xl uppercase tracking-tight text-white mb-1">{stats.totalUsers} Users</h3>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Manage user accounts</p>
                <div className="flex items-center gap-2 mt-4 text-primary text-[10px] font-black uppercase tracking-widest">Manage Users <ChevronRight size={14} /></div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* PENDING */}
        {activeTab === "pending" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {pendingItems.length === 0 && (
              <div className="text-center py-20">
                <ShieldCheck size={48} className="text-primary mx-auto mb-4" />
                <p className="font-clash font-black text-3xl uppercase text-white/20">All clear</p>
                <p className="text-white/20 text-sm mt-2">No items pending review</p>
              </div>
            )}
            {pendingItems.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-secondary/20 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                  {item.photos?.[0] ? <img src={item.photos[0]} className="w-full h-full object-cover blur-md" alt="" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={32} /></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-[9px] font-black uppercase tracking-widest">Very Sensitive</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.type === "found" ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"}`}>{item.type}</span>
                  </div>
                  <h3 className="font-clash font-black text-xl uppercase tracking-tight text-white mb-1">{item.title}</h3>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">By {item.user?.full_name ?? "Unknown"} · {item.location_name ?? item.city ?? "No location"}</p>
                  {item.description && <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">{item.description}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => approveItem(item.id)} disabled={actionLoading === item.id} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50">
                      {actionLoading === item.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
                    </button>
                    <button onClick={() => rejectItem(item.id)} disabled={actionLoading === item.id} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all disabled:opacity-50">
                      <Ban size={14} /> Reject
                    </button>
                    <button onClick={() => router.push(`/browse/${item.id}`)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      <Eye size={14} /> View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* FLAGGED */}
        {activeTab === "flags" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {flaggedItems.length === 0 && (
              <div className="text-center py-20">
                <ShieldCheck size={48} className="text-primary mx-auto mb-4" />
                <p className="font-clash font-black text-3xl uppercase text-white/20">No flags</p>
              </div>
            )}
            {flaggedItems.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-red-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                  {item.photos?.[0] ? <img src={item.photos[0]} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={32} /></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-[9px] font-black uppercase tracking-widest">{item.flag_count} Flag{item.flag_count !== 1 ? "s" : ""}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.type === "found" ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-400"}`}>{item.type}</span>
                  </div>
                  <h3 className="font-clash font-black text-xl uppercase tracking-tight text-white mb-1">{item.title}</h3>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">By {item.user?.full_name ?? "Unknown"}</p>
                  {item.flags?.slice(0, 2).map((flag, i) => <p key={i} className="text-white/40 text-xs italic mb-1">"{flag.reason}"</p>)}
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => resolveFlag(item.id)} disabled={actionLoading === item.id} className="flex items-center gap-2 px-5 py-2.5 bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/30 transition-all disabled:opacity-50">
                      {actionLoading === item.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Dismiss
                    </button>
                    <button onClick={() => deleteItem(item.id)} disabled={actionLoading === item.id} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all disabled:opacity-50">
                      <Trash2 size={14} /> Delete
                    </button>
                    <button onClick={() => router.push(`/browse/${item.id}`)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                      <Eye size={14} /> View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* USERS */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {users.map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={`bg-white/5 border rounded-[2rem] p-5 flex items-center gap-5 ${u.is_banned ? "border-red-500/20" : "border-white/10"}`}>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-lg shrink-0 overflow-hidden">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : u.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-sm uppercase tracking-tight text-white">{u.full_name}</h4>
                    {u.role === "admin" && <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-[8px] font-black uppercase tracking-widest">Admin</span>}
                    {u.is_banned && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[8px] font-black uppercase tracking-widest">Banned</span>}
                  </div>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest truncate">{u.city ?? "No city"} · {u.items_count} items · ⭐ {u.rating?.toFixed(1) ?? "0.0"}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {u.role !== "admin" && (
                    <button onClick={() => promoteToAdmin(u.id)} disabled={actionLoading === u.id} className="px-3 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50">
                      {actionLoading === u.id ? <Loader2 size={12} className="animate-spin" /> : "Promote"}
                    </button>
                  )}
                  <button onClick={() => toggleBan(u.id, u.is_banned)} disabled={actionLoading === u.id || u.role === "admin"} className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30 ${u.is_banned ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-red-500/10 text-red-400 hover:bg-red-500/20"}`}>
                    {u.is_banned ? "Unban" : "Ban"}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ARCHIVED */}
        {activeTab === "archived" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {archivedItems.length === 0 && (
              <div className="text-center py-20">
                <Archive size={48} className="text-white/20 mx-auto mb-4" />
                <p className="font-clash font-black text-3xl uppercase text-white/20">Nothing archived</p>
              </div>
            )}
            {archivedItems.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/5 rounded-[2rem] p-5 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 shrink-0">
                  {item.photos?.[0] ? <img src={item.photos[0]} className="w-full h-full object-cover grayscale" alt="" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={24} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm uppercase tracking-tight text-white/60 truncate">{item.title}</h4>
                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">{item.type} · archived {new Date(item.updated_at).toLocaleDateString("en-GB")}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => restoreItem(item.id)} disabled={actionLoading === item.id} className="px-3 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50">
                    {actionLoading === item.id ? <Loader2 size={12} className="animate-spin" /> : "Restore"}
                  </button>
                  <button onClick={() => permanentDelete(item.id)} disabled={actionLoading === item.id} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all disabled:opacity-50">
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </main>
  );
}