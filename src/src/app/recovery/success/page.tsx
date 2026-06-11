// src/app/recovery/success/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, ArrowRight, CheckCircle2, Loader2, Smartphone, Gift, Shield, Award, TrendingUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TIP_PRESETS = [500, 1000, 2000, 5000];
const PAYMENT_METHODS = [
  { id: "mtn",    label: "MTN Mobile Money", color: "bg-yellow-400" },
  { id: "orange", label: "Orange Money",      color: "bg-orange-500" },
  { id: "card",   label: "Card Payment",      color: "bg-slate-300" },
];
type Step = "success" | "rating" | "tip" | "payment" | "done";

function getGuardianLevel(points: number) {
  if (points >= 200) return { label: "Gold Guardian",   color: "#FCD116", next: null };
  if (points >= 100) return { label: "Silver Guardian", color: "#94a3b8", next: "Gold at 200pts" };
  if (points >= 50)  return { label: "Bronze Guardian", color: "#fb923c", next: "Silver at 100pts" };
  return              { label: "New Guardian",           color: "#009A49", next: "Bronze at 50pts" };
}

function RecoverySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const db = supabase as any;
  const recoveryId = searchParams.get("recovery_id");
  const chatId     = searchParams.get("chat_id");

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
  const [guardianPoints, setGuardianPoints] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(50);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setCurrentUser(user);
      const { data: profile } = await db.from("users").select("guardian_points, recovery_count").eq("id", user.id).single();
      if (profile) setGuardianPoints(profile.guardian_points ?? 0);
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
        body: JSON.stringify({ amount, currency: "XAF", phone: phoneNumber, channel: paymentMethod, recovery_id: recoveryId, description: "Back2U tip for item recovery", payment_type: "tip", email: currentUser.email }),
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

  const guardian = getGuardianLevel(guardianPoints);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #eaf6f0 0%, #f0fdfa 35%, #fffbeb 70%, #f0fdf4 100%)" }}>

      {/* SVG background blobs — same style as hero */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <path d="M1100 -80 C1320 -60, 1500 80, 1480 260 C1460 440, 1280 480, 1120 400 C960 320, 880 160, 960 60 C1020 -20, 1060 -60, 1100 -80 Z" fill="url(#rsTR)" opacity="0.5"/>
          <path d="M-120 500 C-40 400, 120 380, 200 460 C280 540, 260 660, 140 720 C20 780, -80 740, -120 660 C-160 580, -140 520, -120 500 Z" fill="url(#rsBL)" opacity="0.45"/>
          <path d="M0 780 C240 700, 480 760, 720 720 C960 680, 1200 740, 1440 700 L1440 900 L0 900 Z" fill="url(#rsWave)" opacity="0.3"/>
          <circle cx="720" cy="250" r="120" fill="url(#rsY)" opacity="0.12"/>
          <defs>
            <radialGradient id="rsTR" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00ADB5" stopOpacity="1"/>
              <stop offset="60%" stopColor="#009A49" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="#009A49" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="rsBL" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#009A49" stopOpacity="1"/>
              <stop offset="60%" stopColor="#00ADB5" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#00ADB5" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="rsWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#009A49" stopOpacity="0.4"/>
              <stop offset="50%" stopColor="#00ADB5" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#009A49" stopOpacity="0.35"/>
            </linearGradient>
            <radialGradient id="rsY" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FCD116" stopOpacity="1"/>
              <stop offset="100%" stopColor="#FCD116" stopOpacity="0"/>
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">

          {/* SUCCESS SCREEN */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -40 }} className="flex flex-col items-center max-w-md w-full">
              <div className="relative mb-8">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}
                  className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,154,73,0.12)", border: "2px solid rgba(0,154,73,0.2)" }}>
                  <Heart size={56} className="text-primary fill-primary" />
                </motion.div>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
                    <div className="absolute w-2.5 h-2.5 bg-primary rounded-full" style={{ top: `${10 + i * 8}%`, left: "50%", transform: "translateX(-50%)" }} />
                  </motion.div>
                ))}
              </div>

              <h1 className="font-black uppercase tracking-tighter text-slate-900 mb-3 leading-none"
                style={{ fontFamily: "'Clash Grotesk', sans-serif", fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
                Item <br /><span className="text-primary">Recovered!</span>
              </h1>
              <p className="text-slate-400 max-w-sm font-bold uppercase tracking-widest text-[9px] leading-relaxed mb-6">
                Integrity is the bedrock of our community. You have made Cameroon a little more honest today.
              </p>

              <div className="flex gap-3 justify-center mb-4 w-full">
                <div className="flex-1 rounded-2xl px-4 py-4 text-center"
                  style={{ background: "rgba(0,154,73,0.08)", border: "1px solid rgba(0,154,73,0.2)" }}>
                  <p className="font-black text-3xl text-primary" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>+{pointsEarned}</p>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Guardian Points</p>
                </div>
                <div className="flex-1 rounded-2xl px-4 py-4 text-center"
                  style={{ background: "rgba(0,173,181,0.08)", border: "1px solid rgba(0,173,181,0.2)" }}>
                  <p className="font-black text-3xl text-[#00ADB5]" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>+1</p>
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Recovery</p>
                </div>
              </div>

              <div className="w-full rounded-2xl p-4 mb-6"
                style={{ background: "rgba(252,209,22,0.08)", border: "1px solid rgba(252,209,22,0.2)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award size={16} style={{ color: guardian.color }} />
                    <p className="font-black text-sm uppercase tracking-wide" style={{ color: guardian.color }}>{guardian.label}</p>
                  </div>
                  <p className="text-slate-400 text-xs font-bold">{guardianPoints} pts</p>
                </div>
                {guardian.next && (
                  <div className="flex items-center gap-2">
                    <TrendingUp size={11} className="text-slate-300" />
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{guardian.next}</p>
                  </div>
                )}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep("rating")}
                className="w-full text-white py-5 rounded-[2rem] font-black tracking-[0.3em] text-sm flex items-center justify-center gap-3"
                style={{ background: "#009A49", boxShadow: "0 12px 40px rgba(0,154,73,0.25)" }}>
                Rate Experience <ArrowRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* RATING */}
          {step === "rating" && (
            <motion.div key="rating" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="flex flex-col items-center max-w-md w-full">
              <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8"
                style={{ background: "rgba(252,209,22,0.12)", border: "1px solid rgba(252,209,22,0.3)" }}>
                <Star size={40} className="text-secondary fill-secondary" />
              </div>
              <h2 className="font-black uppercase tracking-tighter text-slate-900 mb-3 leading-none"
                style={{ fontFamily: "'Clash Grotesk', sans-serif", fontSize: "clamp(2rem, 6vw, 3.5rem)" }}>
                Rate Your <br /><span className="text-primary">Experience.</span>
              </h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10">
                How was your experience with <span className="text-slate-700">{otherUserName}</span>?
              </p>
              <div className="flex gap-4 mb-10">
                {[1, 2, 3, 4, 5].map(star => (
                  <motion.button key={star} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}>
                    <Star size={44} className={`transition-all ${star <= (hoverRating || rating) ? "text-secondary fill-secondary" : "text-slate-200"}`} />
                  </motion.button>
                ))}
              </div>
              <div className="mb-10 h-6">
                {(hoverRating || rating) > 0 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-slate-500 font-black text-xs uppercase tracking-widest">
                    {["", "Poor", "Fair", "Good", "Great", "Excellent!"][hoverRating || rating]}
                  </motion.p>
                )}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleSubmitRating} disabled={rating === 0 || submittingRating}
                className="w-full text-white py-5 rounded-[2rem] font-black tracking-[0.3em] text-sm flex items-center justify-center gap-3 disabled:opacity-40"
                style={{ background: "#009A49", boxShadow: "0 12px 40px rgba(0,154,73,0.2)" }}>
                {submittingRating ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : <>Submit Rating <ArrowRight size={18} /></>}
              </motion.button>
              <button onClick={() => setStep("tip")} className="mt-4 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:text-slate-500 transition-colors">
                Skip for now
              </button>
            </motion.div>
          )}

          {/* TIP */}
          {step === "tip" && (
            <motion.div key="tip" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="flex flex-col items-center max-w-md w-full">
              <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8"
                style={{ background: "rgba(0,154,73,0.1)", border: "1px solid rgba(0,154,73,0.2)" }}>
                <Gift size={40} className="text-primary" />
              </div>
              <h2 className="font-black uppercase tracking-tighter text-slate-900 mb-3 leading-none"
                style={{ fontFamily: "'Clash Grotesk', sans-serif", fontSize: "clamp(2rem, 6vw, 3.5rem)" }}>
                Send a <br /><span className="text-primary">Tip.</span>
              </h2>
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Optional — show your appreciation</p>
              <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-8">Tips go to the Back2U platform to keep the service running</p>
              <div className="grid grid-cols-4 gap-3 w-full mb-5">
                {TIP_PRESETS.map(amount => (
                  <motion.button key={amount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { setTipAmount(amount); setCustomTip(""); }}
                    className={`py-4 rounded-2xl border-2 transition-all font-black text-sm ${tipAmount === amount && !customTip ? "border-primary text-primary" : "border-slate-200 text-slate-400"}`}
                    style={{ background: tipAmount === amount && !customTip ? "rgba(0,154,73,0.06)" : "#fff" }}>
                    <span className="block text-[9px] font-bold uppercase tracking-widest mb-1 opacity-60">XAF</span>
                    {amount.toLocaleString()}
                  </motion.button>
                ))}
              </div>
              <div className="w-full rounded-2xl p-4 flex items-center gap-3 mb-8 focus-within:border-primary transition-all"
                style={{ background: "#fff", border: "1.5px solid #e2e8f0" }}>
                <span className="text-slate-300 text-xs font-black uppercase tracking-widest shrink-0">XAF</span>
                <input type="number" value={customTip} onChange={e => { setCustomTip(e.target.value); setTipAmount(null); }} placeholder="Custom amount..."
                  className="bg-transparent flex-1 text-slate-900 font-black text-sm focus:outline-none placeholder:text-slate-300" />
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setStep("done")} className="flex-1 py-5 border-2 border-slate-200 rounded-[2rem] font-black text-xs tracking-widest text-slate-300 hover:border-slate-300 transition-all">
                  Skip
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { if (getFinalTipAmount()) setStep("payment"); }} disabled={!getFinalTipAmount()}
                  className="flex-[2] py-5 text-white rounded-[2rem] font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-40"
                  style={{ background: "#009A49" }}>
                  Continue <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* PAYMENT */}
          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="flex flex-col items-center max-w-md w-full">
              <h2 className="font-black uppercase tracking-tighter text-slate-900 mb-2 leading-none"
                style={{ fontFamily: "'Clash Grotesk', sans-serif", fontSize: "clamp(2rem, 6vw, 3.5rem)" }}>
                Pay <span className="text-primary">XAF {getFinalTipAmount()?.toLocaleString()}</span>
              </h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-8">Choose your payment method</p>
              <div className="w-full space-y-3 mb-6">
                {PAYMENT_METHODS.map(method => (
                  <motion.button key={method.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { if (method.id !== "card") setPaymentMethod(method.id); }} disabled={method.id === "card"}
                    className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${paymentMethod === method.id ? "border-primary" : "border-slate-200"} ${method.id === "card" ? "opacity-30 cursor-not-allowed" : ""}`}
                    style={{ background: paymentMethod === method.id ? "rgba(0,154,73,0.04)" : "#fff" }}>
                    <div className={`w-10 h-10 ${method.color} rounded-xl flex items-center justify-center`} />
                    <div className="flex-1">
                      <p className="font-black text-sm text-slate-900 uppercase tracking-tight">{method.label}</p>
                      {method.id === "card" && <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Coming soon</p>}
                    </div>
                    {paymentMethod === method.id && <CheckCircle2 size={20} className="text-primary" />}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {paymentMethod && paymentMethod !== "card" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="w-full mb-6">
                    <div className="rounded-2xl p-5 flex items-center gap-4 focus-within:border-primary transition-all"
                      style={{ background: "#fff", border: "1.5px solid #e2e8f0" }}>
                      <Smartphone size={20} className="text-slate-300 shrink-0" />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-slate-400 font-black text-sm">+237</span>
                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))} placeholder="6XXXXXXXX"
                          className="bg-transparent flex-1 text-slate-900 font-black text-sm focus:outline-none placeholder:text-slate-300" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {paymentError && (
                <div className="w-full rounded-2xl p-4 mb-4 text-left"
                  style={{ background: "rgba(206,17,38,0.06)", border: "1px solid rgba(206,17,38,0.2)" }}>
                  <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">{paymentError}</p>
                </div>
              )}
              <div className="flex items-center gap-2 mb-6">
                <Shield size={14} className="text-slate-300" />
                <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">Secured by MeSomb</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setStep("tip")} className="flex-1 py-5 border-2 border-slate-200 rounded-[2rem] font-black text-xs tracking-widest text-slate-300 hover:border-slate-300 transition-all">Back</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handlePayment} disabled={!paymentMethod || processingPayment || (paymentMethod !== "card" && !phoneNumber.trim())}
                  className="flex-[2] py-5 text-white rounded-[2rem] font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-40"
                  style={{ background: "#009A49" }}>
                  {processingPayment ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <>Pay XAF {getFinalTipAmount()?.toLocaleString()} <ArrowRight size={18} /></>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* DONE */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center max-w-md w-full">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}
                className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
                style={{ background: "rgba(0,154,73,0.12)", border: "2px solid rgba(0,154,73,0.2)" }}>
                <CheckCircle2 size={56} className="text-primary" />
              </motion.div>
              <h1 className="font-black uppercase tracking-tighter text-slate-900 mb-4 leading-none"
                style={{ fontFamily: "'Clash Grotesk', sans-serif", fontSize: "clamp(2.5rem, 8vw, 4rem)" }}>
                All <br /><span className="text-primary">Done!</span>
              </h1>
              <p className="text-slate-400 max-w-sm font-bold uppercase tracking-widest text-[9px] leading-relaxed mb-8">
                Thank you for using Back2U. Your story helps build a more honest Cameroon.
              </p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/dashboard")}
                className="w-full text-white py-5 rounded-[2rem] font-black tracking-[0.3em] text-sm hover:opacity-90 transition-all"
                style={{ background: "#009A49", boxShadow: "0 12px 40px rgba(0,154,73,0.2)" }}>
                Back to Dashboard
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  );
}

export default function RecoverySuccessPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf6f0 0%, #f0fdfa 50%, #f0fdf4 100%)" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <RecoverySuccessPage />
    </Suspense>
  );
}