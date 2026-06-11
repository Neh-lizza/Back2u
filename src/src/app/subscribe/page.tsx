// src/app/subscribe/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Phone, ArrowLeft, Zap, Shield, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

const BG = (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect width="1440" height="900" fill="#eaf6f0"/>
      <path d="M1100 -80 C1320 -60,1500 80,1480 260 C1460 440,1280 480,1120 400 C960 320,880 160,960 60 C1020 -20,1060 -60,1100 -80 Z"
        fill="url(#subTR)" opacity="0.6"/>
      <path d="M-120 500 C-40 400,120 380,200 460 C280 540,260 660,140 720 C20 780,-80 740,-120 660 C-160 580,-140 520,-120 500 Z"
        fill="url(#subBL)" opacity="0.5"/>
      <path d="M0 780 C240 700,480 760,720 720 C960 680,1200 740,1440 700 L1440 900 L0 900 Z"
        fill="url(#subWave)" opacity="0.3"/>
      <circle cx="720" cy="200" r="140" fill="url(#subY)" opacity="0.1"/>
      <defs>
        <radialGradient id="subTR" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00ADB5" stopOpacity="1"/>
          <stop offset="60%" stopColor="#009A49" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#009A49" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="subBL" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#009A49" stopOpacity="1"/>
          <stop offset="60%" stopColor="#00ADB5" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#00ADB5" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="subWave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#009A49" stopOpacity="0.35"/>
          <stop offset="50%" stopColor="#00ADB5" stopOpacity="0.25"/>
          <stop offset="100%" stopColor="#009A49" stopOpacity="0.3"/>
        </linearGradient>
        <radialGradient id="subY" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FCD116" stopOpacity="1"/>
          <stop offset="100%" stopColor="#FCD116" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  </div>
);

