// src/app/browse/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, ChevronDown, Navigation2, Layers, 
  Plus, Clock, Map as MapIcon, LayoutGrid, X, 
  Calendar, Bell
} from "lucide-react";
import Link from "next/link";

// 1. IMPORT THE MATCH SYSTEM COMPONENT
import MatchSystem from "@/components/MatchAndChat";

// --- MOCK DATA ---
const ITEMS = [
  { 
    id: 1, 
    title: "National ID Card", 
    loc: "Akwa, Douala", 
    time: "2 hrs ago", 
    date: "Oct 24", 
    type: "Found", 
    coords: { t: '42%', l: '48%' }, 
    img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?auto=format&fit=crop&w=400" 
  },
  { 
    id: 2, 
    title: "Leather Wallet", 
    loc: "Bastos, Yaoundé", 
    time: "5 hrs ago", 
    date: "Oct 24", 
    type: "Lost", 
    coords: { t: '55%', l: '35%' }, 
    img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400" 
  },
  { 
    id: 3, 
    title: "Toyota Car Keys", 
    loc: "Molyko, Buea", 
    time: "1 day ago", 
    date: "Oct 23", 
    type: "Found", 
    coords: { t: '30%', l: '62%' }, 
    img: "https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=400" 
  },
];

export default function BrowseMarketplace() {
  const [view, setView] = useState("grid"); // 'grid' or 'map'
  const [selectedItem, setSelectedItem] = useState<typeof ITEMS[0] | null>(null);
  const [activeDateRange, setActiveDateRange] = useState("Today");
  const [showCalendar, setShowCalendar] = useState(false);
  const [triggerMatch, setTriggerMatch] = useState(false);

  const dateFilters = ["Today", "Yesterday", "This Week", "This Month"];

  return (
    <main className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      
      {/* --- SUB-HEADER: VIEW TOGGLE & STATS --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[50] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setView('grid')} 
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-white shadow-sm text-black' : 'text-slate-400'}`}
            >
              <LayoutGrid size={14} /> List View
            </button>
            <button 
              onClick={() => setView('map')} 
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'map' ? 'bg-white shadow-sm text-black' : 'text-slate-400'}`}
            >
              <MapIcon size={14} /> Map View
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">12 Items Found Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative h-full">
        {/* --- VIEW 1: THE GRID (List View) --- */}
        <AnimatePresence mode="wait">
          {view === 'grid' && (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-7xl mx-auto px-6 py-12"
            >
              <header className="mb-10">
                <h1 className="text-5xl font-black font-clash tracking-tighter mb-6 italic text-dark uppercase">Discovery Hub</h1>
                
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search for serial numbers, locations, or items..." 
                        className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm outline-none focus:ring-4 ring-primary/5 transition-all shadow-sm"
                      />
                    </div>
                    <Link href="/report" className="px-8 py-4 bg-dark text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-dark transition-all shadow-lg shadow-black/10">
                      <Plus size={16} strokeWidth={3} /> Report Item
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 relative">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 shrink-0">
                      <Calendar size={16} />
                    </div>
                    {dateFilters.map((range) => (
                      <button
                        key={range}
                        onClick={() => { setActiveDateRange(range); setShowCalendar(false); }}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeDateRange === range ? 'bg-primary text-dark shadow-lg shadow-primary/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'}`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                {ITEMS.map((item) => (
                  <motion.div 
                    key={item.id} 
                    whileHover={{ y: -12 }}
                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group cursor-pointer"
                  >
                    <div className="aspect-[16/11] overflow-hidden relative">
                      <img src={item.img} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt={item.title} />
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={12} className="text-primary" /> {item.date}
                      </div>
                      <div className={`absolute top-5 left-5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl ${item.type === 'Found' ? 'bg-primary text-dark' : 'bg-[#FF4D4D] text-white'}`}>
                        {item.type}
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-black font-clash uppercase tracking-tight mb-4 group-hover:text-primary transition-colors text-dark">{item.title}</h3>
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {item.loc}</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- VIEW 2: THE MAP (Map View) --- */}
        <AnimatePresence mode="wait">
          {view === 'map' && (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative w-full h-[70vh] bg-slate-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/basic-v2/static/9.734,4.051,13/1600x1200.png?key=YOUR_KEY')] bg-cover bg-center grayscale-[0.2]" />

              {ITEMS.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ top: item.coords.t, left: item.coords.l }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative cursor-pointer group">
                    <div className={`w-14 h-14 bg-white rounded-[1.2rem] shadow-2xl flex items-center justify-center border-2 transition-all group-hover:scale-110 group-hover:rotate-12 ${selectedItem?.id === item.id ? 'border-dark' : 'border-primary'}`}>
                      <MapPin size={24} className={item.type === 'Found' ? 'text-primary' : 'text-[#FF4D4D]'} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MatchSystem />
    </main>
  );
}