// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus, ChevronRight, Star, TrendingUp,
  CheckCircle, Search, Package, Loader2,
  MessageSquare, Clock, LayoutGrid
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  rating: number;
  recovery_count: number;
  role: string;
};

type ItemRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  city: string | null;
  location_name: string | null;
  created_at: string;
  photos: string[];
};

type ChatRow = {
  id: string;
  status: string;
  created_at: string;
  item: { title: string; type: string } | null;
  other_user: { full_name: string } | null;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getGuardianLevel(recoveries: number): string {
  if (recoveries >= 20) return "Gold Guardian";
  if (recoveries >= 10) return "Silver Guardian";
  if (recoveries >= 5)  return "Bronze Guardian";
  return "New Guardian";
}

function getGuardianColor(level: string): string {
  if (level === "Gold Guardian")   return "text-yellow-400 border-yellow-400/30 bg-yellow-400/10";
  if (level === "Silver Guardian") return "text-slate-300 border-slate-300/30 bg-slate-300/10";
  if (level === "Bronze Guardian") return "text-orange-400 border-orange-400/30 bg-orange-400/10";
  return "text-primary border-primary/30 bg-primary/10";
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myItems, setMyItems] = useState<ItemRow[]>([]);
  const [nearbyItems, setNearbyItems] = useState<ItemRow[]>([]);
  const [recentChats, setRecentChats] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ reported: 0, recovered: 0, active: 0, chats: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      // Load profile
      const { data: profileData } = await db.from("users").select("*").eq("id", user.id).single();
      if (profileData) setProfile(profileData);

      // Load my items
      const { data: items } = await db.from("items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5);
      setMyItems(items ?? []);

      // Stats
      const [{ count: reported }, { count: recovered }, { count: active }, { count: chats }] = await Promise.all([
        db.from("items").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        db.from("items").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "recovered"),
        db.from("items").select("*", { count: "exact", head: true }).eq("user_id", user.id).in("status", ["active", "matched"]),
        db.from("chats").select("*", { count: "exact", head: true }).or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`),
      ]);
      setStats({ reported: reported ?? 0, recovered: recovered ?? 0, active: active ?? 0, chats: chats ?? 0 });

      // Nearby items (same city)
      if (profileData?.city) {
        const { data: nearby } = await db.from("items").select("*").eq("city", profileData.city).in("status", ["active", "matched"]).neq("user_id", user.id).order("created_at", { ascending: false }).limit(4);
        setNearbyItems(nearby ?? []);
      } else {
        const { data: nearby } = await db.from("items").select("*").in("status", ["active", "matched"]).neq("user_id", user.id).order("created_at", { ascending: false }).limit(4);
        setNearbyItems(nearby ?? []);
      }

      // Recent chats
      const { data: chatData } = await db.from("chats")
        .select("*, item:items(title, type)")
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(3);

      if (chatData) {
        const enriched = await Promise.all(chatData.map(async (chat: any) => {
          const otherId = chat.participant_a === user.id ? chat.participant_b : chat.participant_a;
          const { data: otherUser } = await db.from("users").select("full_name").eq("id", otherId).single();
          return { ...chat, other_user: otherUser ?? null };
        }));
        setRecentChats(enriched);
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </main>
  );

  const guardianLevel = getGuardianLevel(profile?.recovery_count ?? 0);
  const guardianColor = getGuardianColor(guardianLevel);
  const points = ((profile?.recovery_count ?? 0) * 50) + (stats.reported * 10);
  const firstName = profile?.full_name?.split(" ")[0] ?? "Guardian";

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Guardian Portal</p>
            <h2 className="text-3xl font-black font-clash uppercase tracking-tighter">Your Activity</h2>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 pl-2 pr-4 py-1.5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-black text-[10px] overflow-hidden">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                  : profile?.full_name?.charAt(0).toUpperCase()
                }
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-dark leading-none">{profile?.full_name}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{guardianLevel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Hero Profile Card */}
          <div className="md:col-span-8 bg-dark rounded-[3rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/20 transition-all duration-700" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between h-full text-white">
              <div className="space-y-6">
                <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${guardianColor}`}>
                  <Star size={12} fill="currentColor" /> {guardianLevel}
                </div>
                <h1 className="text-5xl md:text-6xl font-black font-clash uppercase leading-[0.9] tracking-tighter">
                  Welcome, <br /><span className="text-primary">{firstName}.</span>
                </h1>
                <p className="text-white/40 text-sm font-medium max-w-sm">
                  {profile?.recovery_count && profile.recovery_count > 0
                    ? <>Your activity is helping keep Cameroon honest. You've recovered <span className="text-white font-bold">{profile.recovery_count} item{profile.recovery_count !== 1 ? "s" : ""}</span>.</>
                    : <>Welcome to Back2U. Start by reporting a lost or found item to help your community.</>
                  }
                </p>
              </div>
              <div className="mt-8 md:mt-0 flex gap-4 self-end">
                <div className="bg-white/5 p-5 rounded-[2rem] min-w-[110px] text-center border border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Reported</p>
                  <span className="text-2xl font-black font-clash">{stats.reported}</span>
                  <TrendingUp size={14} className="text-primary mx-auto mt-1" />
                </div>
                <div className="bg-primary p-5 rounded-[2rem] min-w-[110px] text-center border border-white/5 text-dark">
                  <p className="text-[9px] font-black uppercase tracking-widest text-dark/60 mb-2">Points</p>
                  <span className="text-2xl font-black font-clash">{points.toLocaleString()}</span>
                  <CheckCircle size={14} className="text-dark mx-auto mt-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Activity */}
          <div className="md:col-span-4 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-clash font-black uppercase tracking-widest text-sm text-dark">
                {profile?.city ? `Near ${profile.city}` : "Recent Activity"}
              </h2>
              <Link href="/browse"><ChevronRight size={18} className="text-slate-300 hover:text-primary transition-colors" /></Link>
            </div>

            <div className="space-y-5 flex-1">
              {nearbyItems.length === 0 ? (
                <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest text-center py-8">No nearby items yet</p>
              ) : (
                nearbyItems.map(item => (
                  <Link href={`/browse/${item.id}`} key={item.id}>
                    <div className="flex items-center gap-4 group cursor-pointer mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden ${item.type === "lost" ? "bg-red-50" : "bg-primary/10"}`}>
                        {item.photos?.[0]
                          ? <img src={item.photos[0]} className="w-full h-full object-cover" alt="" />
                          : <Search size={20} className={item.type === "lost" ? "text-red-400" : "text-primary"} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs uppercase tracking-tight text-dark truncate">{item.title}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.location_name ?? item.city ?? "Unknown"} · {timeAgo(item.created_at)}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${item.type === "lost" ? "bg-red-50 text-red-400" : "bg-primary/10 text-primary"}`}>{item.type}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <Link href="/browse" className="w-full mt-4 py-4 bg-slate-50 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 hover:bg-dark hover:text-white transition-all text-center block">
              Browse All
            </Link>
          </div>

          {/* My Active Items */}
          <div className="md:col-span-5 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-clash font-black uppercase tracking-widest text-sm text-dark">My Items</h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">{stats.active} active</span>
              </div>
            </div>

            <div className="space-y-4">
              {myItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No items reported yet</p>
                  <Link href="/report" className="inline-flex mt-4 px-6 py-3 bg-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-dark transition-all">
                    Report Item
                  </Link>
                </div>
              ) : (
                myItems.map(item => (
                  <Link href={`/browse/${item.id}`} key={item.id}>
                    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer mb-2">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        {item.photos?.[0]
                          ? <img src={item.photos[0]} className="w-full h-full object-cover" alt="" />
                          : <Package size={20} className="text-slate-300 m-auto mt-3" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-xs uppercase tracking-tight text-dark truncate">{item.title}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{timeAgo(item.created_at)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        item.status === "active"   ? "bg-primary/10 text-primary" :
                        item.status === "matched"  ? "bg-secondary/20 text-secondary" :
                        item.status === "recovered"? "bg-slate-100 text-slate-400" :
                        "bg-red-50 text-red-400"
                      }`}>{item.status}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Chats + Stats */}
          <div className="md:col-span-7 space-y-6">

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Recovered", value: stats.recovered, color: "bg-primary text-dark" },
                { label: "Active",    value: stats.active,    color: "bg-dark text-white" },
                { label: "Chats",     value: stats.chats,     color: "bg-secondary/20 text-dark" },
              ].map(s => (
                <div key={s.label} className={`${s.color} rounded-[2rem] p-6 text-center`}>
                  <p className="text-3xl font-black font-clash">{s.value}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Recent chats */}
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-clash font-black uppercase tracking-widest text-sm text-dark">Recent Chats</h2>
                <Link href="/chat"><ChevronRight size={18} className="text-slate-300 hover:text-primary transition-colors" /></Link>
              </div>

              {recentChats.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare size={28} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">No chats yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentChats.map(chat => (
                    <Link href={`/chat?id=${chat.id}`} key={chat.id}>
                      <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${chat.item?.type === "lost" ? "bg-red-50" : "bg-primary/10"}`}>
                          <MessageSquare size={16} className={chat.item?.type === "lost" ? "text-red-400" : "text-primary"} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-xs uppercase tracking-tight text-dark truncate">{chat.item?.title ?? "Chat"}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">with {chat.other_user?.full_name ?? "Unknown"}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${chat.status === "recovered" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>
                          {chat.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Guardian level progress */}
          <div className="md:col-span-12 bg-primary rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <h2 className="text-dark font-clash font-black text-3xl uppercase tracking-tighter leading-none">
                {guardianLevel}
              </h2>
              <p className="text-dark/60 text-xs font-bold uppercase tracking-widest">
                {profile?.recovery_count ?? 0} recoveries · {points.toLocaleString()} points
                {guardianLevel !== "Gold Guardian" && ` · ${guardianLevel === "Bronze Guardian" ? 10 - (profile?.recovery_count ?? 0) : guardianLevel === "Silver Guardian" ? 20 - (profile?.recovery_count ?? 0) : 5 - (profile?.recovery_count ?? 0)} more to next level`}
              </p>
              {/* Progress bar */}
              <div className="w-64 h-2 bg-dark/20 rounded-full mt-3">
                <div
                  className="h-2 bg-dark rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, ((profile?.recovery_count ?? 0) / (guardianLevel === "Gold Guardian" ? 20 : guardianLevel === "Silver Guardian" ? 20 : guardianLevel === "Bronze Guardian" ? 10 : 5)) * 100)}%` }}
                />
              </div>
            </div>
            <div className="flex -space-x-4 mt-6 md:mt-0 relative z-10">
              {[...Array(Math.min(5, Math.max(1, profile?.recovery_count ?? 0)))].map((_, i) => (
                <div key={i} className="w-16 h-16 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-lg">
                  <Star size={20} className="text-primary" fill="currentColor" />
                </div>
              ))}
            </div>
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <LayoutGrid size={300} strokeWidth={0.5} className="text-dark" />
            </div>
          </div>

        </div>

        {/* FAB */}
        <Link href="/report">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-10 right-10 bg-dark text-white pl-8 pr-10 py-6 rounded-full shadow-2xl flex items-center gap-4 z-50 border border-white/10"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-dark">
              <Plus size={24} strokeWidth={3} />
            </div>
            <span className="font-clash font-black uppercase tracking-widest text-xs">Report Item</span>
          </motion.button>
        </Link>
      </div>
    </main>
  );
}