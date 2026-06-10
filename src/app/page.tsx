// src/app/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, ArrowRight, CheckCircle2, Users, PackageCheck,
  Star, MapPin, Shield, Zap, X,
  Lock, Bell, Award, ChevronRight, Eye,
  Smartphone, HeartHandshake, AlertCircle
} from "lucide-react";
import Link from "next/link";
import Counter from "@/components/Counter";
import ScrollRevealFeature from "@/components/ScrollRevealFeature";

const REVIEWS = [
  { name: "Arnaud T.",     location: "Douala",  text: "Found my laptop in 2 days. The safe zone meeting was very professional.", stars: 5 },
  { name: "Marie-Louise",  location: "Yaoundé", text: "Honest community. Someone found my ID card and reported it here.",        stars: 5 },
  { name: "Kevin N.",      location: "Buea",    text: "The interface is so simple to use even for my parents.",                   stars: 4 },
  { name: "Sali H.",       location: "Garoua",  text: "I returned a wallet today. The gratitude tip system is a great touch!",   stars: 5 },
  { name: "Christelle M.", location: "Bamenda", text: "Got a match notification within hours of posting. Incredible.",            stars: 5 },
  { name: "Ibrahim D.",    location: "Maroua",  text: "Reported a found phone, owner confirmed same day. 50 Guardian points!",   stars: 5 },
];

const UploadIcon = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12 3a1 1 0 0 1 .78.375l4 5a1 1 0 1 1-1.56 1.25L13 6.85V14a1 1 0 1 1-2 0V6.85L8.78 9.626a1 1 0 1 1-1.56-1.25l4-5A1 1 0 0 1 12 3ZM9 14v-1H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4v1a3 3 0 1 1-6 0Zm8 2a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H17Z" clipRule="evenodd"/>
  </svg>
);

const BrainIcon = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 24 24">
    <path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185"/>
  </svg>
);

