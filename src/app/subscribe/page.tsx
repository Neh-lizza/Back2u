// src/app/subscribe/page.tsx
// NEW FILE
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Phone, ArrowLeft, Zap, Shield, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SubscribePage() {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;

  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState<"mtn" | "orange">("mtn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [subEnd, setSubEnd] = useState<string | null>(null);

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
    if (!phone || phone.length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create pending subscription record
      const { data: sub, error: subError } = await db.from("subscriptions").insert({
        user_id:  user.id,
        amount:   300,
        currency: "XAF",
        status:   "pending",
        phone:    phone,
      }).select().single();

      if (subError) throw new Error(subError.message);

      // 2. Trigger MeSomb payment via API route
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          operator,
          amount: 300,
          subscription_id: sub.id,
          user_id: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Payment failed. Please try again.");
      }

      setSuccess(true);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAlreadySubscribed) return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "#061209", backgroundImage: "linear-gradient(rgba(0,154,73,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,154,73,0.06) 1px,transparent 1px)", backgroundSize: "24px 24px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} className="text-primary" />
        </div>
        <h1 className="text-3xl font-black text-white">Already Subscribed!</h1>
        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
          Your subscription is active until <span className="text-primary font-bold">{subEnd}</span>. You can post unlimited lost reports and contact finders for free.
        </p>
        <Link href="/report" className="block w-full py-4 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          Post a Report
        </Link>
        <Link href="/dashboard" className="block text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          Back to Dashboard
        </Link>
      </motion.div>
    </main>
  );

  if (success) return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "#061209", backgroundImage: "linear-gradient(rgba(0,154,73,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,154,73,0.06) 1px,transparent 1px)", backgroundSize: "24px 24px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full text-center space-y-5">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto">
          <CheckCircle2 size={48} className="text-primary" />
        </motion.div>
        <h1 className="text-4xl font-black text-white">Subscribed!</h1>
        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
          Payment confirmed. You now have unlimited access to post and contact for 12 months.
        </p>
        <Link href="/report" className="block w-full py-4 rounded-2xl bg-primary text-black font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">
          Post Your First Report
        </Link>
        <Link href="/dashboard" className="block text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          Back to Dashboard
        </Link>
      </motion.div>
    </main>
  );

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: "#061209", backgroundImage: "linear-gradient(rgba(0,154,73,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,154,73,0.06) 1px,transparent 1px)", backgroundSize: "24px 24px" }}>
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
      `}</style>

      <div className="max-w-md mx-auto space-y-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          <ArrowLeft size={13} /> Back
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-4xl font-black text-white leading-tight" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
            Back2U <span className="text-primary">Annual Pass</span>
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            One payment. Unlimited access for 12 months.
          </p>
        </div>

        {/* Price card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 text-center relative overflow-hidden"
          style={{ background: "rgba(0,154,73,0.15)", border: "1px solid rgba(0,154,73,0.3)" }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/10 pointer-events-none" />
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Annual Subscription</p>
          <div className="flex items-end justify-center gap-1 mb-1">
            <span className="text-6xl font-black text-white" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>300</span>
            <span className="text-xl font-black text-white/60 mb-2">XAF</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>per year</p>
        </motion.div>

        {/* What you get */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">What you get</p>
          {[
            { icon: Zap,           text: "Unlimited lost item reports for 12 months" },
            { icon: MessageSquare, text: "Contact any finder for free" },
            { icon: Shield,        text: "Found items and missing persons always free" },
            { icon: Star,          text: "Guardian points and recovery badges" },
            { icon: CheckCircle2,  text: "First report always free — pay only when you need more" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <item.icon size={13} className="text-primary" />
              </div>
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Payment form */}
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Pay via Mobile Money</p>

          {/* Operator toggle */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "mtn",    label: "MTN MoMo",    color: "#FCD116" },
              { id: "orange", label: "Orange Money", color: "#FF6600" },
            ].map(op => (
              <button key={op.id} onClick={() => setOperator(op.id as "mtn" | "orange")}
                className="py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                style={{
                  background: operator === op.id ? op.color : "rgba(255,255,255,0.05)",
                  color: operator === op.id ? "#061209" : "rgba(255,255,255,0.4)",
                  border: `1px solid ${operator === op.id ? op.color : "rgba(255,255,255,0.1)"}`,
                }}>
                {op.label}
              </button>
            ))}
          </div>

          {/* Phone number */}
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Phone size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              type="tel"
              placeholder="6XXXXXXXX"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              maxLength={9}
              className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-white/20 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubscribe} disabled={loading}
            className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            style={{ background: "#009A49", color: "white", boxShadow: "0 8px 32px rgba(0,154,73,0.3)" }}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
              : <>Pay 300 XAF <CheckCircle2 size={18} /></>
            }
          </motion.button>

          <p className="text-center text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
            Powered by MeSomb · Secure payment
          </p>
        </div>
      </div>
    </main>
  );
}