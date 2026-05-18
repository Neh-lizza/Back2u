// src/app/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, ArrowRight, CheckCircle2, Users, PackageCheck,
  MessageSquareLock, Star, MapPin, Shield, Zap, X,
  Lock, Bell, Award, ChevronRight, Unlock, Eye, EyeOff,
  Smartphone, CreditCard, HeartHandshake, AlertCircle
} from "lucide-react";
import Link from "next/link";
import Counter from "@/components/Counter";
import ScrollRevealFeature from "@/components/ScrollRevealFeature";

// ── DATA ─────────────────────────────────────────────────
const REVIEWS = [
  { name: "Arnaud T.",     location: "Douala",  text: "Found my laptop in 2 days. The safe zone meeting was very professional.", stars: 5 },
  { name: "Marie-Louise",  location: "Yaoundé", text: "Honest community. Someone found my ID card and reported it here.",        stars: 5 },
  { name: "Kevin N.",      location: "Buea",    text: "The interface is so simple to use even for my parents.",                   stars: 4 },
  { name: "Sali H.",       location: "Garoua",  text: "I returned a wallet today. The gratitude tip system is a great touch!",   stars: 5 },
  { name: "Christelle M.", location: "Bamenda", text: "Got a match notification within hours of posting. Incredible.",            stars: 5 },
  { name: "Ibrahim D.",    location: "Maroua",  text: "Reported a found phone, owner confirmed same day. 50 Guardian points!",   stars: 5 },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Plus,
    color: "#009A49",
    title: "Post Your Report",
    description: "Lost or found something? Fill in our 3-step form — title, category, estimated value, and pin the exact location on our Cameroon map. Takes under 2 minutes.",
    tag: "Free to post",
  },
  {
    step: "02",
    icon: Zap,
    color: "#FCD116",
    title: "AI Matches You",
    description: "Our algorithm instantly scans all active reports and scores them by keyword similarity, GPS proximity, and date. You get a real-time notification when a match is found.",
    tag: "Automatic & instant",
  },
  {
    step: "03",
    icon: Unlock,
    color: "#009A49",
    title: "Unlock Contact",
    description: "Your first match contact is completely free. After that, a small XAF fee (300–5,000 XAF based on item value) unlocks the private chat. 40% goes to the finder as a reward.",
    tag: "First contact free",
  },
  {
    step: "04",
    icon: HeartHandshake,
    color: "#FCD116",
    title: "Recover & Rate",
    description: "Confirm the recovery in the chat. Both parties rate each other, earning Guardian points. High-rated users get priority listings and a verified badge.",
    tag: "Build your reputation",
  },
];

const FEES = [
  { range: "Under 10,000 XAF",      fee: "300 XAF",   example: "Keys, accessories",      color: "border-white/10" },
  { range: "10,000 – 50,000 XAF",   fee: "500 XAF",   example: "ID card, wallet",        color: "border-white/10" },
  { range: "50,000 – 150,000 XAF",  fee: "1,000 XAF", example: "Mid-range phone",        color: "border-primary/30" },
  { range: "150,000 – 500,000 XAF", fee: "2,000 XAF", example: "Laptop, iPhone",         color: "border-white/10" },
  { range: "Over 500,000 XAF",      fee: "5,000 XAF", example: "Motorbike, camera",      color: "border-white/10" },
];

const DIFFERENTIATORS = [
  { icon: MapPin,      title: "Cameroon-First",    desc: "10 cities, all regions. Built for Cameroonian addresses, not foreign postcodes." },
  { icon: Smartphone,  title: "MTN & Orange Money", desc: "Pay unlock fees and tips via MTN MoMo or Orange Money — no bank card needed." },
  { icon: Shield,      title: "Privacy Controls",   desc: "3 sensitivity levels. Very sensitive items are blurred and reviewed before going live." },
  { icon: Award,       title: "Guardian System",    desc: "Earn Bronze, Silver, Gold status. Build a verified reputation in your city." },
  { icon: Bell,        title: "Smart Matching",     desc: "Keyword + GPS + date algorithm. You're notified the moment a match scores ≥60 points." },
  { icon: Lock,        title: "Secure Chat",        desc: "Private encrypted messaging. No phone numbers shared until both parties confirm recovery." },
];

