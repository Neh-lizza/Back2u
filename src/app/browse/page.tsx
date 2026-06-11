// src/app/browse/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Plus, Clock,
  Map as MapIcon, LayoutGrid, ChevronDown,
  Loader2, Flag, SlidersHorizontal, CheckCircle, Navigation,
  AlertTriangle, Package
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { useI18n } from "@/lib/i18n";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
const PAGE_SIZE = 12;

const CAMEROON_CITIES = ["All Cities","Douala","Yaoundé","Buea","Bamenda","Garoua","Maroua","Bafoussam","Ngaoundéré","Bertoua","Ebolowa"];
const CATEGORIES = ["All","Electronics","Documents","Clothing","Bags","Keys","Jewelry","Money","Animals","Other"];
const DATE_OPTIONS = ["Any time","Today","Yesterday","This Week","This Month"];
const STATUS_OPTIONS = ["All","Lost","Found"];

const CITY_COORDS: Record<string, { lng: number; lat: number }> = {
  "Douala":     { lng: 9.7085,  lat: 4.0511 },
  "Yaoundé":    { lng: 11.5021, lat: 3.8480 },
  "Buea":       { lng: 9.2316,  lat: 4.1527 },
  "Bamenda":    { lng: 10.1592, lat: 5.9597 },
  "Garoua":     { lng: 13.3990, lat: 9.3017 },
  "Maroua":     { lng: 14.3158, lat: 10.591 },
  "Bafoussam":  { lng: 10.4200, lat: 5.4781 },
  "Ngaoundéré": { lng: 13.5840, lat: 7.3220 },
  "Bertoua":    { lng: 13.6860, lat: 4.5785 },
  "Ebolowa":    { lng: 11.1500, lat: 2.9000 },
};

type ItemWithUser = {
  id: string; user_id: string; type: string; title: string;
  photos: string[]; location_name: string | null; city: string | null;
  status: string; sensitivity: string; is_anonymous: boolean;
  created_at: string; category: string | null;
  is_missing_person?: boolean;
  user: { id: string; full_name: string; avatar_url: string | null } | null;
};

function formatDate(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getItemCoords(item: ItemWithUser) {
  if ((item as any).latitude && (item as any).longitude) {
    return { lng: (item as any).longitude, lat: (item as any).latitude };
  }
  return CITY_COORDS[item.city ?? ""] ?? { lng: 11.5021, lat: 3.8480 };
}

// ── SKELETON CARD ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
      <div className="bg-slate-100" style={{ aspectRatio: "4/3" }} />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-2.5 bg-slate-100 rounded-lg w-1/2" />
        <div className="h-2.5 bg-slate-100 rounded-lg w-2/3" />
      </div>
    </div>
  );
}

// ── DROPDOWN ─────────────────────────────────────────────
function Dropdown({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const isActive = !["All", "All Cities", "Any time"].includes(value);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
          isActive
            ? "bg-primary text-white border border-primary"
            : "bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
        }`}>
        {label}: <span className="font-bold">{value}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute top-full mt-1.5 left-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-1 min-w-[150px]"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
            {options.map(o => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center gap-2 ${
                  value === o ? "text-primary font-bold bg-primary/5" : "text-slate-600 font-medium hover:bg-slate-50"
                }`}>
                {value === o && <CheckCircle size={11} className="text-primary shrink-0" />}
                {value !== o && <span className="w-3 shrink-0" />}
                {o}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ITEM CARD ─────────────────────────────────────────────