export default function SubscribePage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();
  const db = supabase as any;

  const [phone, setPhone]   = useState("");
  const [operator, setOperator] = useState<"mtn" | "orange">("mtn");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);
  const [user, setUser]         = useState<any>(null);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [subEnd, setSubEnd]     = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }
      setUser(user);
      const { data: profile } = await db.from("users").select("is_subscribed, subscription_end, phone").eq("id", user.id).single();
      if (profile?.is_subscribed && new Date(profile.subscription_end) > new Date()) {
        setIsAlreadySubscribed(true);
        setSubEnd(new Date(profile.subscription_end).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }));
      }
      if (profile?.phone) setPhone(profile.phone);
    };
    load();
  }, []);

  const handleSubscribe = async () => {
    if (!phone || phone.length < 9) { setError("Please enter a valid phone number."); return; }
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: sub, error: subError } = await db.from("subscriptions").insert({
        user_id: user.id, amount: 300, currency: "XAF", status: "pending", phone,
      }).select().single();
      if (subError) throw new Error(subError.message);
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, operator, amount: 300, subscription_id: sub.id, user_id: user.id }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Payment failed. Please try again.");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Already subscribed
  if (isAlreadySubscribed) return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {BG}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-sm w-full text-center space-y-5 bg-white rounded-3xl p-8"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
          style={{ background: "rgba(0,154,73,0.1)", border: "1px solid rgba(0,154,73,0.2)" }}>
          <CheckCircle2 size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
          Already Subscribed!
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Your subscription is active until <span className="text-primary font-bold">{subEnd}</span>. You can post unlimited lost reports and contact finders for free.
        </p>
        <Link href="/report" className="block w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white hover:opacity-90 transition-all"
          style={{ background: "#009A49" }}>
          Post a Report
        </Link>
        <Link href="/dashboard" className="block text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors">
          Back to Dashboard
        </Link>
      </motion.div>
    </main>
  );

  // Payment success
  if (success) return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {BG}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-sm w-full text-center space-y-5 bg-white rounded-3xl p-8"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
        <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
          style={{ background: "rgba(0,154,73,0.1)", border: "1px solid rgba(0,154,73,0.2)" }}>
          <CheckCircle2 size={48} className="text-primary" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
          Subscribed!
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Payment confirmed. You now have unlimited access to post and contact for 12 months.
        </p>
        <Link href="/report" className="block w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white hover:opacity-90 transition-all"
          style={{ background: "#009A49" }}>
          Post Your First Report
        </Link>
        <Link href="/dashboard" className="block text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-slate-500 transition-colors">
          Back to Dashboard
        </Link>
      </motion.div>
    </main>
  );

  return (
    <main className="min-h-screen px-4 py-8 relative overflow-hidden">
      {BG}
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
      `}</style>

      <div className="max-w-md mx-auto space-y-5 relative z-10">

        {/* Back */}
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
          <ArrowLeft size={13} /> Back
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
            Back2U <span className="text-primary">Annual Pass</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            One payment. Unlimited access for 12 months.
          </p>
        </div>

        {/* Price card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f0fdf4, #f0fdfa)", border: "1.5px solid #bbf7d0" }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,154,73,0.12) 0%, transparent 70%)" }} />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Annual Subscription</p>
          <div className="flex items-end justify-center gap-1 mb-1">
            <span className="font-black text-slate-900" style={{ fontSize: "4rem", lineHeight: 1, fontFamily: "'Clash Grotesk', sans-serif" }}>300</span>
            <span className="text-xl font-black text-slate-400 mb-2">XAF</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">per year</p>
        </motion.div>

        {/* What you get */}
        <div className="rounded-2xl p-5 space-y-3 bg-white"
          style={{ border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">What you get</p>
          {[
            { icon: Zap,           text: "Unlimited lost item reports for 12 months" },
            { icon: MessageSquare, text: "Contact any finder for free" },
            { icon: Shield,        text: "Found items and missing persons always free" },
            { icon: Star,          text: "Guardian points and recovery badges" },
            { icon: CheckCircle2,  text: "First report always free — pay only when you need more" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(0,154,73,0.1)", border: "1px solid rgba(0,154,73,0.15)" }}>
                <item.icon size={13} className="text-primary" />
              </div>
              <p className="text-xs font-medium text-slate-600">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Payment form */}
        <div className="rounded-2xl p-5 space-y-4 bg-white"
          style={{ border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pay via Mobile Money</p>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300 px-2 py-1 rounded-full"
              style={{ background: "#fef3c7", color: "#b45309" }}>
              Simulated
            </span>
          </div>

          {/* Operator toggle */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "mtn",    label: "MTN MoMo",    active: "#FCD116", activeText: "#061209" },
              { id: "orange", label: "Orange Money", active: "#FF6600", activeText: "#fff" },
            ].map(op => (
              <button key={op.id} onClick={() => setOperator(op.id as "mtn" | "orange")}
                className="py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                style={{
                  background: operator === op.id ? op.active : "#f8fafc",
                  color: operator === op.id ? op.activeText : "#94a3b8",
                  border: `1.5px solid ${operator === op.id ? op.active : "#e2e8f0"}`,
                }}>
                {op.label}
              </button>
            ))}
          </div>

          {/* Phone number */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 focus-within:border-primary transition-all"
            style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
            <Phone size={16} className="text-slate-300 shrink-0" />
            <input
              type="tel"
              placeholder={t("phoneNumber")}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={9}
              className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs font-bold uppercase tracking-widest text-red-500">{error}</p>
          )}

          {/* Simulation notice */}
          <div className="rounded-xl p-3" style={{ background: "rgba(252,209,22,0.08)", border: "1px solid rgba(252,209,22,0.2)" }}>
            <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
              Payment is currently simulated. No real money will be charged. Your account will be activated immediately.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe} disabled={loading}
            className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 text-white"
            style={{ background: "#009A49", boxShadow: "0 8px 32px rgba(0,154,73,0.25)" }}>
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
              : <>Pay 300 XAF <CheckCircle2 size={18} /></>
            }
          </motion.button>

          <p className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-300">
            Powered by MeSomb · Secure payment
          </p>
        </div>

      </div>
    </main>
  );
}