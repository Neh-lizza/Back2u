//src/ components/ SuccessModal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Heart, Sparkles, X, CreditCard, Wallet } from "lucide-react";

export default function RecoverySuccess({ isOpen, onClose, finderName }: any) {
  const [step, setStep] = useState(1); // 1: Celebration, 2: Tip Selection
  const [tipAmount, setTipAmount] = useState(5000);

  const tips = [2000, 5000, 10000, 25000];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,255,133,0.3)]"
          >
            {/* Celebration Header */}
            <div className="bg-primary p-12 text-center relative overflow-hidden">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-full opacity-10"
              >
                <Sparkles size={300} />
              </motion.div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
                  <CheckCircle2 size={40} className="text-primary" />
                </div>
                <h2 className="text-3xl font-black font-clash text-white uppercase leading-none">REUNITED!</h2>
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Item Safely Recovered</p>
              </div>
            </div>

            <div className="p-10">
              {step === 1 ? (
                <div className="space-y-8 text-center">
                  <p className="text-slate-500 font-medium leading-relaxed">
                    You've successfully recovered your item from <span className="text-black font-bold">{finderName}</span>. 
                    Would you like to send a gratitude tip to support their honesty?
                  </p>
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-5 bg-black text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    Send a Tip <Heart size={16} fill="currentColor" />
                  </button>
                  <button onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-600 transition-colors">Skip for now</button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Amount (XAF)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {tips.map((amt) => (
                      <button 
                        key={amt}
                        onClick={() => setTipAmount(amt)}
                        className={`py-4 rounded-xl font-bold text-sm transition-all border-2 ${tipAmount === amt ? 'bg-primary/10 border-primary text-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                      >
                        {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                    <button className="w-full py-5 bg-[#00FF85] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
                      Pay with Mobile Money <Wallet size={16} />
                    </button>
                    <button onClick={() => setStep(1)} className="py-2 text-[9px] font-black uppercase tracking-widest text-slate-300">Back</button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}