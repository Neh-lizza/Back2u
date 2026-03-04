//src/ app/ page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, Plus, ArrowRight, Smartphone, 
  CheckCircle2, Users, PackageCheck, 
  MessageSquareLock, HeartHandshake,
  Star
} from "lucide-react";
import Counter from "@/components/Counter";

// --- REVIEW DATA ---
const REVIEWS = [
  { name: "Arnaud T.", location: "Douala", text: "Found my laptop in 2 days. The safe zone meeting was very professional.", stars: 5 },
  { name: "Marie-Louise", location: "Yaoundé", text: "Honest community. Someone found my ID card and reported it here.", stars: 5 },
  { name: "Kevin N.", location: "Buea", text: "The interface is so simple to use even for my parents.", stars: 4 },
  { name: "Sali H.", location: "Garoua", text: "I returned a wallet today. The gratitude tip system is a great touch!", stars: 5 },
];

const MagicCard = ({ title, description, icon: IconComponent, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    viewport={{ once: true }}
    className="relative group w-full max-w-[300px] h-[340px] p-[2px] rounded-[2rem] overflow-visible mx-auto bg-primary/20 hover:bg-gradient-to-br from-primary via-secondary to-primary transition-all duration-500"
  >
    <div className="absolute inset-0 top-4 h-full w-full scale-90 blur-[40px] opacity-40 group-hover:opacity-80 transition-opacity duration-500 -z-10 bg-primary" />
    <div className="bg-[#0a0a0a] rounded-[1.9rem] w-full h-full flex flex-col justify-center items-center p-8 text-center relative z-10">
      <div className="mb-6 p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-all duration-500">
        <IconComponent size={40} className="text-primary group-hover:text-secondary transition-colors" />
      </div>
      <p className="text-white font-black tracking-tight text-xl mb-3 uppercase leading-none" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
        {title}
      </p>
      <p className="text-slate-500 text-[13px] font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ fontFamily: "'Satoshi', sans-serif" }}>
        {description}
      </p>
    </div>
  </motion.div>
);

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white selection:bg-primary selection:text-white">
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&f[]=telma@700&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        h1, h2, h3, .font-clash { font-family: 'Clash Grotesk', sans-serif; }
      `}</style>

      {/* --- NAV --- */}
      <nav className="flex justify-between items-center px-8 py-8 max-w-7xl mx-auto">
        <div className="text-2xl font-black tracking-tighter text-primary italic lowercase">
          back<span className="text-dark">2u.</span>
        </div>
        <div className="flex items-center gap-8">
          <button className="text-[11px] font-bold tracking-[0.2em] text-dark/50 hover:text-primary transition uppercase">Login</button>
          <button className="bg-dark text-white px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-lg">
            Join Now
          </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="max-w-7xl mx-auto px-8 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              🇨🇲 Cameroon's #1 Recovery Network
            </div>
            <h1 className="text-7xl md:text-8xl lg:text-[100px] font-black leading-[0.85] tracking-[-0.04em] text-dark uppercase">
              Lost <span className="text-primary">Today</span>.<br />
              Found <span className="text-secondary">Soon</span>.
            </h1>
            <p className="text-lg text-slate-400 font-medium max-w-md leading-relaxed">
              Cameroon's first neural-link database. We reconnect you with your valuables using smart location matching.
            </p>
            <div className="flex gap-4">
              <button className="bg-primary text-white px-8 py-5 rounded-2xl font-bold text-sm flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-primary/20 uppercase tracking-wider">
                REPORT ITEM <Plus size={18} />
              </button>
              <button className="bg-white border-2 border-slate-100 px-8 py-5 rounded-2xl font-bold text-sm hover:border-primary transition-colors uppercase tracking-wider">
                BROWSE
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-slate-50 rounded-[3rem] aspect-square flex items-center justify-center p-12 border border-slate-100">
               <img src="https://illustrations.popsy.co/white/lost-and-found.svg" className="w-full" alt="Hero" />
            </div>
          </div>
        </div>
      </section>

      {/* --- COUNTERS --- */}
      <section className="bg-dark py-20 rounded-[4rem] mx-4">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-12">
          {[
            { val: 2450, label: "Recovered", icon: PackageCheck },
            { val: 12000, label: "Members", icon: Users },
            { val: 10, label: "Regions", icon: CheckCircle2 }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <h3 className="text-6xl font-black text-white tracking-tighter italic">
                <Counter value={item.val} />+
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- IMAGE LEFT / TEXT RIGHT --- */}
      <section className="max-w-7xl mx-auto px-8 py-32 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ x: -100, opacity: 0 }} 
            whileInView={{ x: 0, opacity: 1 }} 
            transition={{ duration: 0.8 }}
            className="rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-50 relative group aspect-[4/3]"
          >
            <img 
              src="https://images.unsplash.com/photo-1556742049-a3da1f13075a?auto=format&fit=crop&w=1200" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
              alt="Community helping"
            />
            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-all" />
          </motion.div>

          <motion.div 
            initial={{ x: 100, opacity: 0 }} 
            whileInView={{ x: 0, opacity: 1 }} 
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-5xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase">
              Neighbors <br /><span className="text-primary">Helping</span> Neighbors.
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md">
              Back2U is Cameroon’s community-first recovery database. We use smart location tracking to ensure your property finds its way home safely.
            </p>
            <button className="bg-dark text-white px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center gap-4">
              Learn More <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 px-4 bg-slate-50 rounded-[4rem] mx-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">How it works</h2>
            <div className="h-1.5 w-16 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <MagicCard title="Smart Search" description="Filter by location, category, and date to find your items instantly." icon={Search} delay={0.1} />
            <MagicCard title="Secure Chat" description="Communicate safely with finders through our encrypted bridge." icon={MessageSquareLock} delay={0.2} />
            <MagicCard title="Community Tips" description="Show your gratitude to honest finders with our tip system." icon={HeartHandshake} delay={0.3} />
          </div>
        </div>
      </section>

      {/* --- REVIEW MARQUEE --- */}
      <section className="py-24 overflow-hidden bg-white">
        <div className="flex w-full relative">
          <motion.div 
            className="flex gap-6 whitespace-nowrap"
            animate={{ x: [0, -1200] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <div key={i} className="inline-block w-[350px] bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group">
                <div className="flex gap-1 mb-4">
                   {[...Array(review.stars)].map((_, s) => <Star key={s} size={14} className="fill-secondary text-secondary" />)}
                </div>
                <p className="text-dark font-bold italic text-sm whitespace-normal mb-6" style={{ fontFamily: "'Satoshi', sans-serif" }}>"{review.text}"</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{review.name} • {review.location}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- COMPACT CTA --- */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="relative max-w-4xl mx-auto bg-primary rounded-[3rem] p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              Found or Lost <br/> Something?
            </h2>
            <p className="text-[15px] font-medium text-white/70 max-w-xs mx-auto leading-relaxed">
              Join the movement. Every report brings a neighbor closer to home.
            </p>
            <button className="bg-dark text-white px-8 py-4 rounded-xl font-bold text-[12px] tracking-[0.2em] uppercase hover:bg-white hover:text-dark transition-all shadow-xl mx-auto flex items-center gap-3">
              Report Now <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="mt-16 flex justify-between items-center opacity-20 border-t pt-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.5em]">back2u.cm © 2026</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Made in Cameroon ❤️</p>
        </div>
      </section>
    </main>
  );
}