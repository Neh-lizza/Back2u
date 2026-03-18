// src/app/recovery/success/page.tsx
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ArrowRight, CheckCircle2, Loader2, Smartphone, Gift, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import confetti from "canvas-confetti";

const TIP_PRESETS = [500, 1000, 2000, 5000];
const PAYMENT_METHODS = [
  { id: "mtn",    label: "MTN Mobile Money", color: "bg-yellow-400", icon: "📱" },
  { id: "orange", label: "Orange Money",      color: "bg-orange-500", icon: "📱" },
  { id: "card",   label: "Card Payment",      color: "bg-dark",       icon: "💳" },
];
type Step = "success" | "rating" | "tip" | "payment" | "done";

function RecoverySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const db = supabase as any;
  const recoveryId = searchParams.get("recovery_id");
  const chatId = searchParams.get("chat_id");

  const [step, setStep] = useState<Step>("success");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tipAmount, setTipAmount] = useState<number | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [otherUserName, setOtherUserName] = useState("your partner");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 }, colors: ["#009A49", "#FCD116", "#CE1126", "#ffffff"] });
    setTimeout(() => {
      confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ["#009A49", "#FCD116"] });
      confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ["#009A49", "#FCD116"] });
    }, 600);
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setCurrentUser(user);
      if (chatId) {
        const { data: chat } = await db.from("chats").select("participant_a, participant_b").eq("id", chatId).single();
        if (chat) {
          const otherId = chat.participant_a === user.id ? chat.participant_b : chat.participant_a;
          const { data: otherUser } = await db.from("users").select("full_name").eq("id", otherId).single();
          if (otherUser) setOtherUserName(otherUser.full_name);
        }
      }
    };
    load();
  }, [chatId]);

  const handleSubmitRating = async () => {
    if (rating === 0 || !recoveryId || !currentUser) return;
    setSubmittingRating(true);
    try {
      const { data: recovery } = await db.from("recoveries").select("*").eq("id", recoveryId).single();
      if (recovery) {
        const { data: chat } = await db.from("chats").select("participant_a, participant_b").eq("id", recovery.chat_id).single();
        if (chat) {
          const isParticipantA = chat.participant_a === currentUser.id;
          await db.from("recoveries").update(isParticipantA ? { rating_by_a: rating } : { rating_by_b: rating }).eq("id", recoveryId);
          const otherId = isParticipantA ? chat.participant_b : chat.participant_a;
          const { data: otherUser } = await db.from("users").select("rating, rating_count").eq("id", otherId).single();
          if (otherUser) {
            const newCount = (otherUser.rating_count ?? 0) + 1;
            const newRating = ((otherUser.rating ?? 0) * (newCount - 1) + rating) / newCount;
            await db.from("users").update({ rating: newRating, rating_count: newCount }).eq("id", otherId);
          }
        }
      }
      setStep("tip");
    } catch (err) { console.error(err); }
    finally { setSubmittingRating(false); }
  };

  const getFinalTipAmount = () => {
    if (customTip && parseInt(customTip) > 0) return parseInt(customTip);
    return tipAmount;
  };

  const handlePayment = async () => {
    const amount = getFinalTipAmount();
    if (!amount || !paymentMethod || !currentUser) return;
    if (paymentMethod !== "card" && !phoneNumber.trim()) { setPaymentError("Please enter your phone number."); return; }
    setProcessingPayment(true);
    setPaymentError(null);
    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: "XAF", phone: phoneNumber, channel: paymentMethod, recovery_id: recoveryId, description: "Back2U tip for item recovery", email: currentUser.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment initiation failed.");
      if (data.payment_url) { window.location.href = data.payment_url; return; }
      await db.from("recoveries").update({ tip_amount: amount, tip_status: "pending", tip_transaction_id: data.transaction_id ?? null }).eq("id", recoveryId);
      setStep("done");
    } catch (err: any) {
      setPaymentError(err.message || "Payment failed. Please try again.");
    } finally { setProcessingPayment(false); }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      <AnimatePresence mode="wait">

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -40 }} className="flex flex-col items-center max-w-md w-full">
            <div className="relative mb-12">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-36 h-36 bg-primary/20 rounded-full flex items-center justify-center">
                <Heart size={70} className="text-primary fill-primary" />
              </motion.div>
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }} className="absolute inset-0" style={{ transformOrigin: "center" }}>
                  <div className="absolute w-3 h-3 bg-primary rounded-full" style={{ top: `${10 + i * 8}%`, left: "50%", transform: "translateX(-50%)" }} />
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h1 className="text-6xl font-black font-clash uppercase tracking-tighter text-white mb-4 leading-none">Item <br /><span className="text-primary">Recovered!</span></h1>
              <p className="text-white/40 max-w-sm font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-4">Integrity is the bedrock of our community. You've made Cameroon a little more honest today.</p>
              <div className="flex gap-4 justify-center mb-12">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4"><p className="text-primary font-black text-2xl font-clash">+50</p><p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Points Earned</p></div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4"><p className="text-primary font-black text-2xl font-clash">+1</p><p className="text-white/30 text-[9px] font-black uppercase tracking-widest">Recovery</p></div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep("rating")} className="w-full bg-primary text-dark py-6 rounded-[2rem] font-black tracking-[0.3em] text-sm shadow-[0_20px_50px_rgba(0,154,73,0.2)] flex items-center justify-center gap-3">
                Continue <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {step === "rating" && (
          <motion.div key="rating" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="flex flex-col items-center max-w-md w-full">
            <div className="w-20 h-20 bg-secondary/20 rounded-[2rem] flex items-center justify-center mb-8"><Star size={40} className="text-secondary fill-secondary" /></div>
            <h2 className="text-5xl font-black font-clash uppercase tracking-tighter text-white mb-3 leading-none">Rate Your <br /><span className="text-primary">Experience.</span></h2>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-12">How was your experience with <span className="text-white">{otherUserName}</span>?</p>
            <div className="flex gap-4 mb-12">
              {[1, 2, 3, 4, 5].map(star => (
                <motion.button key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                  <Star size={44} className={`transition-all ${star <= (hoverRating || rating) ? "text-secondary fill-secondary" : "text-white/10"}`} />
                </motion.button>
              ))}
            </div>
            <div className="mb-12 h-6">
              {(hoverRating || rating) > 0 && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white/60 font-black text-xs uppercase tracking-widest">{["", "Poor", "Fair", "Good", "Great", "Excellent!"][hoverRating || rating]}</motion.p>}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmitRating} disabled={rating === 0 || submittingRating} className="w-full bg-primary text-dark py-6 rounded-[2rem] font-black tracking-[0.3em] text-sm flex items-center justify-center gap-3 disabled:opacity-40">
              {submittingRating ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <>Submit Rating <ArrowRight size={20} /></>}
            </motion.button>
            <button onClick={() => setStep("tip")} className="mt-4 text-white/20 text-[10px] font-black uppercase tracking-widest hover:text-white/40 transition-colors">Skip for now</button>
          </motion.div>
        )}

        {step === "tip" && (
          <motion.div key="tip" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="flex flex-col items-center max-w-md w-full">
            <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mb-8"><Gift size={40} className="text-primary" /></div>
            <h2 className="text-5xl font-black font-clash uppercase tracking-tighter text-white mb-3 leading-none">Send a <br /><span className="text-primary">Tip.</span></h2>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-2">Optional — show your appreciation</p>
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-10">Tips go to the Back2U platform to keep the service running</p>
            <div className="grid grid-cols-4 gap-3 w-full mb-6">
              {TIP_PRESETS.map(amount => (
                <motion.button key={amount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setTipAmount(amount); setCustomTip(""); }} className={`py-4 rounded-2xl border-2 transition-all font-black text-sm ${tipAmount === amount && !customTip ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/40"}`}>
                  <span className="block text-[9px] font-bold uppercase tracking-widest mb-1 opacity-60">XAF</span>{amount.toLocaleString()}
                </motion.button>
              ))}
            </div>
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 mb-10 focus-within:border-primary transition-all">
              <span className="text-white/30 text-xs font-black uppercase tracking-widest shrink-0">XAF</span>
              <input type="number" value={customTip} onChange={e => { setCustomTip(e.target.value); setTipAmount(null); }} placeholder="Custom amount..." className="bg-transparent flex-1 text-white font-black text-sm focus:outline-none placeholder:text-white/20" />
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setStep("done")} className="flex-1 py-5 border-2 border-white/5 rounded-[2rem] font-black text-xs tracking-widest text-white/30 hover:bg-white/5 transition-all">Skip</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { if (getFinalTipAmount()) setStep("payment"); }} disabled={!getFinalTipAmount()} className="flex-[2] py-5 bg-primary text-dark rounded-[2rem] font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-40">
                Continue <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "payment" && (
          <motion.div key="payment" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="flex flex-col items-center max-w-md w-full">
            <h2 className="text-5xl font-black font-clash uppercase tracking-tighter text-white mb-2 leading-none">Pay <span className="text-primary">XAF {getFinalTipAmount()?.toLocaleString()}</span></h2>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-10">Choose your payment method</p>
            <div className="w-full space-y-3 mb-8">
              {PAYMENT_METHODS.map(method => (
                <motion.button key={method.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { if (method.id !== "card") setPaymentMethod(method.id); }} disabled={method.id === "card"} className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${paymentMethod === method.id ? "border-primary bg-primary/5" : "border-white/10"} ${method.id === "card" ? "opacity-30 cursor-not-allowed" : ""}`}>
                  <div className={`w-10 h-10 ${method.color} rounded-xl flex items-center justify-center text-lg`}>{method.icon}</div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-white uppercase tracking-tight">{method.label}</p>
                    {method.id === "card" && <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">Coming soon</p>}
                  </div>
                  {paymentMethod === method.id && <CheckCircle2 size={20} className="text-primary" />}
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {paymentMethod && paymentMethod !== "card" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="w-full mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 focus-within:border-primary transition-all">
                    <Smartphone size={20} className="text-white/30 shrink-0" />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-white/40 font-black text-sm">+237</span>
                      <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="6XXXXXXXX" className="bg-transparent flex-1 text-white font-black text-sm focus:outline-none placeholder:text-white/20" />
                    </div>
                  </div>
                  <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-2 text-center">You will receive a payment prompt on your phone</p>
                </motion.div>
              )}
            </AnimatePresence>
            {paymentError && <div className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-left"><p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{paymentError}</p></div>}
            <div className="flex items-center gap-2 mb-8"><Shield size={14} className="text-white/20" /><p className="text-white/20 text-[9px] font-bold uppercase tracking-widest">Secured by NotchPay</p></div>
            <div className="flex gap-3 w-full">
              <button onClick={() => setStep("tip")} className="flex-1 py-5 border-2 border-white/5 rounded-[2rem] font-black text-xs tracking-widest text-white/30 hover:bg-white/5 transition-all">Back</button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePayment} disabled={!paymentMethod || processingPayment || (paymentMethod !== "card" && !phoneNumber.trim())} className="flex-[2] py-5 bg-primary text-dark rounded-[2rem] font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-40">
                {processingPayment ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <>Pay XAF {getFinalTipAmount()?.toLocaleString()} <ArrowRight size={18} /></>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center max-w-md w-full">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-10">
              <CheckCircle2 size={64} className="text-primary" />
            </motion.div>
            <h1 className="text-6xl font-black font-clash uppercase tracking-tighter text-white mb-4 leading-none">All <br /><span className="text-primary">Done!</span></h1>
            <p className="text-white/40 max-w-sm font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-12">Thank you for using Back2U. Your story helps build a more honest Cameroon.</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push("/dashboard")} className="w-full bg-white text-dark py-6 rounded-[2rem] font-black tracking-[0.3em] text-sm hover:bg-primary transition-all">
              Back to Dashboard
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}

export default function RecoverySuccessPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <RecoverySuccessPage />
    </Suspense>
  );
}