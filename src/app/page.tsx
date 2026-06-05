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
  {
    step: "01",
    icon: UploadIcon,
    color: "#009A49",
    title: "Post Your Report",
    description: "Lost something or someone? Fill in our 3-step form, add photos, and pin the location on our Cameroon map. Takes under 2 minutes. First post is always free.",
    tag: "Free to post",
  },
  {
    step: "02",
    icon: BrainIcon,
    color: "#FCD116",
    title: "AI Matches You",
    description: "Our algorithm instantly scans all active reports and scores them by keyword similarity, GPS proximity, date, and visual image similarity. You get a real-time notification when a match is found.",
    tag: "Automatic & instant",
  },
  {
    step: "03",
    icon: Eye,
    color: "#009A49",
    title: "Contact for Free",
    description: "With a 300 XAF annual subscription, contact any finder for free all year. Found item reporters never pay anything. Missing persons are always free.",
    tag: "300 XAF/year",
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

const DIFFERENTIATORS = [
  { icon: MapPin,      title: "Cameroon-First",    desc: "10 cities, all regions. Built for Cameroonian addresses, not foreign postcodes." },
  { icon: Smartphone,  title: "MTN & Orange Money", desc: "Pay your 300 XAF/year via MTN MoMo or Orange Money. No bank card needed." },
  { icon: Shield,      title: "Privacy Controls",   desc: "3 sensitivity levels. Very sensitive items are blurred and reviewed before going live." },
  { icon: Award,       title: "Guardian System",    desc: "Earn Bronze, Silver, Gold status. Build a verified reputation in your city." },
  { icon: Bell,        title: "Smart Matching",     desc: "Keyword + GPS + image AI algorithm. Notified the moment a match scores above threshold." },
  { icon: Lock,        title: "Secure Chat",        desc: "Private encrypted messaging. No phone numbers shared until both parties confirm recovery." },
];

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
      body: "Post a \"Found\" report. It is completely free. You earn Guardian points for helping the community.",
      cta: "I found something",
    },
    {
      icon: Zap,
      color: "text-secondary",
      bg: "bg-secondary/10",
      title: "How matching works",
      body: "Every new post triggers our scoring algorithm using keywords, GPS distance, date proximity, and AI image similarity. A match notification fires automatically.",
      cta: "Got it",
    },
  ];
  const current = steps[step];
  const Icon = current.icon;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors">
          <X size={16} />
        </button>
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-white/10"}`} />
          ))}
        </div>
        <div className={`w-16 h-16 ${current.bg} rounded-[1.5rem] flex items-center justify-center mb-6`}>
          <Icon size={32} className={current.color} />
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter text-white mb-4" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
          {current.title}
        </h3>
        <p className="text-white/50 font-medium leading-relaxed mb-8 text-sm">{current.body}</p>
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-4 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">
              Back
            </button>
          )}
          <button onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onClose()}
            className="flex-[2] py-4 rounded-2xl bg-primary text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
            {current.cta} <ChevronRight size={14} />
          </button>
        </div>
        {step < steps.length - 1 && (
          <button onClick={onClose} className="w-full mt-4 text-white/20 text-[9px] font-black uppercase tracking-widest hover:text-white/40 transition-colors text-center">
            Skip intro
          </button>
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

      <AnimatePresence>
        {showModal && <OnboardingModal onClose={handleCloseModal} />}
      </AnimatePresence>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-3 md:px-5 pt-2 pb-2 relative">
        <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
          <img src="/images/hero-illustration.png" alt="" className="absolute right-0 top-0 h-full w-auto object-contain opacity-10" />
        </div>
        <div className="grid lg:grid-cols-2 gap-4 items-center relative z-10">
          <div className="space-y-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Cameroon&apos;s #1 Recovery Network
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.01em] text-[#061209]">
              Every loss has a story.{" "}
              <span className="text-primary" style={{ fontFamily: "'Emilys Candy', cursive" }}>
                Back2U writes the ending.
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-base text-slate-400 font-medium max-w-md leading-relaxed">
              Whether it&apos;s a phone, a wallet, or a loved one we help bring them back.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3">
              <Link href="/report" className="bg-primary text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-primary/20 uppercase tracking-wider whitespace-nowrap">
                Report Item <Plus size={13} />
              </Link>
              <Link href="/browse" className="bg-white border-2 border-slate-200 px-5 py-3 rounded-xl font-bold text-xs hover:border-primary transition-colors uppercase tracking-wider flex items-center gap-2 whitespace-nowrap">
                Browse <Search size={13} />
              </Link>
              <div className="hidden md:block w-px h-6 bg-slate-200" />
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <UploadIcon size={12} color="#009A49" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Free to post</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">300 XAF/year</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Missing persons free</span>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-center">
            <img src="/images/hero-illustration.png" alt="Back2U lost and found illustration" className="w-full max-w-2xl mx-auto drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* WHAT IS BACK2U */}
      <section className="px-4 md:px-8 pt-1 pb-1 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-[1.5rem] overflow-hidden px-4 py-4 md:px-6 md:py-5"
          style={{ background: "#f8f9fa", border: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="shrink-0 flex items-center justify-center w-16 md:w-28">
              <svg width="420" height="568" viewBox="0 0 420 568" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                <path d="M420 210C420 325.98 325.98 420 210 420C94.0202 420 0 325.98 0 210C0 94.0202 94.0202 0 210 0C325.98 0 420 94.0202 420 210Z" fill="url(#p0)"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M399.91 299.749C366.257 370.833 293.87 420 209.999 420C136.23 420 71.345 381.963 33.8867 324.432C57.2858 313.976 89.8328 305.109 122.499 311C124.597 311.378 126.668 311.754 128.714 312.124C186.191 322.54 224.613 329.503 297.999 301.5C328.754 289.765 366.007 292.119 399.91 299.749Z" fill="url(#p1)"/>
                <path d="M212.499 101.5V86L226.499 75.5C226.666 81.5 227.3 95.1 228.5 101.5C229.7 107.9 233.667 109.5 235.5 109.5C235.333 111.333 233.299 115.4 226.499 117C217.999 119 206.499 113 209.499 109.5C211.899 106.7 212.499 103 212.499 101.5Z" fill="#FDBA8C"/>
                <path d="M147.838 522.71L192.502 218.5H258.502L288.287 522.805C288.402 523.981 287.478 525 286.296 525H241.333C240.297 525 239.432 524.208 239.341 523.175L223.002 337.5L197.241 523.275C197.104 524.264 196.258 525 195.26 525H149.817C148.597 525 147.661 523.917 147.838 522.71Z" fill="#059669"/>
                <path d="M234.5 107.5C221.3 112.7 212.333 109 209.5 106.5C200.333 107.833 178.4 118.4 164 150C149.6 181.6 143 243.167 141.5 270L168 274C170 243.2 180.5 192.5 185.5 171L189.355 220.156C189.437 221.197 190.305 222 191.349 222H260C261.105 222 262 221.105 262 220V166C276 185 303 188 303.5 171C303.9 157.4 278.667 115.333 266 96L247 105.5L249.5 112.5L234.5 107.5Z" fill="#F9FAFB"/>
                <path d="M203.5 46.5C203.5 50.5 207.833 53.5 210 54.5L211.5 61L224 91.5C227.833 89.1667 237.3 81.5 244.5 69.5C251.7 57.5 245.167 50.1667 241 48C241 42.5 232.5 36 223 36C213.5 36 203.5 41.5 203.5 46.5Z" fill="#374151"/>
                <defs>
                  <linearGradient id="p0" x1="210" y1="0" x2="210" y2="420" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1F2A37"/><stop offset="1" stopColor="#1F2A37" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="p1" x1="243.75" y1="414" x2="243.75" y2="138" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#374151" stopOpacity="0"/><stop offset="1" stopColor="#374151"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-5">
                What is Back2U?
              </div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2 leading-tight" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                You lost something or someone. Somewhere out there, someone has answers. We bring you together.
              </h3>
              <p className="text-slate-500 text-xs md:text-xs font-medium leading-relaxed mb-2">
                Back2U is a recovery platform. When you lose something or when a loved one goes missing, you post a report here. Our system automatically matches you and opens a private chat so you can reconnect safely.
              </p>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                No strangers exchanging phone numbers. No social media guesswork. Just a simple, trusted system.
              </p>
              <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                {[
                  { label: "Lost something?",  desc: "Post a report, get matched, recover it." },
                  { label: "Found something?", desc: "Post it, earn Guardian points. Always free." },
                  { label: "Missing person?",  desc: "Post for free. No fees ever." },
                ].map((fact, i) => (
                  <div key={i}>
                    <p className="text-primary text-[9px] font-black uppercase tracking-widest mb-1">{fact.label}</p>
                    <p className="text-slate-400 text-xs font-medium leading-relaxed">{fact.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <ScrollRevealFeature />

      {/* COUNTERS */}
      <section className="py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-3 md:gap-4 justify-items-center">
          {[
            { val: 150,  label: "Cases Resolved",   icon: PackageCheck, blob: "#009A49", light: true  },
            { val: 227,  label: "Community Members", icon: Users,        blob: "#FCD116", light: false },
            { val: 10,   label: "Regions Covered",   icon: MapPin,       blob: "#009A49", light: true  },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative flex flex-col justify-center items-center overflow-hidden shadow-lg hover:-translate-y-2 duration-500"
              style={{ borderRadius: "0.75rem", aspectRatio: "1 / 1", maxWidth: "110px", width: "100%", margin: "0 auto", background: item.light ? "#f0faf4" : "#0a0a0a" }}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                className="absolute w-40 h-40 md:w-48 md:h-48 blur-md z-10 duration-500 group-hover:blur-none group-hover:scale-110"
                style={{ fill: item.blob + (item.light ? "30" : "40") }}>
                <path transform="translate(100 100)" d="M39.5,-49.6C54.8,-43.2,73.2,-36.5,78.2,-24.6C83.2,-12.7,74.8,4.4,69,22.5C63.3,40.6,60.2,59.6,49.1,64.8C38.1,70,19,61.5,0.6,60.7C-17.9,59.9,-35.9,67,-47.2,61.9C-58.6,56.7,-63.4,39.5,-70,22.1C-76.6,4.7,-84.9,-12.8,-81.9,-28.1C-79,-43.3,-64.6,-56.3,-49.1,-62.5C-33.6,-68.8,-16.8,-68.3,-2.3,-65.1C12.1,-61.9,24.2,-55.9,39.5,-49.6Z"/>
              </svg>
              <div className="relative z-20 flex flex-col items-center gap-1 px-2 text-center">
                <item.icon size={13} className="opacity-60 mb-0.5" style={{ color: item.light ? "#009A49" : item.blob }} />
                <h3 className="font-black tracking-tighter italic leading-none" style={{ fontSize: "clamp(1rem, 3.5vw, 1.8rem)", color: item.light ? "#061209" : "white" }}>
                  <Counter value={item.val} />+
                </h3>
                <p className="font-bold uppercase tracking-wider leading-tight" style={{ fontSize: "clamp(0.4rem, 1vw, 0.6rem)", color: item.light ? "#009A49" : item.blob }}>
                  {item.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-2 px-4 max-w-7xl mx-auto" id="how-it-works">
        <div className="text-center mb-6">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
            Simple 4-step process
          </motion.div>
          <h2 className="text-xl md:text-2xl font-black mb-2">
            How Back2U <span className="text-primary" style={{ fontFamily: "'Emilys Candy', cursive" }}>Works.</span>
          </h2>
          <p className="text-slate-400 font-medium max-w-lg mx-auto">
            From posting a report to recovering your item or finding a loved one, here&apos;s exactly what happens at each step.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {HOW_IT_WORKS.map((item, i) => {
            const isLight = i === 0 || i === 3;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden group transition-all"
                style={{ borderRadius: "2rem", background: isLight ? "#f0faf4" : "#0a0a0a", border: isLight ? "1px solid rgba(0,154,73,0.15)" : "1px solid rgba(255,255,255,0.05)", padding: "0.75rem" }}>
                <div className="absolute top-4 right-6 text-[40px] font-black leading-none select-none"
                  style={{ color: item.color, fontFamily: "'Clash Grotesk', sans-serif", opacity: isLight ? 0.18 : 0.15 }}>
                  {item.step}
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                      <item.icon size={18} color={item.color} />
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest mb-4"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                      {item.tag}
                    </div>
                    <h3 className="text-sm font-black mb-1" style={{ color: isLight ? "#061209" : "white" }}>{item.title}</h3>
                    <p className="font-medium leading-relaxed text-xs" style={{ color: isLight ? "rgba(6,18,9,0.5)" : "rgba(255,255,255,0.4)" }}>{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </section>

      {/* PRICING + WHY BACK2U */}
      <section className="py-1.5 px-3 mx-2">
        <div className="grid md:grid-cols-2 gap-6 items-start">

          {/* Subscription pricing */}
          <div className="bg-[#0a0a0a] rounded-[1rem] p-2.5">
            <p className="text-white font-black text-sm mb-0.5">
              Simple <span className="text-primary">Pricing.</span>
            </p>
            <p className="text-white/30 text-[11px] font-medium mb-2">
              One annual subscription. Unlimited access. No hidden fees.
            </p>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 mb-2 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest text-primary mb-0">Annual Subscription</p>
              <p className="text-2xl font-black text-white mb-0" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>300</p>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">XAF per year</p>
            </div>

            <div className="space-y-1">
              {[
                { label: "Post unlimited lost reports",   sub: "All year, no limits" },
                { label: "Contact any finder for free",   sub: "No per-chat fees" },
                { label: "Found items always free",       sub: "Forever, no subscription needed" },
                { label: "Missing persons always free",   sub: "Help find loved ones at no cost" },
                { label: "First lost report free",        sub: "Try before you subscribe" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-1.5 bg-white/5 border border-white/10 rounded-md px-2 py-1">
                  <CheckCircle2 size={10} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-bold text-[11px] leading-none">{item.label}</p>
                    <p className="text-white/30 text-[10px]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest text-center mt-1">
              MTN MoMo · Orange Money · No bank card needed
            </p>
          </div>

          {/* Why Back2U */}
          <div className="bg-slate-50 rounded-[1rem] p-2.5">
            <p className="font-black text-slate-900 text-sm mb-0.5">
              Why people choose <span className="text-primary">Back2U.</span>
            </p>
            <p className="text-slate-400 text-[11px] font-medium mb-2">
              Built for where you live, not copy-pasted from abroad.
            </p>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200" />
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
                      <p className="text-slate-400 text-[10px] font-medium">{item.desc}</p>
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black">Trusted by the <span className="text-primary">Community.</span></h2>
        </div>
        <div className="flex w-full relative">
          <motion.div className="flex gap-6 whitespace-nowrap" animate={{ x: [0, -1400] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}>
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <div key={i} className="inline-block w-[220px] bg-white p-3 rounded-[1rem] border border-slate-100 group shrink-0">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.stars)].map((_, s) => <Star key={s} size={14} className="fill-secondary text-secondary" />)}
                </div>
                <p className="text-dark font-bold italic text-xs whitespace-normal mb-2 text-[10px]">"{review.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-black text-[11px]">{review.name[0]}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{review.name} · {review.location}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-4 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-black mb-1">Common <span className="text-primary">questions.</span></h2>
          <p className="text-slate-400 text-sm font-medium">Everything you need to know before getting started.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { q: "Is it free to use?",
              a: "Your first lost report is free. After that, a 300 XAF annual subscription gives you unlimited posts and contacts for 12 months. Found items and missing persons are always free." },
            { q: "What if nobody has posted it yet?",
              a: "Your report stays active for 6 months. You get notified automatically the moment a match appears, even weeks later." },
            { q: "Do I have to share my phone number?",
              a: "Never. Everything happens through Back2U's private chat until both parties confirm the recovery." },
            { q: "I found something. What should I do?",
              a: "Post a Found report with a photo and location. It is completely free. You earn 10 Guardian points just for helping and build your reputation in the community." },
            { q: "How does the matching work?",
              a: "Our system scores reports by keyword similarity, GPS proximity, date, and AI visual image similarity. A high enough score triggers a match notification to both users." },
            { q: "What if my item is sensitive?",
              a: "Mark it Sensitive or High Risk when posting. Photos blur publicly. High Risk items are reviewed by admin before going live." },
            { q: "How do I pay without a bank card?",
              a: "Back2U works with MTN Mobile Money and Orange Money. No bank card needed." },
            { q: "How long does a report stay active?",
              a: "Reports stay active for 6 months then get archived. You get a 7-day warning before it expires so you can repost." },
          ].map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="relative max-w-lg mx-auto bg-[#0a0a0a] rounded-[1.5rem] p-4 text-center overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-[50px] pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-base font-black text-white">Lost something or someone?</h2>
            <p className="text-white/40 text-[10px] font-medium max-w-xs mx-auto leading-relaxed">
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