// ── ONBOARDING MODAL ─────────────────────────────────────
function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: AlertCircle,
      color: "text-[#CE1126]",
      bg: "bg-[#CE1126]/10",
      title: "Lost something?",
      body: "Post a \"Lost\" report with photos and location. Our algorithm immediately scans all \"Found\" reports for matches.",
      cta: "I lost something",
    },
    {
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary/10",
      title: "Found something?",
      body: "Post a \"Found\" report. You earn 10 Guardian points just for posting, and 40% of the unlock fee when the owner contacts you.",
      cta: "I found something",
    },
    {
      icon: Zap,
      color: "text-secondary",
      bg: "bg-secondary/10",
      title: "How matching works",
      body: "Every new post triggers our scoring algorithm — keywords, GPS distance, and date proximity. A match notification fires automatically when the score hits 60/100.",
      cta: "Got it",
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 max-w-md w-full relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-white/10"}`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-16 h-16 ${current.bg} rounded-[1.5rem] flex items-center justify-center mb-6`}>
          <Icon size={32} className={current.color} />
        </div>

        <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
          {current.title}
        </h3>
        <p className="text-white/50 font-medium leading-relaxed mb-8 text-sm">
          {current.body}
        </p>

        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-4 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all"
            >
              Back
            </button>
          )}
          <button
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onClose()}
            className="flex-[2] py-4 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            {current.cta} <ChevronRight size={14} />
          </button>
        </div>

        {/* Skip */}
        {step < steps.length - 1 && (
          <button
            onClick={onClose}
            className="w-full mt-4 text-white/20 text-[9px] font-black uppercase tracking-widest hover:text-white/40 transition-colors text-center"
          >
            Skip intro
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Show onboarding modal to first-time visitors
    const seen = localStorage.getItem("back2u_onboarded");
    if (!seen) {
      setTimeout(() => setShowModal(true), 1200);
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem("back2u_onboarded", "1");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white selection:bg-primary selection:text-white overflow-x-hidden">
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        h1, h2, h3, .font-clash { font-family: 'Clash Grotesk', sans-serif; }
      `}</style>

      {/* ── ONBOARDING MODAL ── */}
      <AnimatePresence>
        {showModal && <OnboardingModal onClose={handleCloseModal} />}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-8 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
            >
              🇨🇲 Cameroon's #1 Recovery Network
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl md:text-8xl lg:text-[96px] font-black leading-[0.85] tracking-[-0.04em] text-[#061209] uppercase"
            >
              Lost <span className="text-primary">Today</span>.<br />
              Found <span className="text-secondary">Soon</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 font-medium max-w-md leading-relaxed"
            >
              Cameroon's first smart lost & found network. Post a report, get matched automatically, unlock contact via MTN or Orange Money.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/report"
                className="bg-primary text-white px-8 py-5 rounded-2xl font-bold text-sm flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-primary/20 uppercase tracking-wider"
              >
                Report Item <Plus size={18} />
              </Link>
              <Link
                href="/browse"
                className="bg-white border-2 border-slate-200 px-8 py-5 rounded-2xl font-bold text-sm hover:border-primary transition-colors uppercase tracking-wider flex items-center gap-3"
              >
                Browse Reports <Search size={18} />
              </Link>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Free to post</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">First contact free</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">MTN & Orange Money</span>
              </div>
            </motion.div>
          </div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-[#0a0a0a] rounded-[3rem] p-8 border border-white/5 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] pointer-events-none" />

              {/* Mock match notification card */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Live Activity</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-primary text-[9px] font-black uppercase tracking-widest">3 matches today</span>
                  </div>
                </div>

                {/* Match card */}
                <div className="bg-white/5 border border-primary/20 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-transparent" />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Zap size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Match Found — 87 pts</p>
                      <p className="text-white font-black text-sm uppercase tracking-tight truncate">iPhone 15 Pro Max</p>
                      <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-1">Found near Molyko, Buea • 2h ago</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <div className="flex-1 bg-primary/10 rounded-xl py-2 text-center">
                      <p className="text-primary text-[8px] font-black uppercase tracking-widest">Keyword match</p>
                      <p className="text-white font-black text-sm">40pts</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl py-2 text-center">
                      <p className="text-white/30 text-[8px] font-black uppercase tracking-widest">GPS proximity</p>
                      <p className="text-white font-black text-sm">27pts</p>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl py-2 text-center">
                      <p className="text-white/30 text-[8px] font-black uppercase tracking-widest">Date match</p>
                      <p className="text-white font-black text-sm">20pts</p>
                    </div>
                  </div>
                </div>

                {/* Unlock fee card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Unlock size={18} className="text-secondary" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Contact Unlock Fee</p>
                        <p className="text-white font-black text-sm">1,000 XAF</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-primary">40% → Finder</p>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/20">= 400 XAF reward</p>
                    </div>
                  </div>
                </div>

                {/* City pins */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <div className="flex gap-2 flex-wrap">
                    {["Douala", "Yaoundé", "Buea", "Bamenda", "Garoua"].map(city => (
                      <span key={city} className="text-[8px] font-black uppercase tracking-widest text-white/30 bg-white/5 px-2 py-1 rounded-lg">{city}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SCROLL REVEAL ── */}
      <ScrollRevealFeature />

      {/* ── COUNTERS ── */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
          {[
            { val: 2450,  label: "Items Recovered",   icon: PackageCheck, blob: "#009A49" },
            { val: 12000, label: "Community Members",  icon: Users,        blob: "#FCD116" },
            { val: 10,    label: "Regions Covered",    icon: MapPin,       blob: "#009A49" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative flex flex-col justify-center items-center bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-lg py-10 px-6 hover:-translate-y-2 duration-500"
            >
              {/* Blob */}
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute w-48 h-48 blur-md z-10 duration-500 group-hover:blur-none group-hover:scale-110"
                style={{ fill: item.blob + "40" }}
              >
                <path
                  transform="translate(100 100)"
                  d="M39.5,-49.6C54.8,-43.2,73.2,-36.5,78.2,-24.6C83.2,-12.7,74.8,4.4,69,22.5C63.3,40.6,60.2,59.6,49.1,64.8C38.1,70,19,61.5,0.6,60.7C-17.9,59.9,-35.9,67,-47.2,61.9C-58.6,56.7,-63.4,39.5,-70,22.1C-76.6,4.7,-84.9,-12.8,-81.9,-28.1C-79,-43.3,-64.6,-56.3,-49.1,-62.5C-33.6,-68.8,-16.8,-68.3,-2.3,-65.1C12.1,-61.9,24.2,-55.9,39.5,-49.6Z"
                />
              </svg>

              {/* Content */}
              <div className="relative z-20 flex flex-col items-center gap-2">
                <item.icon size={22} className="opacity-50" style={{ color: item.blob }} />
                <h3 className="text-5xl font-black text-white tracking-tighter italic">
                  <Counter value={item.val} />+
                </h3>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-1" style={{ color: item.blob }}>
                  {item.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-32 px-4 max-w-7xl mx-auto" id="how-it-works">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6"
          >
            Simple 4-step process
          </motion.div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-4">
            How Back2U <span className="text-primary">Works.</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-lg mx-auto">
            From posting a report to recovering your item — here's exactly what happens at each step.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0a0a0a] rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all"
            >
              {/* Step number watermark */}
              <div
                className="absolute top-4 right-6 text-[80px] font-black leading-none opacity-5 select-none"
                style={{ color: item.color, fontFamily: "'Clash Grotesk', sans-serif" }}
              >
                {item.step}
              </div>

              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  <item.icon size={24} style={{ color: item.color }} />
                </div>

                <div
                  className="inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest mb-4"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  {item.tag}
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-white/40 font-medium leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/report"
            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            Start Now — It's Free <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* ── FEE TABLE ── */}
      <section className="py-24 px-4 bg-[#0a0a0a] rounded-[4rem] mx-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-white mb-4">
              Transparent <span className="text-primary">Pricing.</span>
            </h2>
            <p className="text-white/40 font-medium">
              Contact unlock fees scale with item value. Your first recovery is always free.
            </p>
          </div>

          {/* Free badge */}
          <div className="bg-primary/10 border border-primary/30 rounded-3xl p-6 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-primary font-black uppercase tracking-widest text-sm">First Recovery — Always Free</p>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">No fees on your first successful contact. We want you to experience Back2U risk-free.</p>
            </div>
          </div>

          {/* Fee tiers */}
          <div className="space-y-3">
            {FEES.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-white/5 border ${tier.color} rounded-2xl px-6 py-4 flex items-center justify-between`}
              >
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-tight">{tier.range}</p>
                  <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mt-0.5">{tier.example}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-black text-lg">{tier.fee}</p>
                  <p className="text-white/20 text-[8px] font-bold uppercase tracking-widest">unlock fee</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest text-center mt-6">
            40% of every fee goes directly to the finder as a reward · 60% supports the platform
          </p>
        </div>
      </section>

      {/* ── WHY BACK2U ── */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-4">
            Built for <span className="text-primary">Cameroon.</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-md mx-auto">
            Not a copy-paste of a Western platform. Every feature is designed for Cameroonian realities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIFFERENTIATORS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-all">
                <item.icon size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS MARQUEE ── */}
      <section className="py-24 overflow-hidden bg-slate-50 rounded-[4rem] mx-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black tracking-tighter uppercase">
            Trusted by the <span className="text-primary">Community.</span>
          </h2>
        </div>
        <div className="flex w-full relative">
          <motion.div
            className="flex gap-6 whitespace-nowrap"
            animate={{ x: [0, -1400] }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <div key={i} className="inline-block w-[350px] bg-white p-8 rounded-[2rem] border border-slate-100 group shrink-0">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.stars)].map((_, s) => (
                    <Star key={s} size={14} className="fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-dark font-bold italic text-sm whitespace-normal mb-6">"{review.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-black text-[8px]">{review.name[0]}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{review.name} · {review.location}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VS COMPETITOR ── */}
      <section className="py-32 px-8 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">
            Back2U vs <span className="text-slate-300">The Rest.</span>
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Headers */}
          <div className="col-span-1" />
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 text-center">
            <p className="font-black uppercase tracking-widest text-primary text-sm">Back2U</p>
            <p className="text-[9px] text-primary/60 font-bold uppercase tracking-widest mt-0.5">Cameroon-built</p>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
            <p className="font-black uppercase tracking-widest text-slate-400 text-sm">Others</p>
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">Generic global</p>
          </div>

          {/* Rows */}
          {[
            ["Cameroonian cities",         true,  false],
            ["MTN & Orange Money",         true,  false],
            ["XAF pricing",                true,  false],
            ["Smart matching algorithm",   true,  false],
            ["Guardian reputation system", true,  false],
            ["Privacy sensitivity levels", true,  false],
            ["Free first contact",         true,  false],
            ["Finder reward (40%)",        true,  false],
          ].map(([label, back2u, other], i) => (
            <>
              <div key={`l${i}`} className="flex items-center py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-600">{label as string}</p>
              </div>
              <div key={`b${i}`} className="flex items-center justify-center py-3 border-b border-slate-100">
                {back2u ? <CheckCircle2 size={18} className="text-primary" /> : <X size={18} className="text-slate-200" />}
              </div>
              <div key={`o${i}`} className="flex items-center justify-center py-3 border-b border-slate-100">
                {other ? <CheckCircle2 size={18} className="text-primary" /> : <X size={18} className="text-slate-300" />}
              </div>
            </>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="relative max-w-4xl mx-auto bg-[#0a0a0a] rounded-[3rem] p-12 md:p-16 text-center overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full -ml-24 -mb-24 blur-[60px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              Lost or Found <br /> Something?
            </h2>
            <p className="text-white/40 font-medium max-w-sm mx-auto leading-relaxed">
              Post your first report for free. Our algorithm starts matching immediately.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/report"
                className="bg-primary text-white px-8 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
              >
                Report Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/browse"
                className="bg-white/5 border border-white/10 text-white px-8 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-white/10 transition-all flex items-center gap-3"
              >
                Browse Reports <Search size={16} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-between items-center opacity-20 border-t pt-8">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em]">back2u © 2026</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Made in Cameroon 🇨🇲</p>
        </div>
      </section>
    </main>
  );
}