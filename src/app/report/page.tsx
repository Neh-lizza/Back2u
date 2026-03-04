"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Package, ArrowRight, ArrowLeft, 
  Search, ShieldAlert, EyeOff, CheckCircle2, Heart, Upload 
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function EnhancedReportPage() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: "lost", 
    title: "",
    description: "",
    category: "normal", 
    location: "",
    anonymous: false,
  });

  const triggerConfetti = () => {
    confetti({ 
      particleCount: 150, 
      spread: 70, 
      origin: { y: 0.6 }, 
      colors: ['#00FF85', '#FFD700', '#ffffff'] 
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    triggerConfetti();
  };

  if (isSubmitted) return <SuccessState />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
      `}</style>

      {/* Progress & Nav */}
      <nav className="max-w-4xl mx-auto flex justify-between items-center mb-16">
        <Link href="/" className="text-white/20 hover:text-primary transition-all font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex gap-3">
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              className={`h-1.5 w-12 rounded-full transition-all duration-700 ${step >= s ? "bg-primary shadow-[0_0_15px_#00FF85]" : "bg-white/5"}`} 
            />
          ))}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1: CONTEXT */}
          {step === 1 && (
            <motion.div 
              key="s1" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              className="space-y-10"
            >
              <div className="text-center md:text-left">
                <h1 className="text-6xl font-black font-clash uppercase leading-none tracking-tighter mb-4">
                  Report <br/><span className="text-primary">Valuables.</span>
                </h1>
                <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Step 01 — Context</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {['lost', 'found'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setFormData({...formData, type: t})} 
                    className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group ${formData.type === t ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" : "border-white/5 bg-white/5 hover:border-white/10"}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${formData.type === t ? "bg-primary text-black" : "bg-white/10 text-white"}`}>
                      {t === 'lost' ? <Search size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <p className="font-clash font-black text-2xl uppercase italic">{t === 'lost' ? "Lost Item" : "Found Item"}</p>
                    {t === 'found' && (
                      <div className="mt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          id="anon"
                          checked={formData.anonymous} 
                          onChange={(e) => setFormData({...formData, anonymous: e.target.checked})} 
                          className="accent-primary w-4 h-4" 
                        />
                        <label htmlFor="anon" className="text-[10px] font-bold uppercase tracking-widest text-white/40 cursor-pointer">Report Anonymously</label>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Privacy Level</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {id: 'normal', icon: Package, label: 'Standard'},
                    {id: 'sensitive', icon: ShieldAlert, label: 'Sensitive'},
                    {id: 'very_sensitive', icon: EyeOff, label: 'High Risk'}
                  ].map(lvl => (
                    <button 
                      key={lvl.id} 
                      onClick={() => setFormData({...formData, category: lvl.id})} 
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.category === lvl.id ? "border-secondary bg-secondary/5 text-secondary shadow-[0_0_15px_rgba(255,215,0,0.1)]" : "border-white/5 text-white/30"}`}
                    >
                      <lvl.icon size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{lvl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)} className="w-full bg-primary text-black py-6 rounded-3xl font-black tracking-[0.4em] text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,255,133,0.1)]">
                CONTINUE <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <motion.div 
              key="s2" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="space-y-6"
            >
              <h2 className="text-5xl font-black font-clash uppercase tracking-tighter mb-8 leading-none">
                The <span className="text-primary">Details.</span>
              </h2>
              
              <div className="space-y-4">
                <input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="TITLE (E.G. IPHONE 15 PRO MAX)" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-clash font-black text-xl uppercase tracking-tighter focus:border-primary focus:outline-none transition-all" 
                />
                <textarea 
                  rows={4} 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="DESCRIPTION / UNIQUE MARKS / SERIAL NUMBERS..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-bold text-xs tracking-widest uppercase focus:border-primary focus:outline-none transition-all" 
                />
                
                <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 text-center hover:border-primary/50 transition-all cursor-pointer relative group">
                  <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Upload className="mx-auto mb-4 text-white/20 group-hover:text-primary transition-colors" size={32} />
                  <p className="font-clash font-black text-lg uppercase italic">Drop Photos Here</p>
                  <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Visual proof speeds up recovery</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 focus-within:border-primary transition-all">
                  <MapPin className="text-primary" size={20} />
                  <input 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="LAST SEEN AT (STREET, QUARTER, TOWN...)" 
                    className="bg-transparent w-full focus:outline-none text-xs font-bold uppercase tracking-widest" 
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-6 rounded-3xl border-2 border-white/5 font-black text-xs tracking-widest hover:bg-white/5 transition-all">BACK</button>
                <button onClick={() => setStep(3)} className="flex-[2] py-6 rounded-3xl bg-primary text-black font-black text-xs tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,255,133,0.1)]">
                  FINAL STEP <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <motion.div 
              key="s3" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center space-y-12"
            >
              <div>
                <ShieldAlert size={60} className="mx-auto text-primary mb-6 animate-pulse" />
                <h2 className="text-5xl font-black font-clash uppercase tracking-tighter mb-4">
                  Review <br/> & <span className="text-primary">Submit.</span>
                </h2>
                <p className="text-white/30 text-sm font-medium">By submitting, you agree that all information is truthful.</p>
              </div>

              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-left space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Entry Type</span>
                  <span className="text-primary font-black uppercase tracking-widest text-[10px]">{formData.type} VALUABLE</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Item Title</span>
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">{formData.title || "Untitled"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Privacy</span>
                  <span className="text-secondary font-black uppercase tracking-widest text-[10px]">{formData.category.replace('_', ' ')}</span>
                </div>
              </div>

              <button onClick={handleSubmit} className="w-full bg-primary text-black py-8 rounded-[2.5rem] font-black tracking-[0.5em] text-sm shadow-[0_20px_50px_rgba(0,255,133,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                SUBMIT REPORT NOW
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function SuccessState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-12">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} 
          transition={{ repeat: Infinity, duration: 4 }} 
          className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center"
        >
          <Heart size={60} className="text-primary fill-primary" />
        </motion.div>
      </div>
      
      <h1 className="text-6xl font-black font-clash uppercase tracking-tighter text-white mb-4">
        Report <br/> <span className="text-primary">Received!</span>
      </h1>
      <p className="text-white/40 max-w-sm font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-12">
        Integrity is the bedrock of our community. Our guardians are now scanning the network for matches.
      </p>

      <Link href="/" className="bg-white text-black px-12 py-5 rounded-2xl font-black tracking-widest text-xs uppercase hover:bg-primary transition-all">
        Back to Dashboard
      </Link>
    </motion.div>
  );
}