const HOW_IT_WORKS = [
  { step: "01", icon: UploadIcon, color: "#009A49", title: "Post Your Report", description: "Lost something or someone? Fill in our 3-step form, add photos, and pin the location on our Cameroon map. Takes under 2 minutes. First post is always free.", tag: "Free to post" },
  { step: "02", icon: BrainIcon, color: "#FCD116", title: "AI Matches You", description: "Our algorithm instantly scans all active reports and scores them by keyword similarity, GPS proximity, date, and visual image similarity. You get a real-time notification when a match is found.", tag: "Automatic & instant" },
  { step: "03", icon: Eye, color: "#009A49", title: "Contact for Free", description: "With a 300 XAF annual subscription, contact any finder for free all year. Found item reporters never pay anything. Missing persons are always free.", tag: "300 XAF/year" },
  { step: "04", icon: HeartHandshake, color: "#FCD116", title: "Recover & Rate", description: "Confirm the recovery in the chat. Both parties rate each other, earning Guardian points. High-rated users get priority listings and a verified badge.", tag: "Build your reputation" },
];

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: AlertCircle, color: "text-[#CE1126]", bg: "bg-[#CE1126]/10", title: "Lost something?", body: "Post a \"Lost\" report with photos and location. Our algorithm immediately scans all \"Found\" reports for matches.", cta: "I lost something" },
    { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10", title: "Found something?", body: "Post a \"Found\" report. It is completely free. You earn Guardian points for helping the community.", cta: "I found something" },
    { icon: Zap, color: "text-secondary", bg: "bg-secondary/10", title: "How matching works", body: "Every new post triggers our scoring algorithm using keywords, GPS distance, date proximity, and AI image similarity. A match notification fires automatically.", cta: "Got it" },
  ];
  const current = steps[step];
  const Icon = current.icon;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <X size={16} />
        </button>
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-white/10"}`} />)}
        </div>
        <div className={`w-16 h-16 ${current.bg} rounded-[1.5rem] flex items-center justify-center mb-6`}>
          <Icon size={32} className={current.color} />
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{current.title}</h3>
        <p className="text-white/50 font-medium leading-relaxed mb-8 text-sm">{current.body}</p>
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-4 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">Back</button>
          )}
          <button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onClose()}
            className="flex-[2] py-4 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
            {current.cta} <ChevronRight size={14} />
          </button>
        </div>
        {step < steps.length - 1 && (
          <button onClick={onClose} className="w-full mt-4 text-white/20 text-[9px] font-black uppercase tracking-widest hover:text-white/40 transition-colors text-center">Skip intro</button>
        )}
      </motion.div>
    </motion.div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/30 transition-all" onClick={() => setOpen(o => !o)}>
      <div className="flex items-center justify-between px-6 py-5">
        <p className="font-bold text-slate-800 text-[10px] pr-2">{q}</p>
        <div className={`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <span className="text-primary font-black text-lg leading-none">+</span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="px-4 pb-2 text-slate-400 text-[9px] font-medium leading-relaxed border-t border-slate-50 pt-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seen = localStorage.getItem("back2u_onboarded");
    if (!seen) setTimeout(() => setShowModal(true), 1200);
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
        @import url('https://fonts.googleapis.com/css2?family=Emilys+Candy&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        h1, h2, h3, .font-clash { font-family: 'Clash Grotesk', sans-serif; }
        .font-emilys { font-family: 'Emilys Candy', cursive; }
      `}</style>

      <AnimatePresence>{showModal && <OnboardingModal onClose={handleCloseModal} />}</AnimatePresence>

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #e8f5ee 0%, #f0fdf4 35%, #f0fdfa 65%, #ffffff 100%)", paddingBottom: 0 }}>
        {/* blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(0,154,73,0.06)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "rgba(252,209,22,0.07)", transform: "translate(-20%, 30%)" }} />
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="space-y-4">

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="font-black leading-[1.1] tracking-[-0.02em] text-[#061209]"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontFamily: "'Clash Grotesk', sans-serif" }}>
                Every loss has a story.{" "}
                <span className="text-primary" style={{ fontFamily: "'Emilys Candy', cursive" }}>Back2U writes the ending.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-base text-slate-500 font-medium max-w-md leading-relaxed">
                Whether it's a phone, a wallet, or a loved one. We help you find it, fast.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-3">
                <Link href="/report" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all shadow-lg uppercase tracking-wide whitespace-nowrap"
                  style={{ background: "#009A49", boxShadow: "0 8px 24px rgba(0,154,73,0.3)" }}>
                  <Plus size={15} /> Report Item
                </Link>
                <Link href="/browse" className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-white hover:border-primary transition-colors uppercase tracking-wide whitespace-nowrap"
                  style={{ border: "1.5px solid #e2e8f0", color: "#0f172a" }}>
                  <Search size={15} /> Browse
                </Link>
              </motion.div>
              {/* trust row */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="flex items-center gap-4 pt-2">
                <div className="flex">
                  {["A","B","C","D"].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white -ml-2 first:ml-0"
                      style={{ background: i === 0 ? "#009A49" : i === 1 ? "#CE1126" : i === 2 ? "#FCD116" : "#00ADB5", zIndex: 4 - i }}>
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 font-medium"><span className="font-bold text-primary">2,400+</span> items recovered across Cameroon</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                {[
                  { icon: CheckCircle2, text: "First post free" },
                  { icon: CheckCircle2, text: "300 XAF/year" },
                  { icon: CheckCircle2, text: "Missing persons free" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <item.icon size={13} className="text-primary" />
                    <span className="uppercase tracking-widest text-[10px]">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
            {/* right side — float cards illustration */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="relative flex items-center justify-center mt-6 lg:mt-0">
              <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto">
                {/* main card */}
                <div className="rounded-3xl overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg,#e8f5ee,#f0fdfa,#f0fdf4)", height: "200px" }}>
                  <img src="/images/hero-illustration.png" alt="Back2U lost and found illustration" className="w-full h-full object-contain drop-shadow-2xl" />
                </div>
                {/* float card 1 */}
                <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,173,181,0.1)" }}>
                    <CheckCircle2 size={18} style={{ color: "#00ADB5" }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-none">Match found!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Score: 89% · 450m away</p>
                  </div>
                </div>
                {/* float card 2 */}
                <div className="absolute -top-4 -right-6 bg-white rounded-2xl px-4 py-3 text-center"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
                  <p className="text-xl font-black text-primary leading-none">1,240</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Active reports</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "150+", label: "Items Recovered",   bg: "#fce8e8", color: "#ef4444", icon: PackageCheck },
            { value: "227+", label: "Community Members", bg: "#fef0e6", color: "#f97316", icon: Users        },
            { value: "10",   label: "Cities Covered",    bg: "#e8f9ee", color: "#22c55e", icon: MapPin       },
            { value: "78%",  label: "Recovery Rate",     bg: "#f0fdfa", color: "#00ADB5", icon: CheckCircle2 },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-5 flex items-center gap-4" style={{ background: item.bg }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: item.color }}>
                <item.icon size={22} className="text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 leading-none mb-1" style={{ fontSize: "1.6rem", fontFamily: "'Clash Grotesk', sans-serif" }}>{item.value}</p>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT IS BACK2U */}
      <section className="py-10 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — stacked image collage */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative hidden md:block" style={{ height: "400px" }}>
            <div className="absolute left-0 top-0 w-64 h-72 rounded-3xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,#e8f5ee,#f0fdf4)", border: "1px solid #bbf7d0" }}>
              <img src="/images/about-1.jpg" alt="" className="w-full h-full object-cover opacity-80"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <div className="absolute right-0 bottom-6 w-48 h-56 rounded-3xl overflow-hidden shadow-xl"
              style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)", border: "1px solid #fde68a" }}>
              <img src="/images/about-2.jpg" alt="" className="w-full h-full object-cover opacity-80"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-4 top-4 bg-white rounded-2xl px-4 py-3 shadow-lg z-10"
              style={{ border: "1px solid #e2e8f0" }}>
              <p className="text-2xl font-black text-primary leading-none" style={{ fontFamily: "'Clash Grotesk',sans-serif" }}>2,400+</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Items recovered</p>
            </motion.div>
            <div className="absolute left-4 bottom-4 bg-white rounded-xl px-3 py-2 shadow-md z-10 flex items-center gap-2"
              style={{ border: "1px solid #e2e8f0" }}>
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 size={13} className="text-white" />
              </div>
              <p className="text-[10px] font-bold text-slate-700">Free for finders, always</p>
            </div>
          </motion.div>

          {/* RIGHT — storytelling */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-5"
              style={{ background: "#f0fdf4", color: "#009A49", border: "1px solid #bbf7d0" }}>
              What is Back2U?
            </div>
            <h2 className="font-black leading-tight mb-5"
              style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontFamily: "'Clash Grotesk',sans-serif", color: "#222831" }}>
              Every day in Cameroon,<br />thousands of items are lost.<br />
              <span className="text-primary">Most never come back.</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">
              Back2U exists to close that gap. We built a space where the person who finds your phone and the person who lost it can find each other safely — without sharing contacts, without social media chaos, without the anxiety of not knowing.
            </p>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
              Whether it is a wallet dropped on the road, a student ID left in a lecture hall, or a loved one who has gone missing — Back2U is the bridge. One platform. The whole of Cameroon.
            </p>
            <div className="space-y-4 mb-7">
              {[
                { n: "1", title: "For people who lost something", desc: "Post a report, get matched, recover it. Your first report is free." },
                { n: "2", title: "For people who find things", desc: "Post what you found, completely free forever. You earn trust points for honesty." },
                { n: "3", title: "For families of missing persons", desc: "Post for free, no fees ever. Back2U helps surface the right people and information." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="font-black shrink-0 leading-none"
                    style={{ fontSize: "2rem", color: "#009A49", fontFamily: "'Clash Grotesk',sans-serif", opacity: 0.2 }}>
                    {item.n}.
                  </span>
                  <div>
                    <p className="font-bold text-slate-900 text-sm mb-0.5">{item.title}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
              style={{ background: "#009A49" }}>
              Explore Back2U <ArrowRight size={15} />
            </Link>
          </motion.div>

        </div>
      </section>

      <ScrollRevealFeature />

      {/* HOW IT WORKS */}
      <section className="py-12 px-4 max-w-7xl mx-auto" id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-slate-900" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
            How it works
          </h2>
          <p className="text-slate-400 font-medium max-w-md mx-auto text-sm leading-relaxed">
            From posting a report to recovering your item, here is exactly what happens.
          </p>
        </div>

        {/* Desktop — 4 columns with curved dotted arrows */}
        <div className="relative hidden lg:block">
          <svg className="absolute top-0 left-0 w-full pointer-events-none" style={{ height: "170px" }}
            viewBox="0 0 1200 170" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* Arc 1 to 2: curves UP (above illustrations) */}
            <path d="M 240 90 Q 300 35 360 90" stroke="#00ADB5" strokeWidth="2" strokeDasharray="7 5" fill="none" strokeLinecap="round"/>
            <polygon points="354,83 365,92 352,97" fill="#00ADB5" opacity="0.75"/>
            {/* Arc 2 to 3: curves DOWN (below, alternating) */}
            <path d="M 540 90 Q 600 145 660 90" stroke="#00ADB5" strokeWidth="2" strokeDasharray="7 5" fill="none" strokeLinecap="round"/>
            <polygon points="654,83 665,92 652,97" fill="#00ADB5" opacity="0.75"/>
            {/* Arc 3 to 4: curves UP again */}
            <path d="M 840 90 Q 900 35 960 90" stroke="#00ADB5" strokeWidth="2" strokeDasharray="7 5" fill="none" strokeLinecap="round"/>
            <polygon points="954,83 965,92 952,97" fill="#00ADB5" opacity="0.75"/>
          </svg>

          <div className="grid grid-cols-4 gap-0">
            {[
              {
                step: "01", title: "Post your report", delay: 0,
                desc: "Fill the form, add photos, pin the location. First post always free.",
                svg: (
                  <img src="/images/hiw-1.svg" alt="Post report" className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                )
              },
              {
                step: "02", title: "Smart matching", delay: 0.1,
                desc: "Our matching engine scores reports by keywords, GPS distance, category and photo similarity.",
                svg: (
                  <img src="/images/hiw-2.svg" alt="Smart matching" className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                )
              },
              {
                step: "03", title: "Verify and chat", delay: 0.2,
                desc: "Prove ownership through secret questions, then open a private secure chat with the finder.",
                svg: (
                  <img src="/images/hiw-3.svg" alt="Verify and chat" className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                )
              },
              {
                step: "04", title: "Recover and rate", delay: 0.3,
                desc: "Collect your item, rate the experience. Finder earns Guardian points for honesty.",
                svg: (
                  <img src="/images/hiw-4.svg" alt="Recover and rate" className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.style.opacity = "0"; }} />
                )
              }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: item.delay }}
                className="flex flex-col items-center text-center px-4 relative z-10">
                <div className="mb-5" style={{ height: "160px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  {item.svg}
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white mb-3" style={{ background: "#00ADB5" }}>
                  {item.step.replace("0", "")}
                </div>
                <h3 className="font-black text-slate-900 mb-2" style={{ fontSize: "15px", fontFamily: "'Clash Grotesk', sans-serif" }}>{item.title}</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[160px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile — clean 2x2 grid, no arrows */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          {[
            { step: "1", title: "Post your report", desc: "Fill the form, add photos, pin location. First post free.", img: "/images/hiw-1.svg" },
            { step: "2", title: "Smart matching", desc: "Our engine scores by keywords, GPS and photo similarity.", img: "/images/hiw-2.svg" },
            { step: "3", title: "Verify and chat", desc: "Prove ownership, chat securely with the finder.", img: "/images/hiw-3.svg" },
            { step: "4", title: "Recover and rate", desc: "Collect your item. Finder earns Guardian points.", img: "/images/hiw-4.svg" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex flex-col items-center text-center p-4 rounded-2xl"
              style={{ background: "#fff", border: "1px solid #e2e8f0" }}>
              <div className="w-12 h-12 rounded-xl overflow-hidden mb-3 flex items-center justify-center" style={{ background: "#f0fdfa", border: "1px solid #99f6e4" }}>
                <img src={item.img} alt={item.title} className="w-full h-full object-contain p-1.5" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white mb-2" style={{ background: "#00ADB5" }}>{item.step}</div>
              <h3 className="font-black text-slate-900 text-xs mb-1" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{item.title}</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING + WHY BACK2U */}
      <section className="py-1.5 px-3 mx-2">
        <div className="grid md:grid-cols-2 gap-4 items-start">
          <div className="bg-[#0a0a0a] rounded-[1rem] p-2.5">
            <p className="text-white font-black text-[10px] mb-0">Simple <span className="text-primary">Pricing.</span></p>
            <p className="text-white/30 text-[8px] font-medium mb-2">One annual subscription. Unlimited access. No hidden fees.</p>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 mb-2 text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-0">Annual Subscription</p>
              <p className="text-2xl font-black text-white mb-0" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>300</p>
              <p className="text-white/40 text-[8px] font-bold uppercase tracking-widest">XAF per year</p>
            </div>
            <div className="space-y-1">
              {[
                { label: "Post unlimited lost reports", sub: "All year, no limits" },
                { label: "Contact any finder for free",  sub: "No per-chat fees" },
                { label: "Found items always free",      sub: "Forever, no subscription needed" },
                { label: "Missing persons always free",  sub: "Help find loved ones at no cost" },
                { label: "First lost report free",       sub: "Try before you subscribe" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 bg-white/5 border border-white/10 rounded-md px-2 py-1">
                  <CheckCircle2 size={10} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-bold text-[8px] leading-none">{item.label}</p>
                    <p className="text-white/30 text-[7px]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-white/20 text-[7px] font-bold uppercase tracking-widest text-center mt-1">MTN MoMo · Orange Money · No bank card needed</p>
          </div>

          <div className="bg-slate-50 rounded-[1rem] p-2.5">
            <p className="font-black text-slate-900 text-[10px] mb-0">Why people choose <span className="text-primary">Back2U.</span></p>
            <p className="text-slate-400 text-[8px] font-medium mb-2">Built for where you live, not copy-pasted from abroad.</p>
            <div className="relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />
              <div className="space-y-0">
                {[
                  { icon: MapPin,       title: "Built for where you live",    desc: "10 Cameroonian cities." },
                  { icon: Smartphone,   title: "Pay the way you already pay", desc: "MTN MoMo or Orange Money." },
                  { icon: Lock,         title: "Your privacy is protected",   desc: "No phone numbers shared." },
                  { icon: Bell,         title: "Know within hours",           desc: "We notify you instantly." },
                  { icon: Award,        title: "Honesty is rewarded",         desc: "Earn Guardian points and badges." },
                  { icon: CheckCircle2, title: "First report is free",        desc: "Post, match, contact. Free." },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="relative flex items-center gap-2 py-1">
                    <div className="relative z-10 w-5 h-5 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center shrink-0 shadow-sm">
                      <item.icon size={9} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-[9px] leading-none">{item.title}</p>
                      <p className="text-slate-400 text-[7px] font-medium">{item.desc}</p>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m4.5 12.75 6 6 9-13.5"/>
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-4 overflow-hidden bg-slate-50 rounded-[4rem] mx-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-black">Trusted by the <span className="text-primary">Community.</span></h2>
        </div>
        <div className="flex w-full relative">
          <motion.div className="flex gap-4 whitespace-nowrap" animate={{ x: [0, -1200] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}>
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <div key={i} className="inline-block w-[200px] bg-white p-3 rounded-[1rem] border border-slate-100 shrink-0">
                <div className="flex gap-1 mb-2">
                  {[...Array(review.stars)].map((_, s) => <Star key={s} size={11} className="fill-secondary text-secondary" />)}
                </div>
                <p className="text-slate-600 font-medium italic text-[9px] whitespace-normal mb-2 leading-relaxed">&quot;{review.text}&quot;</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-[7px]">{review.name[0]}</span>
                  </div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">{review.name} · {review.location}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-4 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-xl font-black mb-1">Common <span className="text-primary">questions.</span></h2>
          <p className="text-slate-400 text-xs font-medium">Everything you need to know before getting started.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { q: "Is it free to use?", a: "Your first lost report is free. After that, a 300 XAF annual subscription gives you unlimited posts and contacts for 12 months. Found items and missing persons are always free." },
            { q: "What if nobody has posted it yet?", a: "Your report stays active for 6 months. You get notified automatically the moment a match appears, even weeks later." },
            { q: "Do I have to share my phone number?", a: "Never. Everything happens through Back2U private chat until both parties confirm the recovery." },
            { q: "I found something. What should I do?", a: "Post a Found report with a photo and location. It is completely free. You earn 10 Guardian points just for helping and build your reputation in the community." },
            { q: "How does the matching work?", a: "Our system scores reports by keyword similarity, GPS proximity, date, and AI visual image similarity. A high enough score triggers a match notification to both users." },
            { q: "What if my item is sensitive?", a: "Mark it Sensitive or High Risk when posting. Photos blur publicly. High Risk items are reviewed by admin before going live." },
            { q: "How long does a report stay active?", a: "Reports stay active for 6 months then get archived. You get a 7-day warning before it expires so you can repost." },
          ].map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative max-w-lg mx-auto bg-[#0a0a0a] rounded-[1.5rem] p-4 text-center overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-[50px] pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-sm font-black text-white">Lost something or someone?</h2>
            <p className="text-white/40 text-[9px] font-medium max-w-xs mx-auto leading-relaxed">
              First post free. 300 XAF/year for unlimited access. Missing persons always free.
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <Link href="/report" className="bg-primary text-white px-4 py-2 rounded-lg font-black text-[9px] tracking-widest uppercase hover:scale-105 transition-all flex items-center gap-1.5">
                Post free <ArrowRight size={11} />
              </Link>
              <Link href="/browse" className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg font-black text-[9px] tracking-widest uppercase hover:bg-white/10 transition-all flex items-center gap-1.5">
                Browse <Search size={11} />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center opacity-20 border-t pt-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.5em]">back2u 2026</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.5em]">Made in Cameroon</p>
        </div>
      </section>
    </main>
  );
}