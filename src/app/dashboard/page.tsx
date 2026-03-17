// src/app/dashboard/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  Bell, MapPin, Plus, MessageSquare, 
  Search, Clock, ChevronRight, Star,
  TrendingUp, CheckCircle, Shield, LayoutGrid
} from "lucide-react";
import Link from "next/link";

export default function BentoDashboard() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- DASHBOARD SUB-HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 px-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Guardian Portal</p>
            <h2 className="text-3xl font-black font-clash uppercase tracking-tighter">Your Activity</h2>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-3 pl-2 pr-4 py-1.5">
               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-black text-[10px]">FB</div>
               <div className="flex flex-col">
                 <span className="text-[10px] font-black uppercase tracking-widest text-dark leading-none">Fritz B.</span>
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Verified Human</span>
               </div>
             </div>
          </div>
        </div>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* 1. HERO PROFILE CARD (Large) */}
          <div className="md:col-span-8 bg-dark rounded-[3rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Animated Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/20 transition-all duration-700" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between h-full text-white">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  <Star size={12} fill="currentColor" /> Silver Guardian
                </div>
                <h1 className="text-5xl md:text-6xl font-black font-clash uppercase leading-[0.9] tracking-tighter">
                  Welcome in, <br /> <span className="text-primary">Nixtio.</span>
                </h1>
                <p className="text-white/40 text-sm font-medium max-w-sm font-poppins">
                  Your activity is helping keep Cameroon honest. You've returned <span className="text-white font-bold">6 items</span> this month.
                </p>
              </div>
              
              <div className="mt-8 md:mt-0 flex gap-4 self-end">
                <StatBox label="Reported" value="12" icon={TrendingUp} />
                <StatBox label="Points" value="1,250" icon={CheckCircle} color="bg-primary text-dark" />
              </div>
            </div>
          </div>

          {/* 2. RECENT ACTIVITY (Bento Vertical) */}
          <div className="md:col-span-4 bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-clash font-black uppercase tracking-widest text-sm text-dark">Nearby Activity</h2>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
            
            <div className="space-y-6 flex-1">
              <ActivityItem title="Blue iPhone 13" time="2m ago" loc="Akwa" type="lost" />
              <ActivityItem title="Car Keys" time="15m ago" loc="Bastos" type="found" />
              <ActivityItem title="Laptop Bag" time="1h ago" loc="Bonapriso" type="pending" />
            </div>

            <button className="w-full mt-6 py-4 bg-slate-50 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 hover:bg-dark hover:text-white transition-all">
              View All History
            </button>
          </div>

          {/* 3. MAP PREVIEW (Bento Square) */}
          <div className="md:col-span-5 bg-dark rounded-[3rem] p-2 overflow-hidden min-h-[300px] relative group border border-white/5">
             <div className="absolute inset-0 bg-[url('https://api.maptiler.com/maps/basic-v2/static/9.734,4.051,12/600x600.png?key=YOUR_KEY')] bg-cover opacity-50 grayscale group-hover:scale-110 transition-transform duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
             
             <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary">Local Activity</p>
                </div>
                <h3 className="text-white font-clash font-black uppercase text-lg italic tracking-tight">Bonabéri, Douala</h3>
             </div>
          </div>

          {/* 4. ACHIEVEMENT BADGES (Bento Landscape) */}
          <div className="md:col-span-7 bg-primary rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
             <div className="space-y-4 relative z-10 text-center md:text-left">
                <h2 className="text-dark font-clash font-black text-3xl uppercase tracking-tighter leading-none">
                  Your Gratitude <br /> Wall.
                </h2>
                <p className="text-dark/60 text-xs font-bold uppercase tracking-widest">See all 8 thank you notes</p>
             </div>
             
             <div className="flex -space-x-4 mt-6 md:mt-0 relative z-10">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-16 h-16 rounded-full bg-white border-4 border-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <Star size={20} className="text-primary" fill="currentColor" />
                  </div>
                ))}
             </div>
             
             <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                <LayoutGrid size={300} strokeWidth={0.5} className="text-dark" />
             </div>
          </div>
        </div>

        {/* --- FLOATING REPORT BUTTON --- */}
        <Link href="/report">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-10 right-10 bg-dark text-white pl-8 pr-10 py-6 rounded-full shadow-2xl flex items-center gap-4 group z-50 border border-white/10"
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

{/* --- HELPER COMPONENTS --- */}

function StatBox({ label, value, icon: Icon, color = "bg-white/5" }: any) {
  return (
    <div className={`${color} p-5 rounded-[2rem] min-w-[120px] text-center border border-white/5`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl font-black font-clash">{value}</span>
        <Icon size={14} className="text-primary" />
      </div>
    </div>
  );
}

function ActivityItem({ title, time, loc, type }: any) {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'lost' ? 'bg-red-50 text-red-400' : 'bg-primary/10 text-primary'}`}>
        <Search size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-black text-xs uppercase tracking-tight text-dark">{title}</h4>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{loc} • {time}</p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight size={16} />
      </div>
    </div>
  );
}