// src/app/browse/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Plus, Clock,
  Map as MapIcon, LayoutGrid, Calendar, Flag,
  Loader2, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { ItemRow, UserRow } from "@/types/database";
import MatchSystem from "@/components/MatchAndChat";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const PAGE_SIZE = 9;

type ItemWithUser = ItemRow & {
  user: Pick<UserRow, "id" | "full_name" | "avatar_url"> | null;
};

type DateFilter = "Today" | "Yesterday" | "This Week" | "This Month" | "All";

function getDateRange(filter: DateFilter): string | null {
  const now = new Date();
  if (filter === "Today") { const s = new Date(now); s.setHours(0,0,0,0); return s.toISOString(); }
  if (filter === "Yesterday") { const s = new Date(now); s.setDate(s.getDate()-1); s.setHours(0,0,0,0); return s.toISOString(); }
  if (filter === "This Week") { const s = new Date(now); s.setDate(s.getDate()-7); return s.toISOString(); }
  if (filter === "This Month") { const s = new Date(now); s.setDate(s.getDate()-30); return s.toISOString(); }
  return null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function ItemCard({ item, onFlag }: { item: ItemWithUser; onFlag: (id: string) => void }) {
  const router = useRouter();
  const isFound = item.type === "found";
  const isSensitive = item.sensitivity === "sensitive" || item.sensitivity === "very_sensitive";
  const isPending = item.status === "pending_review";
  const firstPhoto = item.photos?.[0];

  return (
    <motion.div
      whileHover={{ y: -12 }}
      onClick={() => router.push(`/browse/${item.id}`)}
      className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group cursor-pointer relative"
    >
      <div className="aspect-[16/11] overflow-hidden relative bg-slate-100">
        {firstPhoto ? (
          <Image
            src={firstPhoto}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${isSensitive ? "blur-xl scale-110" : "grayscale-[0.3] group-hover:grayscale-0"}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin size={32} className="text-slate-300" />
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
            <span className="px-4 py-2 bg-secondary text-dark rounded-full text-[9px] font-black uppercase tracking-widest">Pending Review</span>
          </div>
        )}
        {isSensitive && !isPending && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="px-4 py-2 bg-black/50 backdrop-blur-md text-white rounded-full text-[9px] font-black uppercase tracking-widest">Sensitive Item</span>
          </div>
        )}
        <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 z-10">
          <Clock size={12} className="text-primary" />
          {new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </div>
        <div className={`absolute top-5 left-5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl z-10 ${isFound ? "bg-primary text-dark" : "bg-[#FF4D4D] text-white"}`}>
          {item.type}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onFlag(item.id); }}
          className="absolute top-5 right-5 w-8 h-8 bg-black/40 backdrop-blur-md rounded-xl flex items-center justify-center text-white/60 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 z-10"
          aria-label="Flag item"
        >
          <Flag size={12} />
        </button>
      </div>
      <div className="p-8">
        <h3 className="text-xl font-black font-clash uppercase tracking-tight mb-4 group-hover:text-primary transition-colors text-dark">{item.title}</h3>
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" />{item.location_name || item.city || "Location unknown"}</span>
          <span>{timeAgo(item.created_at)}</span>
        </div>
        {!item.is_anonymous && item.user && (
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-3">by {item.user.full_name}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function BrowseMarketplace() {
  const supabase = createClient();
  const [view, setView] = useState<"grid" | "map">("grid");
  const [items, setItems] = useState<ItemWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeDateRange, setActiveDateRange] = useState<DateFilter>("All");
  const [typeFilter, setTypeFilter] = useState<"all" | "lost" | "found">("all");
  const [page, setPage] = useState(0);
  const [selectedMapItem, setSelectedMapItem] = useState<ItemWithUser | null>(null);
  const [mapViewport, setMapViewport] = useState({ longitude: 11.5021, latitude: 3.8480, zoom: 6 });
  const [userCity, setUserCity] = useState<string | null>(null);
  const [flagItemId, setFlagItemId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const dateFilters: DateFilter[] = ["Today", "Yesterday", "This Week", "This Month", "All"];

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from("users").select("city").eq("id", user.id).single();
      if (data?.city) setUserCity(data.city);
    });
  }, []);

  useEffect(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    supabase.from("items").select("*", { count: "exact", head: true })
      .eq("status", "active").eq("admin_approved", true)
      .gte("created_at", today.toISOString())
      .then(({ count }) => setTodayCount(count ?? 0));
  }, []);

  const fetchItems = useCallback(async (pageNum: number, replace = false) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true);
    setError(null);
    try {
      let query = supabase
        .from("items")
        .select("*, user:users(id, full_name, avatar_url)")
        .in("status", ["active", "matched"])
        .eq("admin_approved", true)
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);
      if (typeFilter !== "all") query = query.eq("type", typeFilter);
      if (search.trim()) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location_name.ilike.%${search}%`);
      const dateFrom = getDateRange(activeDateRange);
      if (dateFrom) query = query.gte("created_at", dateFrom);
      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      const newItems = (data as ItemWithUser[]) ?? [];
      const sorted = userCity
        ? [...newItems.filter(i => i.city === userCity), ...newItems.filter(i => i.city !== userCity)]
        : newItems;
      setItems(prev => replace ? sorted : [...prev, ...sorted]);
      setHasMore(newItems.length === PAGE_SIZE);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, activeDateRange, typeFilter, userCity]);

  useEffect(() => { setPage(0); setItems([]); fetchItems(0, true); }, [search, activeDateRange, typeFilter]);
  useEffect(() => { if (page > 0) fetchItems(page); }, [page]);
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) setPage(p => p + 1);
    }, { threshold: 0.1 });
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);
  useEffect(() => { const t = setTimeout(() => setSearch(searchInput), 400); return () => clearTimeout(t); }, [searchInput]);

  const handleFlag = async (itemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Please log in to flag items."); return; }
    setFlagItemId(itemId);
  };
  const submitFlag = async () => {
    if (!flagReason.trim() || !flagItemId) return;
    setFlagSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("flags").insert({ item_id: flagItemId, reported_by: user.id, reason: flagReason });
    setFlagItemId(null); setFlagReason(""); setFlagSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-20 z-[50] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setView("grid")} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === "grid" ? "bg-white shadow-sm text-black" : "text-slate-400"}`}><LayoutGrid size={14} /> List View</button>
            <button onClick={() => setView("map")} className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === "map" ? "bg-white shadow-sm text-black" : "text-slate-400"}`}><MapIcon size={14} /> Map View</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {(["all", "lost", "found"] as const).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === t ? "bg-white shadow-sm text-black" : "text-slate-400"}`}>{t}</button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{todayCount} Items Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {view === "grid" && (
            <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-7xl mx-auto px-6 py-12">
              <header className="mb-10">
                <h1 className="text-5xl font-black font-clash tracking-tighter mb-6 italic text-dark uppercase">Discovery Hub</h1>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                      <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search items, locations, serial numbers..." className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm outline-none focus:ring-4 ring-primary/5 transition-all shadow-sm text-slate-900 placeholder:text-slate-400" />
                    </div>
                    <Link href="/report" className="px-8 py-4 bg-dark text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-dark transition-all shadow-lg shadow-black/10"><Plus size={16} strokeWidth={3} /> Report Item</Link>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 shrink-0"><Calendar size={16} /></div>
                    {dateFilters.map(range => (
                      <button key={range} onClick={() => setActiveDateRange(range)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeDateRange === range ? "bg-primary text-dark shadow-lg shadow-primary/20" : "bg-white border border-slate-100 text-slate-400 hover:border-slate-300"}`}>{range}</button>
                    ))}
                  </div>
                </div>
              </header>
              {error && <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 text-red-500 text-sm font-bold"><AlertCircle size={16} /> {error}</div>}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden animate-pulse">
                      <div className="aspect-[16/11] bg-slate-100" />
                      <div className="p-8 space-y-3"><div className="h-5 bg-slate-100 rounded-full w-3/4" /><div className="h-3 bg-slate-100 rounded-full w-1/2" /></div>
                    </div>
                  ))}
                </div>
              )}
              {!loading && (
                <>
                  {items.length === 0 ? (
                    <div className="text-center py-32">
                      <p className="text-slate-300 font-clash font-black text-4xl uppercase tracking-tighter">No items found</p>
                      <p className="text-slate-400 text-sm mt-4">Try adjusting your filters or be the first to report</p>
                      <Link href="/report" className="inline-flex mt-8 px-8 py-4 bg-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-dark transition-all">Report an Item</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                      {items.map(item => <ItemCard key={item.id} item={item} onFlag={handleFlag} />)}
                    </div>
                  )}
                  <div ref={loaderRef} className="flex justify-center py-8">
                    {loadingMore && <Loader2 size={24} className="animate-spin text-primary" />}
                    {!hasMore && items.length > 0 && <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">All items loaded</p>}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === "map" && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-[calc(100vh-140px)]">
              <Map mapboxAccessToken={MAPBOX_TOKEN} initialViewState={mapViewport} style={{ width: "100%", height: "100%" }} mapStyle="mapbox://styles/mapbox/light-v11" onMove={e => setMapViewport(e.viewState)}>
                <NavigationControl position="top-right" />
                {items.map(item => (
                  <Marker key={item.id} longitude={11.5021} latitude={3.8480} anchor="bottom" onClick={e => { e.originalEvent.stopPropagation(); setSelectedMapItem(item); }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.15, rotate: 12 }} className={`w-12 h-12 rounded-[1rem] shadow-2xl flex items-center justify-center border-2 cursor-pointer ${item.type === "found" ? "bg-white border-primary" : "bg-white border-[#FF4D4D]"}`}>
                      <MapPin size={20} className={item.type === "found" ? "text-primary" : "text-[#FF4D4D]"} />
                    </motion.div>
                  </Marker>
                ))}
                {selectedMapItem && (
                  <Popup longitude={11.5021} latitude={3.8480} anchor="top" onClose={() => setSelectedMapItem(null)} closeButton={false}>
                    <div className="p-4 bg-white cursor-pointer w-52" onClick={() => window.location.href = `/browse/${selectedMapItem.id}`}>
                      {selectedMapItem.photos?.[0] && (
                        <div className="relative w-full h-28 rounded-xl mb-3 overflow-hidden">
                          <Image src={selectedMapItem.photos[0]} alt={selectedMapItem.title} fill sizes="208px" className={`object-cover ${selectedMapItem.sensitivity !== "normal" ? "blur-md" : ""}`} />
                        </div>
                      )}
                      <div className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest mb-2 ${selectedMapItem.type === "found" ? "bg-primary text-dark" : "bg-[#FF4D4D] text-white"}`}>{selectedMapItem.type}</div>
                      <p className="font-clash font-black text-sm uppercase tracking-tight text-dark">{selectedMapItem.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedMapItem.location_name || selectedMapItem.city}</p>
                    </div>
                  </Popup>
                )}
              </Map>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {flagItemId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6" onClick={() => setFlagItemId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl">
              <Flag size={32} className="text-red-400 mb-4" />
              <h3 className="font-clash font-black text-2xl uppercase tracking-tighter mb-2">Flag This Item</h3>
              <p className="text-slate-400 text-sm mb-6">Tell us why this item seems suspicious.</p>
              <textarea rows={3} value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="Describe the issue..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm outline-none focus:ring-2 ring-red-200 resize-none mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setFlagItemId(null)} className="flex-1 py-4 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={submitFlag} disabled={flagSubmitting || !flagReason.trim()} className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                  {flagSubmitting ? <Loader2 size={14} className="animate-spin" /> : null} Submit Flag
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MatchSystem />
    </main>
  );
}