function ItemCard({ item, onFlag }: { item: ItemWithUser; onFlag: (id: string) => void }) {
  const router = useRouter();
  const isFound = item.type === "found";
  const isMissing = item.is_missing_person;
  const isSensitive = item.sensitivity === "sensitive" || item.sensitivity === "very_sensitive";
  const firstPhoto = item.photos?.[0];

  const tagBg   = isMissing ? "#CE1126" : isFound ? "#FCD116" : "#FF4D4D";
  const tagColor = isFound && !isMissing ? "#061209" : "white";
  const tagLabel = isMissing ? "Missing" : isFound ? "Found" : "Lost";
  const tagIcon  = isMissing ? <AlertTriangle size={9} /> : isFound ? <CheckCircle size={9} /> : <Search size={9} />;

  const borderColor = isMissing
    ? "rgba(206,17,38,0.35)"
    : isFound
    ? "rgb(190,190,190)"
    : "rgb(190,190,190)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push(`/browse/${item.id}`)}
      className="cursor-pointer group"
      style={{
        background: "white",
        borderRadius: "10px",
        transition: "border-radius 0.5s cubic-bezier(0.175,0.885,0.32,1.275), transform 0.3s",
        boxShadow: isMissing
          ? `inset 0 -3em 3em rgba(206,17,38,0.04), 0 0 0 2px ${borderColor}, 0.3em 0.3em 1em rgba(0,0,0,0.25)`
          : `inset 0 -3em 3em rgba(0,0,0,0.06), 0 0 0 2px ${borderColor}, 0.3em 0.3em 1em rgba(0,0,0,0.25)`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      whileHover={{
        borderRadius: "20px",
        y: -3,
        boxShadow: `inset 0 -3em 3em rgba(0,0,0,0.08), 0 0 0 2px #009A49, 0.3em 0.3em 1.4em rgba(0,0,0,0.3)`,
      }}>

      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: "180px", background: isMissing ? "#fff0f1" : isFound ? "#f0faf4" : "#fff1f1" }}>
        {firstPhoto ? (
          <>
            <Image src={firstPhoto} alt={item.title} fill sizes="33vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSensitive ? "blur-xl scale-110" : ""}`}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 60%)" }} />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <Package size={28} className="opacity-20" style={{ color: tagBg }} />
          </div>
        )}

        {/* Type tag */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide"
          style={{ background: tagBg, color: tagColor }}>
          {tagIcon} {tagLabel}
        </div>

        {/* Sensitive overlay */}
        {isSensitive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" style={{ background: "rgba(0,0,0,0.5)" }}>
            <Package size={22} className="text-white opacity-30" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white opacity-40">Sensitive</span>
          </div>
        )}

        {/* Flag button on hover */}
        <button onClick={e => { e.stopPropagation(); onFlag(item.id); }}
          className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
          <Flag size={10} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-3 pt-2 pb-2.5">
        <h3 className="truncate mb-1.5 leading-tight" style={{ fontWeight: 800, fontSize: "15px", color: "#0f172a" }}>{item.title}</h3>

        {/* Location + Category + Time all on same row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          <MapPin size={10} className="shrink-0" style={{ color: isMissing ? "#CE1126" : "#009A49" }} />
          <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[90px]">{item.location_name || item.city || "Unknown"}</span>
          <span className="text-slate-300 text-[10px]">·</span>
          <span className="text-[10px] font-medium text-slate-400">{formatDate(item.created_at)}</span>
          {item.category && (
            <>
              <span className="text-slate-300 text-[10px]">·</span>
              <span className="text-[9px] font-bold uppercase tracking-wide capitalize"
                style={{ color: isMissing ? "#CE1126" : "#64748b" }}>
                {isMissing ? "Missing" : item.category}
              </span>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between" style={{ borderTop: "1px solid #f1f5f9", paddingTop: "6px" }}>
          {item.user && !item.is_anonymous ? (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
              style={{ background: isMissing ? "#CE1126" : "#009A49" }}>
              {item.user.full_name?.[0]?.toUpperCase()}
            </div>
          ) : <div />}
          <button
            onClick={e => { e.stopPropagation(); router.push(`/browse/${item.id}`); }}
            className="text-[10px] font-bold rounded-full px-3 py-1 transition-all"
            style={{ color: isMissing ? "#CE1126" : "#009A49", border: `1.5px solid ${isMissing ? "#CE1126" : "#009A49"}`, background: "transparent" }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = isMissing ? "#CE1126" : "#009A49"; (e.target as HTMLButtonElement).style.color = "white"; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.color = isMissing ? "#CE1126" : "#009A49"; }}>
            See more
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN ──────────────────────────────────────────────────
export default function BrowseMarketplace() {
  const supabase = createClient();
  const { t } = useI18n();
  const db = supabase as any;
  const [view, setView] = useState<"grid" | "map">("grid");
  const [items, setItems] = useState<ItemWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");
  const [date, setDate] = useState("Any time");
  const [location, setLocation] = useState("All Cities");
  const [radius, setRadius] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [selectedMapItem, setSelectedMapItem] = useState<ItemWithUser | null>(null);
  const [mapViewport, setMapViewport] = useState({ longitude: 12.35, latitude: 5.96, zoom: 5.5 });
  const [flaggedId, setFlaggedId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const getUserLocation = () => {
    if (!navigator.geolocation) return;
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGettingLocation(false);
        setRadius(5); // default 5km when GPS enabled
      },
      () => setGettingLocation(false)
    );
  };

  const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const fetchItems = useCallback(async (pageNum: number, reset = false) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    let q = db.from("items")
      .select("*, user:users(id, full_name, avatar_url)")
      .in("status", ["active", "matched"])
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (status === "missing") q = q.eq("is_missing_person", true);
    else if (status !== "All") q = q.eq("type", status.toLowerCase());
    if (category !== "All") q = q.eq("category", category.toLowerCase());
    if (location !== "All Cities") q = q.eq("city", location);
    if (search) q = q.ilike("title", `%${search}%`);

    if (date === "Today") { const s = new Date(); s.setHours(0,0,0,0); q = q.gte("created_at", s.toISOString()); }
    else if (date === "Yesterday") { const s = new Date(); s.setDate(s.getDate()-1); s.setHours(0,0,0,0); const e = new Date(s); e.setHours(23,59,59,999); q = q.gte("created_at", s.toISOString()).lte("created_at", e.toISOString()); }
    else if (date === "This Week") { const s = new Date(); s.setDate(s.getDate()-7); q = q.gte("created_at", s.toISOString()); }
    else if (date === "This Month") { const s = new Date(); s.setDate(s.getDate()-30); q = q.gte("created_at", s.toISOString()); }

    const { data: rawData } = await q;

    // Client-side radius filter if user has GPS and radius is set
    let filteredData = rawData ?? [];
    if (radius && userCoords && filteredData.length > 0) {
      filteredData = filteredData.filter((item: any) => {
        if (!item.latitude || !item.longitude) return true; // include items without coords
        const dist = haversineKm(userCoords.lat, userCoords.lng, item.latitude, item.longitude);
        return dist <= radius;
      });
    }
    const data = filteredData;
    const newItems = data ?? [];
    setItems(prev => reset ? newItems : [...prev, ...newItems]);
    setHasMore(newItems.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, [status, category, location, date, search, radius, userCoords]);

  useEffect(() => { setPage(0); fetchItems(0, true); }, [fetchItems]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        const next = page + 1;
        setPage(next);
        fetchItems(next);
      }
    }, { threshold: 0.1 });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, page, fetchItems]);

  const activeFilterCount = [
    status !== "All",
    category !== "All",
    date !== "Any time",
    location !== "All Cities",
    radius !== null,
  ].filter(Boolean).length;

  return (
    <main style={{ background: "#F0F4F8" }}>
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .back2u-popup .mapboxgl-popup-content { background: transparent; padding: 0; box-shadow: none; }
        .back2u-popup .mapboxgl-popup-tip { display: none; }
        .mapboxgl-ctrl-attrib { display: none !important; }
        .mapboxgl-ctrl-group { background: #222831 !important; border: 1px solid rgba(255,255,255,0.1) !important; }
        .mapboxgl-ctrl-group button { background: #222831 !important; }
        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon { filter: invert(1); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Flag modal */}
      <AnimatePresence>
        {flaggedId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setFlaggedId(null)}>
            <motion.div initial={{ scale: 0.9, y: 8 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-5 max-w-xs w-full mx-4"
              style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                <Flag size={18} className="text-red-500" />
              </div>
              <h3 className="font-black text-sm text-slate-900 mb-1">Report this item?</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">Our team will review and take action within 24 hours if needed.</p>
              <div className="flex gap-2">
                <button onClick={() => setFlaggedId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={() => setFlaggedId(null)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all">Report</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
              Help us get it <span className="text-primary">Back2U</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-0.5">
              Browse reports in your area
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 self-start">
            <button onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${view === "grid" ? "bg-[#061209] text-white" : "text-slate-400 hover:text-slate-600"}`}>
              <LayoutGrid size={13} /> Grid
            </button>
            <button onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${view === "map" ? "bg-[#061209] text-white" : "text-slate-400 hover:text-slate-600"}`}>
              <MapIcon size={13} /> Map
            </button>
          </div>
        </div>

        {/* Missing Persons banner */}
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          onClick={() => setStatus(status === "missing" ? "All" : "missing")}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-3 transition-all"
          style={{
            background: status === "missing" ? "rgba(206,17,38,0.08)" : "white",
            border: `1.5px solid ${status === "missing" ? "#CE1126" : "rgba(206,17,38,0.2)"}`,
          }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(206,17,38,0.1)" }}>
              <AlertTriangle size={15} style={{ color: "#CE1126" }} />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#CE1126" }}>Missing Persons</p>
              <p className="text-[9px] font-medium text-slate-400">Free to post and contact forever</p>
            </div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{
              background: status === "missing" ? "#CE1126" : "rgba(206,17,38,0.1)",
              color: status === "missing" ? "white" : "#CE1126"
            }}>
            {status === "missing" ? "Clear" : "View All"}
          </span>
        </motion.button>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input type="text" placeholder="Search for phones, wallets, ID cards, keys..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-primary transition-all"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
          <Dropdown label="Status"   options={STATUS_OPTIONS}  value={status}   onChange={setStatus}   />
          <Dropdown label="Category" options={CATEGORIES}      value={category} onChange={setCategory} />
          <Dropdown label="Date"     options={DATE_OPTIONS}    value={date}     onChange={setDate}     />
          <Dropdown label="Location" options={CAMEROON_CITIES} value={location} onChange={setLocation} />
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setStatus("All"); setCategory("All"); setDate("Any time"); setLocation("All Cities"); setRadius(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 border border-red-100 whitespace-nowrap hover:bg-red-100 transition-all">
              Clear {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
            {items.length} report{items.length !== 1 ? "s" : ""} found
            {search ? ` for "${search}"` : ""}
          </p>
        )}

        {/* Grid view */}
        {view === "grid" && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-100">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search size={24} className="text-slate-300" />
                </div>
                <p className="font-black text-slate-400 text-sm mb-1">No reports found</p>
                <p className="text-slate-300 text-xs mb-4">Try adjusting your filters or search terms</p>
                {activeFilterCount > 0 && (
                  <button onClick={() => { setStatus("All"); setCategory("All"); setDate("Any time"); setLocation("All Cities"); setSearch(""); setRadius(null); }}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all">
                    Clear all filters
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((item, i) => <ItemCard key={item.id} item={item} onFlag={setFlaggedId} />)}
                </div>
                <div ref={sentinelRef} className="flex items-center justify-center mt-6 pb-2">
                  {loadingMore ? (
                    <Loader2 size={20} className="animate-spin text-primary" />
                  ) : !hasMore && items.length > 0 ? (
                    <div className="flex items-center gap-3 px-6 py-2">
                      <div className="h-px w-12 bg-slate-200" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">All caught up</span>
                      <div className="h-px w-12 bg-slate-200" />
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </>
        )}

        {/* Map view */}
        {view === "map" && (
          <div className="rounded-2xl overflow-hidden shadow-lg relative" style={{ height: "70vh", border: "1px solid #e2e8f0" }}>
            {/* Map legend */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              <div className="bg-white rounded-xl px-3 py-2 shadow-md flex items-center gap-2" style={{ border: "1px solid #e2e8f0" }}>
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Found</span>
              </div>
              <div className="bg-white rounded-xl px-3 py-2 shadow-md flex items-center gap-2" style={{ border: "1px solid #e2e8f0" }}>
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Lost</span>
              </div>
              <div className="bg-white rounded-xl px-3 py-2 shadow-md" style={{ border: "1px solid #e2e8f0" }}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cameroon only</span>
              </div>
            </div>
            <Map
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={mapViewport}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              onMove={e => setMapViewport(e.viewState)}
              maxBounds={[[7.0, -0.8], [17.0, 13.5]]}
              minZoom={5.2} maxZoom={17}
              attributionControl={false}>
              <NavigationControl position="bottom-right" showCompass={false} />
              {items.map(item => {
                const coords = getItemCoords(item);
                const isFound = item.type === "found";
                return (
                  <Marker key={item.id} longitude={coords.lng} latitude={coords.lat} anchor="bottom"
                    onClick={e => { e.originalEvent.stopPropagation(); setSelectedMapItem(item); }}>
                    <div className="relative cursor-pointer group" style={{ transform: "translateY(0)", transition: "transform 0.2s" }}>
                      {/* Pulse ring */}
                      <div className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ background: isFound ? "#009A49" : "#CE1126", transform: "scale(1.6)" }} />
                      {/* Pin */}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 relative z-10 group-hover:scale-110 transition-transform"
                        style={{
                          background: isFound ? "#009A49" : "#CE1126",
                          borderColor: isFound ? "#4ade80" : "#f87171",
                          boxShadow: `0 4px 12px ${isFound ? "rgba(0,154,73,0.5)" : "rgba(206,17,38,0.5)"}`,
                        }}>
                        <MapPin size={14} className="text-white" />
                      </div>
                    </div>
                  </Marker>
                );
              })}
              {selectedMapItem && (() => {
                const coords = getItemCoords(selectedMapItem);
                const isFound = selectedMapItem.type === "found";
                return (
                  <Popup longitude={coords.lng} latitude={coords.lat} anchor="top"
                    onClose={() => setSelectedMapItem(null)} closeButton={false} className="back2u-popup">
                    <div className="rounded-2xl shadow-2xl p-3 w-52 cursor-pointer"
                      style={{
                        background: "#222831",
                        border: `1px solid ${isFound ? "rgba(0,154,73,0.4)" : "rgba(206,17,38,0.4)"}`,
                      }}
                      onClick={() => window.location.href = `/browse/${selectedMapItem.id}`}>
                      {selectedMapItem.photos?.[0] && (
                        <div className="relative w-full h-24 rounded-xl mb-2 overflow-hidden">
                          <Image src={selectedMapItem.photos[0]} alt={selectedMapItem.title} fill sizes="192px" className="object-cover" />
                        </div>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase mb-1.5`}
                        style={{
                          background: isFound ? "rgba(0,154,73,0.2)" : "rgba(206,17,38,0.2)",
                          color: isFound ? "#4ade80" : "#f87171",
                        }}>
                        {selectedMapItem.type}
                      </span>
                      <p className="font-bold text-xs text-white truncate">{selectedMapItem.title}</p>
                      <p className="text-[10px] mt-1" style={{ color: "#00ADB5" }}>{selectedMapItem.location_name || selectedMapItem.city}</p>
                    </div>
                  </Popup>
                );
              })()}
            </Map>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link href="/report">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-6 w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center z-50"
          style={{ boxShadow: "0 8px 32px rgba(0,154,73,0.4)" }}>
          <Plus size={24} className="text-white" strokeWidth={2.5} />
        </motion.button>
      </Link>
    </main>
  );
}