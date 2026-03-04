//src/ app/ auth/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Github, Mail, Lock, User, 
  ArrowRight, Smartphone, RefreshCw, Star 
} from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <main className="min-h-screen bg-white flex overflow-hidden">
      {/* --- FONT IMPORT --- */}
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* --- LEFT SIDE: THE BRAND POWER --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative p-16 flex-col justify-between overflow-hidden">
        {/* Animated Background Pulse */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary rounded-full blur-[120px]" 
          />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2 text-white/40 hover:text-primary transition-all font-black uppercase tracking-[0.4em] text-[10px]">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="relative z-10">
          <h1 className="text-white text-8xl font-black leading-[0.85] tracking-tighter uppercase mb-8 font-clash">
            Secure <br /> Your <span className="text-primary"> belongings.</span>
          </h1>
          <div className="flex gap-6 items-center">
            <div className="h-[1px] w-12 bg-primary" />
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Cameroon's #1 Recovery Network</p>
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 max-w-sm">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-primary text-primary" />)}
          </div>
          <p className="text-white/80 font-medium mb-6 leading-relaxed italic text-sm">
            "Leaving my bag in a Douala taxi was a nightmare. Back2U connected me to the driver in less than 24 hours."
          </p>
          <p className="text-white font-black text-xs uppercase tracking-widest">Nadine E. — Douala</p>
        </div>
      </div>

      {/* --- RIGHT SIDE: THE 3D FLIP ZONE --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative perspective-2000">
        
        <div className="relative w-full max-w-[440px] h-[580px]">
          <motion.div
            className="w-full h-full relative preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* FRONT: LOGIN */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-12 flex flex-col justify-center border border-slate-100">
              <div className="mb-10 text-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase font-clash">Welcome <span className="text-primary">Back.</span></h2>
                <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Identify yourself</p>
              </div>

              <form className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest focus:border-primary focus:outline-none transition-all uppercase" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input type="password" placeholder="PASSWORD" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest focus:border-primary focus:outline-none transition-all uppercase" />
                </div>
                <button className="w-full bg-dark text-white py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-primary hover:text-dark transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 group">
                  SIGN IN <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-10 text-center">
                <button onClick={() => setIsFlipped(true)} className="group flex flex-col items-center gap-2 mx-auto">
                  <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">No account?</span>
                  <span className="text-primary font-black text-[10px] tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">Create one <RefreshCw size={12} /></span>
                </button>
              </div>
            </div>

            {/* BACK: SIGNUP */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-dark rounded-[3.5rem] shadow-2xl p-12 flex flex-col justify-center border border-white/5 rotate-y-180">
              <div className="mb-10 text-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white font-clash">Start <span className="text-primary">Fresh.</span></h2>
                <p className="text-white/30 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Join the network</p>
              </div>

              <form className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="text" placeholder="FULL NAME" className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white focus:border-primary focus:outline-none transition-all uppercase" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="email" placeholder="EMAIL ADDRESS" className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white focus:border-primary focus:outline-none transition-all uppercase" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="password" placeholder="PASSWORD" className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white focus:border-primary focus:outline-none transition-all uppercase" />
                </div>
                <button className="w-full bg-primary text-dark py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-white transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group">
                  REGISTER <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-10 text-center">
                <button onClick={() => setIsFlipped(false)} className="group flex flex-col items-center gap-2 mx-auto">
                  <span className="text-white/30 font-bold text-[10px] tracking-widest uppercase">Already a member?</span>
                  <span className="text-primary font-black text-[10px] tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">Sign In <RefreshCw size={12} /></span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </main>
  );
}