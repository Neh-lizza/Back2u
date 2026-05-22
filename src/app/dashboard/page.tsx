// src/app/dashboard/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, ChevronRight, Star, Search, Flag,
  Package, Loader2, MessageSquare, MapPin,
  Shield, Zap, CheckCircle, Bell, LogOut,
  ArrowUpRight, Navigation, Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string; full_name: string; avatar_url: string | null;
  city: string | null; rating: number; recovery_count: number; role: string;
};
type ItemRow = {
  id: string; title: string; type: string; status: string;
  city: string | null; location_name: string | null; created_at: string; photos: string[];
};
type ChatRow = {
  id: string; status: string; created_at: string;
  item: { title: string; type: string } | null;
  other_user: { full_name: string; avatar_url: string | null } | null;
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getGuardian(r: number) {
  if (r >= 20) return { label: "Gold Guardian",   color: "#FCD116", nextAt: 20, next: null };
  if (r >= 10) return { label: "Silver Guardian", color: "#94a3b8", nextAt: 20, next: "Gold" };
  if (r >= 5)  return { label: "Bronze Guardian", color: "#fb923c", nextAt: 10, next: "Silver" };
  return              { label: "New Guardian",    color: "#009A49", nextAt: 5,  next: "Bronze" };
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;

  const [profile,     setProfile]     = useState<UserProfile | null>(null);
  const [myItems,     setMyItems]     = useState<ItemRow[]>([]);
  const [nearbyItems, setNearbyItems] = useState<ItemRow[]>([]);
  const [recentChats, setRecentChats] = useState<ChatRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [stats,       setStats]       = useState({ reported: 0, recovered: 0, active: 0, chats: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      const { data: p } = await db.from("users").select("*").eq("id", user.id).single();
      if (p) setProfile(p);

      const { data: items } = await db.from("items").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(5);
      setMyItems(items ?? []);

      const [{ count: reported }, { count: recovered }, { count: active }, { count: chats }] = await Promise.all([
        db.from("items").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        db.from("items").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "recovered"),
        db.from("items").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["active", "matched"]),
        db.from("chats").select("*", { count: "exact", head: true }).or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`),
      ]);
      setStats({ reported: reported ?? 0, recovered: recovered ?? 0, active: active ?? 0, chats: chats ?? 0 });

      const q = p?.city
        ? db.from("items").select("*").eq("city", p.city).in("status", ["active", "matched"]).neq("user_id", user.id)
        : db.from("items").select("*").in("status", ["active", "matched"]).neq("user_id", user.id);
      const { data: nearby } = await q.order("created_at", { ascending: false }).limit(5);
      setNearbyItems(nearby ?? []);

      const { data: chatData } = await db.from("chats")
        .select("*, item:items(title, type)")
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order("created_at", { ascending: false }).limit(4);

      if (chatData) {
        const enriched = await Promise.all(chatData.map(async (c: any) => {
          const otherId = c.participant_a === user.id ? c.participant_b : c.participant_a;
          const { data: ou } = await db.from("users").select("full_name, avatar_url").eq("id", otherId).single();
          return { ...c, other_user: ou ?? null };
        }));
        setRecentChats(enriched);
      }

      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-white" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading your portal</p>
      </div>
    </main>
  );

  const g = getGuardian(profile?.recovery_count ?? 0);
  const points = ((profile?.recovery_count ?? 0) * 50) + (stats.reported * 10);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Guardian";
  const progress = Math.min(100, ((profile?.recovery_count ?? 0) / g.nextAt) * 100);

  return (
    <main className="min-h-screen bg-[#f0f4f8]">
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
        nav { background: white !important; border-bottom: 1px solid #e2e8f0 !important; }
        nav a, nav button, nav span { color: #1e293b !important; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-5">

        {/* ── TOP BAR ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-slate-400 text-sm font-medium">Hello, <span className="font-bold text-slate-700">{firstName}.</span></p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mt-0.5" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
              Here's what's happening{profile?.city ? ` in ${profile.city}` : " today"}.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all">
              <Bell size={18} />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-black text-sm overflow-hidden border-2 border-white shadow-md">
              {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" /> : firstName[0]}
            </div>
          </div>
        </motion.div>

        {/* ── MAIN GRID: left 2/3 (stat cards + my items) | right 1/3 (guardian + activity) ── */}
        <div className="grid lg:grid-cols-3 gap-4 items-start">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-2">

            {/* 4 stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Items Returned", value: stats.recovered, icon: CheckCircle,  bg: "bg-emerald-500", trend: "+12%", style: {} },
                { label: "Searching",      value: stats.active,    icon: Search,        bg: "bg-blue-500",    trend: "-1%",  style: {} },
                { label: "Total Reported", value: stats.reported,  icon: Flag,          bg: "bg-violet-500",  trend: "+5%",  style: {} },
                { label: "Active Chats",   value: stats.chats,     icon: MessageSquare, bg: "",               trend: "+2%",  style: { background: "#FF0000" } },
              ].map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className={`${s.bg} rounded-2xl p-3 md:p-5 shadow-sm relative overflow-hidden`}
                  style={s.style}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                  <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2 md:mb-4">
                      <div className="w-8 h-8 md:w-11 md:h-11 bg-white/20 rounded-xl flex items-center justify-center">
                        <s.icon size={16} className="text-white" />
                      </div>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white/20 text-white">{s.trend}</span>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-white leading-none" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{s.value.toLocaleString()}</p>
                    <p className="text-[9px] md:text-[10px] font-medium text-white/70 mt-1">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* My Items — immediately below stat cards */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden border-l-4 border-l-primary"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <h2 className="font-black text-sm text-slate-900">My Items</h2>
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] font-black">{stats.active} active</span>
                </div>
                <Link href="/browse" className="text-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                  View all <ChevronRight size={11} />
                </Link>
              </div>
              {myItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                    <Package size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 mb-1">No items reported yet</p>
                  <Link href="/report" className="mt-3 px-5 py-2.5 bg-[#061209] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">
                    Report First Item
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {myItems.map((item, i) => (
                    <Link href={`/browse/${item.id}`} key={item.id}>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-all cursor-pointer group"
                      >
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          {item.photos?.[0]
                            ? <img src={item.photos[0]} className="w-full h-full object-cover" alt="" />
                            : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-slate-300" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                            <MapPin size={9} />{item.location_name ?? item.city ?? "No location"} · {timeAgo(item.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${item.type === "lost" ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-600"}`}>{item.type}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                            item.status === "active" ? "bg-emerald-50 text-emerald-600" :
                            item.status === "matched" ? "bg-amber-50 text-amber-600" :
                            item.status === "recovered" ? "bg-slate-100 text-slate-400" : "bg-red-50 text-red-400"
                          }`}>{item.status}</span>
                          <ArrowUpRight size={14} className="text-slate-200 group-hover:text-primary transition-colors" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

          </div>{/* end left column */}

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* Guardian card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{ background: "#061209" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none" style={{ background: `${g.color}30` }} />
              <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full blur-[40px] pointer-events-none" style={{ background: `${g.color}15` }} />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${g.color}25` }}>
                    <Shield size={22} style={{ color: g.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-white text-sm leading-none" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{g.label}</p>
                      <span className="text-white font-black text-sm" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                        {profile?.recovery_count ?? 0}
                        <span className="text-white/30 text-[9px] font-medium ml-1">recoveries</span>
                      </span>
                    </div>
                    <p className="text-[9px] font-bold mt-1 flex items-center gap-1" style={{ color: g.color }}>
                      <Zap size={9} /> {points.toLocaleString()} pts
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Progress</p>
                    {g.next && <p className="text-[9px] font-black" style={{ color: g.color }}>{g.nextAt - (profile?.recovery_count ?? 0)} more to {g.next}</p>}
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full" style={{ backgroundColor: g.color }}
                    />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13}
                      style={{ color: i < Math.min(5, profile?.recovery_count ?? 0) ? g.color : "rgba(255,255,255,0.1)" }}
                      fill={i < Math.min(5, profile?.recovery_count ?? 0) ? g.color : "rgba(255,255,255,0.1)"}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-50"
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-blue-400" />
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50">
                <h2 className="font-black text-sm text-slate-900">Recent Activity</h2>
                <Link href="/browse"><ArrowUpRight size={15} className="text-slate-300 hover:text-primary transition-colors" /></Link>
              </div>
              {nearbyItems.length === 0 ? (
                <p className="text-[10px] font-bold text-slate-300 text-center py-8">No activity yet</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {nearbyItems.map(item => (
                    <Link href={`/browse/${item.id}`} key={item.id}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-all cursor-pointer">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          {item.photos?.[0]
                            ? <img src={item.photos[0]} className="w-full h-full object-cover" alt="" />
                            : <Package size={13} className="text-slate-300 m-auto mt-2.5" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{item.title}</p>
                          <p className="text-[9px] text-slate-400">{timeAgo(item.created_at)}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase shrink-0 ${item.type === "lost" ? "bg-red-50 text-red-400" : "bg-emerald-50 text-emerald-600"}`}>{item.type}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div className="px-4 py-3 border-t border-slate-50">
                <Link href="/browse" className="text-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all justify-end">
                  View all <ChevronRight size={11} />
                </Link>
              </div>
            </motion.div>

          </div>{/* end right column */}

        </div>{/* end main grid */}

        {/* ── ROW 3: RECENT CHATS + QUICK ACTIONS ── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Recent Chats */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Recent Chats</h2>
            </div>
            {recentChats.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2">
                <MessageSquare size={24} className="text-slate-200" />
                <p className="text-xs font-bold text-slate-300">No chats yet</p>
              </div>
            ) : (
              <div>
                {recentChats.map((chat, i) => (
                  <Link href={`/messages?id=${chat.id}`} key={chat.id}>
                    <div className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-all cursor-pointer ${i < recentChats.length - 1 ? "border-b border-slate-50" : ""}`}>
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {chat.other_user?.avatar_url
                          ? <img src={chat.other_user.avatar_url} className="w-full h-full object-cover" alt="" />
                          : <span className="text-slate-500 font-bold text-sm">{chat.other_user?.full_name?.[0] ?? "?"}</span>
                        }
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{chat.item?.title ?? "Chat"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">with {chat.other_user?.full_name ?? "Unknown"}</p>
                      </div>
                      {/* Badge + arrow */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {chat.status}
                        </span>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {/* View all chats */}
            <div className="px-5 py-4 border-t border-slate-100">
              <Link href="/messages" className="flex items-center justify-center gap-2 text-primary text-sm font-bold hover:underline">
                View all chats <ChevronRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-base text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-3">
              {/* 2x2 grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: "/report",   icon: Flag,          label: "Report Lost Item",  sub: "Post in 2 minutes",   iconBg: "bg-emerald-100" },
                  { href: "/report",   icon: Navigation,    label: "Report Found Item", sub: "Help someone recover", iconBg: "bg-emerald-100" },
                  { href: "/browse",   icon: Search,        label: "Browse Feed",       sub: "See all reports",      iconBg: "bg-emerald-100" },
                  { href: "/messages", icon: MessageSquare, label: "My Messages",       sub: `${stats.chats} active`,iconBg: "bg-emerald-100" },
                ].map((a, i) => (
                  <Link href={a.href} key={i}>
                    <div className="bg-emerald-50 hover:bg-emerald-100 transition-all rounded-xl p-3 cursor-pointer flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 ${a.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                          <a.icon size={15} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[11px] text-slate-800 leading-tight truncate">{a.label}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">{a.sub}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-primary/50 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Report Item CTA */}
              <Link href="/report">
                <div className="bg-[#061209] hover:bg-primary transition-all rounded-xl px-5 py-4 flex items-center justify-between cursor-pointer group">
                  <span className="text-white font-bold text-sm group-hover:text-[#061209]">Report Item</span>
                  <ChevronRight size={18} className="text-white group-hover:text-[#061209]" />
                </div>
              </Link>
            </div>
          </motion.div>

        </div>{/* end row 3 */}

      </div>{/* end max-w-7xl */}

      {/* FAB */}
      <Link href="/report">
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-6 md:right-10 bg-[#061209] text-white pl-5 pr-7 py-4 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-white/10 hover:bg-primary transition-all"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-[#061209]">
            <Plus size={18} strokeWidth={3} />
          </div>
          <span className="font-black uppercase tracking-widest text-[10px]">Report Item</span>
        </motion.button>
      </Link>
    </main>
  );
}