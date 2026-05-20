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

// ── FAQ ACCORDION ─────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-slate-100 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/30 transition-all"
      onClick={() => setOpen(o => !o)}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <p className="font-bold text-slate-800 text-sm pr-4">{q}</p>
        <div className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <span className="text-primary font-black text-lg leading-none">+</span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-6 pb-5 text-slate-400 text-sm font-medium leading-relaxed border-t border-slate-50 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Emilys+Candy&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        h1, h2, h3, .font-clash { font-family: 'Clash Grotesk', sans-serif; }
        .font-caveat { font-family: 'Caveat', cursive; }
        .font-emilys { font-family: 'Emilys Candy', cursive; }
      `}</style>

      {/* ── ONBOARDING MODAL ── */}
      <AnimatePresence>
        {showModal && <OnboardingModal onClose={handleCloseModal} />}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section className="max-w-7xl mx-auto px-8 pt-12 pb-12">
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
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-[-0.01em] text-[#061209]"
            >
              <span className="font-caveat" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                Every lost item has a story.{" "}
              </span>
              <span className="text-primary" style={{ fontFamily: "'Emilys Candy', cursive" }}>
                Back2U writes the ending.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-400 font-medium max-w-md leading-relaxed"
            >
              Because losing something shouldn't mean losing it forever.
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

      {/* ── WHAT IS BACK2U ── */}
      <section className="px-8 pb-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[1.5rem] overflow-hidden px-10 py-12 md:px-16"
          style={{
            background: "#061209",
            border: "1px solid rgba(0,154,73,0.2)",
          }}
        >
          {/* Subtle green glow */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(0,154,73,0.12) 0%, transparent 70%)" }} />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/20 text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-6">
              What is Back2U?
            </div>

            <p className="text-white text-xl md:text-2xl font-medium leading-relaxed mb-6">
              Back2U is Cameroon's first lost & found platform. When you lose something —
              a phone, wallet, ID card, keys — you post a report here.
            </p>

            <p className="text-white/50 text-base font-medium leading-relaxed mb-4">
              If someone found it and posted it too, our system automatically matches you
              based on what the item is, where it was lost, and when. It then opens a
              private chat so you can arrange the return safely — no strangers exchanging
              phone numbers, no social media guesswork.
            </p>

            <p className="text-white/50 text-base font-medium leading-relaxed">
              Finders earn Guardian points and a share of the unlock fee as a reward for
              their honesty. Everyone benefits from a more trustworthy community.
            </p>

            {/* Divider + quick facts */}
            <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
              {[
                { label: "For the person who lost something", desc: "Post a report, get matched, unlock contact, recover your item." },
                { label: "For the person who found something", desc: "Post what you found, wait for a match, earn points and a reward." },
                { label: "For everyone", desc: "A safer, more honest Cameroon where lost things come home." },
              ].map((fact, i) => (
                <div key={i}>
                  <p className="text-primary text-[9px] font-black uppercase tracking-widest mb-2">{fact.label}</p>
                  <p className="text-white/30 text-xs font-medium leading-relaxed">{fact.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── SCROLL REVEAL ── */}
      <ScrollRevealFeature />

      {/* ── COUNTERS ── */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 md:gap-6">
          {[
            { val: 2450,  label: "Items Recovered",  icon: PackageCheck, blob: "#009A49", light: true  },
            { val: 12000, label: "Community Members", icon: Users,        blob: "#FCD116", light: false },
            { val: 10,    label: "Regions Covered",   icon: MapPin,       blob: "#009A49", light: true  },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative flex flex-col justify-center items-center overflow-hidden shadow-lg hover:-translate-y-2 duration-500"
              style={{
                borderRadius: "1rem",
                aspectRatio: "1 / 1",
                maxWidth: "220px",
                width: "100%",
                margin: "0 auto",
                background: item.light ? "#f0faf4" : "#0a0a0a",
              }}
            >
              {/* Blob */}
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute w-40 h-40 md:w-48 md:h-48 blur-md z-10 duration-500 group-hover:blur-none group-hover:scale-110"
                style={{ fill: item.blob + (item.light ? "30" : "40") }}
              >
                <path
                  transform="translate(100 100)"
                  d="M39.5,-49.6C54.8,-43.2,73.2,-36.5,78.2,-24.6C83.2,-12.7,74.8,4.4,69,22.5C63.3,40.6,60.2,59.6,49.1,64.8C38.1,70,19,61.5,0.6,60.7C-17.9,59.9,-35.9,67,-47.2,61.9C-58.6,56.7,-63.4,39.5,-70,22.1C-76.6,4.7,-84.9,-12.8,-81.9,-28.1C-79,-43.3,-64.6,-56.3,-49.1,-62.5C-33.6,-68.8,-16.8,-68.3,-2.3,-65.1C12.1,-61.9,24.2,-55.9,39.5,-49.6Z"
                />
              </svg>

              {/* Content */}
              <div className="relative z-20 flex flex-col items-center gap-1 px-2 text-center">
                <item.icon
                  size={18}
                  className="opacity-60 mb-1"
                  style={{ color: item.light ? "#009A49" : item.blob }}
                />
                <h3
                  className="font-black tracking-tighter italic leading-none"
                  style={{
                    fontSize: "clamp(1.5rem, 5vw, 3rem)",
                    color: item.light ? "#061209" : "white",
                  }}
                >
                  <Counter value={item.val} />+
                </h3>
                <p
                  className="font-bold uppercase tracking-wider leading-tight"
                  style={{
                    fontSize: "clamp(0.45rem, 1.2vw, 0.7rem)",
                    color: item.light ? "#009A49" : item.blob,
                  }}
                >
                  {item.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-4 max-w-7xl mx-auto" id="how-it-works">
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
          {HOW_IT_WORKS.map((item, i) => {
            const isLight = i === 0 || i === 3;
            return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden group transition-all"
              style={{
                borderRadius: "2rem",
                background: isLight ? "#f0faf4" : "#0a0a0a",
                border: isLight ? "1px solid rgba(0,154,73,0.15)" : "1px solid rgba(255,255,255,0.05)",
                padding: "2rem",
              }}
            >
              {/* Step number watermark */}
              <div
                className="absolute top-4 right-6 text-[80px] font-black leading-none select-none"
                style={{
                  color: item.color,
                  fontFamily: "'Clash Grotesk', sans-serif",
                  opacity: isLight ? 0.18 : 0.15,
                }}
              >
                {item.step}
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
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

                  <h3
                    className="text-2xl font-black mb-3"
                    style={{ color: isLight ? "#061209" : "white" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="font-medium leading-relaxed text-sm"
                    style={{ color: isLight ? "rgba(6,18,9,0.5)" : "rgba(255,255,255,0.4)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
            );
          })}
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
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Why people choose <span className="text-primary">Back2U.</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-md mx-auto">
            We built this because losing something in Cameroon used to mean it was gone forever. It doesn't have to be.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              emoji: "📍",
              title: "It's built for where you live",
              desc: "Back2U knows Douala, Yaoundé, Buea, Bamenda and 6 more cities. You're not using a platform designed for London or New York.",
            },
            {
              emoji: "📱",
              title: "Pay the way you already pay",
              desc: "No bank card needed. If you have MTN Mobile Money or Orange Money, you can use Back2U. That's it.",
            },
            {
              emoji: "🔒",
              title: "Your privacy is protected",
              desc: "You never have to share your phone number with a stranger. Everything happens through a private chat until you're both ready.",
            },
            {
              emoji: "⚡",
              title: "You'll know within hours",
              desc: "The moment someone posts something matching your report, you get a notification. No checking back every day — we do the watching for you.",
            },
            {
              emoji: "🤝",
              title: "Honesty is rewarded",
              desc: "Found something? Return it through Back2U and earn points, a reputation badge, and a share of the unlock fee. Good deeds shouldn't go unnoticed.",
            },
            {
              emoji: "🆓",
              title: "Your first recovery is free",
              desc: "We don't charge you to find out if your item has been found. Post for free, get matched for free, and your first contact is completely free.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-8 rounded-3xl border-2 border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group"
            >
              <div className="text-3xl mb-4">{item.emoji}</div>
              <h3 className="text-lg font-bold mb-2 text-slate-800">{item.title}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS MARQUEE ── */}
      <section className="py-24 overflow-hidden bg-slate-50 rounded-[4rem] mx-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black">
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

      {/* ── FAQ ── */}
      <section className="py-20 px-8 max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-black mb-3">
            Common <span className="text-primary">questions.</span>
          </h2>
          <p className="text-slate-400 font-medium">Everything you need to know before getting started.</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Is it free to use?",
              a: "Posting a report is completely free. Your first contact with a match is also free. After that, a small fee (300–5,000 XAF depending on item value) unlocks the private chat. 40% of that fee goes to the finder as a reward.",
            },
            {
              q: "What if I lost something but nobody has posted it yet?",
              a: "Your report stays active for 6 months. The moment someone posts a matching found item, you'll get a notification automatically — even if that's weeks later.",
            },
            {
              q: "Do I have to share my phone number?",
              a: "Never. All communication happens through Back2U's private chat. You only share personal contact details if you choose to, after both parties confirm the recovery.",
            },
            {
              q: "I found something. What should I do?",
              a: "Post a 'Found' report with a photo and location. If the owner is on Back2U, we'll match you. You'll earn 10 Guardian points just for posting, and 40% of the unlock fee when the owner contacts you.",
            },
            {
              q: "How does the matching actually work?",
              a: "When a new report is posted, our system scores it against all active reports using three factors: how similar the descriptions are (keywords), how close the locations are (GPS), and how close the dates are. A score of 60 or above triggers a match notification.",
            },
            {
              q: "What if my item is sensitive — like a passport or bank card?",
              a: "When posting, mark it as 'Sensitive' or 'High Risk'. Sensitive items have their photos blurred publicly. High Risk items are reviewed by our admin team before going live. Your information is protected.",
            },
            {
              q: "How do I pay? I don't have a bank card.",
              a: "No bank card needed at all. Back2U works with MTN Mobile Money and Orange Money — the way most Cameroonians already pay.",
            },
          ].map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="relative max-w-4xl mx-auto bg-[#0a0a0a] rounded-[3rem] p-12 md:p-16 text-center overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full -ml-24 -mb-24 blur-[60px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Lost or found something?
            </h2>
            <p className="text-white/40 font-medium max-w-sm mx-auto leading-relaxed">
              Post for free today. You only pay if we find a match and you want to make contact.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/report"
                className="bg-primary text-white px-8 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
              >
                Post for free — pay only if matched <ArrowRight size={16} />
              </Link>
              <Link
                href="/browse"
                className="bg-white/5 border border-white/10 text-white px-8 py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase hover:bg-white/10 transition-all flex items-center gap-3"
              >
                Browse reports <Search size={16} />
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