//src/ components/ MatchAndChat.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, MessageSquare, X, Send, 
  ShieldCheck, MapPin, Phone, MoreHorizontal,
  Image as ImageIcon, Smile, Sparkles
} from "lucide-react";

export default function MatchSystem() {
  const [showMatch, setShowMatch] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center p-6 font-satoshi">
      
      {/* --- 1. MATCH NOTIFICATION (THE PUSH) --- */}
      <AnimatePresence>
        {showMatch && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="pointer-events-auto w-full max-w-md glass-card rounded-[3rem] p-8 shadow-[0_32px_64px_rgba(0,0,0,0.2)] border-2 border-[#00FF85]/30 relative overflow-hidden bg-white/90 backdrop-blur-2xl"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00FF85]/20 blur-[80px] rounded-full" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#00FF85] rounded-[2rem] flex items-center justify-center shadow-xl shadow-[#00FF85]/30 mb-6 rotate-3">
                <Sparkles className="text-white" size={32} />
              </div>
              
              <h2 className="font-clash text-3xl font-black uppercase tracking-tighter mb-2">It's a Match!</h2>
              <p className="text-slate-500 text-sm font-medium mb-8 px-4">
                Someone in <span className="text-black font-black">Akwa, Douala</span> has found an item matching your <span className="text-[#00E075] font-black italic">iPhone 13 Pro</span> description.
              </p>

              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Your Post</p>
                  <img src="https://images.unsplash.com/photo-1633114128174-2f8aa49759b0?auto=format&fit=crop&w=100" className="w-full h-20 object-cover rounded-xl grayscale" />
                </div>
                <div className="bg-white p-4 rounded-2xl border-2 border-[#00FF85] shadow-inner">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#00E075] mb-1">Found Item</p>
                  <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba3f21?auto=format&fit=crop&w=100" className="w-full h-20 object-cover rounded-xl" />
                </div>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => { setShowMatch(false); setShowChat(true); }}
                  className="w-full py-5 bg-black text-[#00FF85] rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  <MessageSquare size={18} /> Chat with Finder
                </button>
                <button 
                  onClick={() => setShowMatch(false)}
                  className="text-slate-400 text-[10px] font-black uppercase tracking-widest py-2"
                >
                  Dismiss for now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 2. THE PREMIUM CHAT INTERFACE --- */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pointer-events-auto absolute bottom-10 right-10 w-[450px] h-[650px] glass-card rounded-[3.5rem] shadow-2xl flex flex-col border border-white bg-white/95"
          >
            {/* Chat Header */}
            <header className="p-8 pb-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden">
                    <img src="https://i.pravatar.cc/150?u=finder" alt="avatar" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FF85] border-2 border-white rounded-full" />
                </div>
                <div>
                  <h4 className="font-clash font-black uppercase text-sm tracking-tight">Jean-Marc E.</h4>
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-[#00E075] tracking-widest">
                    <ShieldCheck size={12} /> Verified Finder
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-black transition-colors"><Phone size={16}/></button>
                <button onClick={() => setShowChat(false)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-black"><X size={16}/></button>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
              <div className="flex justify-center">
                <span className="px-4 py-1.5 bg-slate-50 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">Security: Chat is Encrypted</span>
              </div>

              {/* Incoming */}
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    Hello! I found this iPhone near the Marche Central. It has a cracked screen protector, is this yours?
                  </p>
                </div>
              </div>

              {/* Outgoing */}
              <div className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto">
                <div className="bg-black text-white p-4 rounded-2xl rounded-tr-none">
                  <p className="text-sm font-medium leading-relaxed text-[#00FF85]">
                    Yes! That matches exactly. Does it have a blue silicone case?
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#E9FBF3] rounded-full text-[10px] font-black uppercase text-[#00E075] tracking-widest border border-[#00FF85]/20">
                   <MapPin size={12} /> Jean-Marc shared a location
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <footer className="p-8 pt-0">
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-2 flex items-center gap-2">
                <button className="p-3 text-slate-400 hover:text-black transition-colors"><ImageIcon size={20}/></button>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium px-2"
                />
                <button className="p-3 bg-black text-[#00FF85] rounded-[1.5rem] hover:scale-105 transition-all">
                  <Send size={18} />
                </button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}