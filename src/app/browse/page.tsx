// src/app/browse/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, Plus, Clock,
  Map as MapIcon, LayoutGrid, ChevronDown,
  Loader2, Flag, SlidersHorizontal, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import MatchSystem from "@/components/MatchAndChat";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

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
  user: { id: string; full_name: string; avatar_url: string | null } | null;
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getItemCoords(item: ItemWithUser) {
  return CITY_COORDS[item.city ?? ""] ?? { lng: 11.5021, lat: 3.8480 };
}

// ── TICKER ──────────────────────────────────────────────
const TICKER_ITEMS = [
  "Samsung Galaxy S22 returned to owner in Yaoundé just now!",
  "Blue Backpack found in Buea claimed 15 mins ago.",
  "National ID card reunited with owner in Douala.",
  "Toyota keys recovered in Bamenda today.",
];

function Ticker() {
  return (
    <div className="bg-emerald-50 border-b border-emerald-100 py-2 px-4 flex items-center gap-3 overflow-hidden">
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Recent Reunion:</span>
      </div>
      <div className="overflow-hidden flex-1">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="text-[10px] font-medium text-emerald-700">{t} •</span>
          ))}
        </motion.div>
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary transition-all whitespace-nowrap"
      >
        {label}: <span className="font-bold">{value}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute top-full mt-1 left-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 py-1 min-w-[140px]"
          >
            {options.map(o => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 ${value === o ? "text-primary font-bold" : "text-slate-600"}`}>
                {value === o && <CheckCircle size={11} className="text-primary" />}
                {value !== o && <span className="w-3" />}
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
  const isSensitive = item.sensitivity === "sensitive" || item.sensitivity === "very_sensitive";
  const firstPhoto = item.photos?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
      onClick={() => router.push(`/browse/${item.id}`)}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer group"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {firstPhoto ? (
          <Image src={firstPhoto} alt={item.title} fill sizes="33vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSensitive ? "blur-xl scale-110" : ""}`}
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <MapPin size={28} className="text-slate-300" />
          </div>
        )}

        {/* Found/Lost badge */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide shadow-md ${
          isFound ? "bg-primary text-white" : "bg-orange-400 text-white"
        }`}>
          {isFound ? <CheckCircle size={11} /> : <Search size={11} />}
          {item.type}
        </div>

        {/* Flag button */}
        <button
          onClick={e => { e.stopPropagation(); onFlag(item.id); }}
          className="absolute top-3 right-3 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Flag size={11} />
        </button>

        {/* Sensitive overlay */}
        {isSensitive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <span className="px-3 py-1 bg-black/60 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Sensitive</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm mb-2 truncate group-hover:text-primary transition-colors">{item.title}</h3>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
          <MapPin size={11} className="text-primary shrink-0" />
          <span className="truncate">{item.location_name || item.city || "Unknown location"}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={11} className="text-slate-300 shrink-0" />
          <span>Reported {timeAgo(item.created_at)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── MAIN ──────────────────────────────────────────────────
export default function BrowseMarketplace() {
  const supabase = createClient();
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
  const [selectedMapItem, setSelectedMapItem] = useState<ItemWithUser | null>(null);
  const [mapViewport, setMapViewport] = useState({ longitude: 12.35, latitude: 5.96, zoom: 5.5 });
  const [flaggedId, setFlaggedId] = useState<string | null>(null);
  const [matchItemId, setMatchItemId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const fetchItems = useCallback(async (pageNum: number, reset = false) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    let q = db.from("items")
      .select("*, user:users(id, full_name, avatar_url)")
      .in("status", ["active", "matched"])
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (status !== "All") q = q.eq("type", status.toLowerCase());
    if (category !== "All") q = q.eq("category", category.toLowerCase());
    if (location !== "All Cities") q = q.eq("city", location);
    if (search) q = q.ilike("title", `%${search}%`);

    if (date === "Today") { const s = new Date(); s.setHours(0,0,0,0); q = q.gte("created_at", s.toISOString()); }
    else if (date === "This Week") { const s = new Date(); s.setDate(s.getDate()-7); q = q.gte("created_at", s.toISOString()); }
    else if (date === "This Month") { const s = new Date(); s.setDate(s.getDate()-30); q = q.gte("created_at", s.toISOString()); }

    const { data } = await q;
    const newItems = data ?? [];
    setItems(prev => reset ? newItems : [...prev, ...newItems]);
    setHasMore(newItems.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, [status, category, location, date, search]);

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

  return (
    <main className="min-h-screen" style={{
      backgroundColor: "#f0f4f0",
      backgroundImage: "radial-gradient(#009A49 10%, transparent 10%), radial-gradient(#009A49 10%, transparent 10%)",
      backgroundSize: "60px 60px",
      backgroundPosition: "0 0, 30px 30px",
    }}>
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .back2u-popup .mapboxgl-popup-content { background: transparent; padding: 0; box-shadow: none; }
        .back2u-popup .mapboxgl-popup-tip { display: none; }
        .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>

      {/* Ticker */}
      <Ticker />

      {/* Flag modal */}
      <AnimatePresence>
        {flaggedId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setFlaggedId(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-xs w-full mx-4 shadow-2xl"
            >
              <h3 className="font-black text-sm text-slate-900 mb-2">Report this item?</h3>
              <p className="text-xs text-slate-400 mb-4">Our team will review and take action if needed.</p>
              <div className="flex gap-2">
                <button onClick={() => setFlaggedId(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={() => setFlaggedId(null)} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all">Report</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match system */}
      {matchItemId && currentUserId && (
        <MatchSystem itemId={matchItemId} currentUserId={currentUserId} onClose={() => setMatchItemId(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Heading + view toggle */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
              Help us get it <span className="text-primary">Back2U</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Browse items reported in your area or search specifically for what you've lost.
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
            <button onClick={() => setView("grid")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${view === "grid" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}>
              <LayoutGrid size={14} /> List View
            </button>
            <button onClick={() => setView("map")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${view === "map" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"}`}>
              <MapIcon size={14} /> Map View
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              placeholder="Search for phones, IDs, keys..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <Dropdown label="Status"   options={STATUS_OPTIONS}   value={status}   onChange={setStatus}   />
          <Dropdown label="Category" options={CATEGORIES}        value={category} onChange={setCategory} />
          <Dropdown label="Date"     options={DATE_OPTIONS}      value={date}     onChange={setDate}     />
          <Dropdown label="Location" options={CAMEROON_CITIES}   value={location} onChange={setLocation} />

          <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all">
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {/* ── GRID VIEW ── */}
        {view === "grid" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Search size={28} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-400 text-sm mb-1">No items found</p>
                <p className="text-slate-300 text-xs">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map(item => (
                    <ItemCard key={item.id} item={item} onFlag={setFlaggedId} />
                  ))}
                </div>
                <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-6">
                  {loadingMore && <Loader2 size={20} className="animate-spin text-primary" />}
                </div>
              </>
            )}
          </>
        )}

        {/* ── MAP VIEW ── */}
        {view === "map" && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: "70vh" }}>
            <Map
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={mapViewport}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/light-v11"
              onMove={e => setMapViewport(e.viewState)}
              maxBounds={[[7.0, -0.8], [17.0, 13.5]]}
              minZoom={5.2}
              maxZoom={17}
              attributionControl={false}
            >
              <NavigationControl position="bottom-right" showCompass={false} />
              {items.map(item => {
                const coords = getItemCoords(item);
                return (
                  <Marker key={item.id} longitude={coords.lng} latitude={coords.lat} anchor="bottom"
                    onClick={e => { e.originalEvent.stopPropagation(); setSelectedMapItem(item); }}
                  >
                    <div className={`w-9 h-9 rounded-xl shadow-md flex items-center justify-center border-2 cursor-pointer transition-transform hover:scale-110 ${
                      item.type === "found" ? "bg-white border-primary" : "bg-white border-orange-400"
                    }`}>
                      <MapPin size={16} className={item.type === "found" ? "text-primary" : "text-orange-400"} />
                    </div>
                  </Marker>
                );
              })}
              {selectedMapItem && (() => {
                const coords = getItemCoords(selectedMapItem);
                return (
                  <Popup longitude={coords.lng} latitude={coords.lat} anchor="top"
                    onClose={() => setSelectedMapItem(null)} closeButton={false} className="back2u-popup"
                  >
                    <div className="bg-white rounded-2xl shadow-xl p-3 w-48 cursor-pointer border border-slate-100"
                      onClick={() => window.location.href = `/browse/${selectedMapItem.id}`}>
                      {selectedMapItem.photos?.[0] && (
                        <div className="relative w-full h-24 rounded-xl mb-2 overflow-hidden">
                          <Image src={selectedMapItem.photos[0]} alt={selectedMapItem.title} fill sizes="192px" className="object-cover" />
                        </div>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase mb-1.5 ${selectedMapItem.type === "found" ? "bg-primary/10 text-primary" : "bg-orange-50 text-orange-500"}`}>
                        {selectedMapItem.type}
                      </span>
                      <p className="font-bold text-xs text-slate-900 truncate">{selectedMapItem.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{selectedMapItem.location_name || selectedMapItem.city}</p>
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
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-6 w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center z-50 shadow-primary/30"
        >
          <Plus size={24} className="text-white" strokeWidth={2.5} />
        </motion.button>
      </Link>
    </main>
  );
}