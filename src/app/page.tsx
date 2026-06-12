// src/app/page.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, ArrowRight, CheckCircle2, Users, PackageCheck,
  Star, MapPin, Shield, Zap, X,
  Lock, Bell, Award, ChevronRight, Eye,
  Smartphone, HeartHandshake, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Counter from "@/components/Counter";
import ScrollRevealFeature from "@/components/ScrollRevealFeature";
import { useI18n } from "@/lib/i18n";

const REVIEWS = [
  { name: "Kemugne Angela",   location: "Douala",   text: "Posted  my missing laptop , turns out Olar found it", stars: 5 },
  { name: "Ofor Gloria",      location: "Yaoundé",  text: "Honest community. Someone found my ID card and reported it here.",        stars: 5 },
  { name: "Mbachan Frankfils",location: "Buea",     text: "The interface is so simple to use even for my parents.",                   stars: 4 },
  { name: "Fanta M.",         location: "Bamenda",  text: "Good app, simple explanations", stars: 5 },
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
    <div className="border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/30 transition-all" onClick={() => setOpen(o => !o)}>
      <div className="flex items-center justify-between px-6 py-5">
        <p className="font-bold text-slate-800 text-sm pr-2">{q}</p>
        <div className={`w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>
          <span className="text-primary font-black text-xl leading-none">+</span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="px-6 pb-5 text-slate-500 text-sm font-medium leading-relaxed border-t border-slate-100 pt-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
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

  // Change 3: Explore button checks auth and routes correctly
  const handleExplore = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      router.push("/browse");
    } else {
      router.push("/auth");
    }
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
      <section className="relative overflow-hidden" style={{ paddingBottom: 0 }}>
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 700"
            preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <rect width="1440" height="700" fill="#eaf6f0"/>
            <path d="M1100 -80 C1320 -60, 1500 80, 1480 260 C1460 440, 1280 480, 1120 400 C960 320, 880 160, 960 60 C1020 -20, 1060 -60, 1100 -80 Z"
              fill="url(#blobTR)" opacity="0.75"/>
            <path d="M-120 420 C-40 320, 120 300, 200 380 C280 460, 260 580, 140 640 C20 700, -80 660, -120 580 C-160 500, -140 440, -120 420 Z"
              fill="url(#blobBL)" opacity="0.65"/>
            <path d="M0 620 C240 540, 480 600, 720 560 C960 520, 1200 580, 1440 540 L1440 700 L0 700 Z"
              fill="url(#waveA)" opacity="0.45"/>
            <path d="M0 660 C180 620, 420 650, 660 630 C900 610, 1140 640, 1440 620 L1440 700 L0 700 Z"
              fill="url(#waveB)" opacity="0.35"/>
            <circle cx="720" cy="200" r="90" fill="url(#blobY)" opacity="0.18"/>
            <defs>
              <radialGradient id="blobTR" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00ADB5" stopOpacity="1"/>
                <stop offset="50%" stopColor="#009A49" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#009A49" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="blobBL" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#009A49" stopOpacity="1"/>
                <stop offset="55%" stopColor="#00ADB5" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#00ADB5" stopOpacity="0"/>
              </radialGradient>
              <linearGradient id="waveA" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#009A49" stopOpacity="0.5"/>
                <stop offset="50%" stopColor="#00ADB5" stopOpacity="0.35"/>
                <stop offset="100%" stopColor="#009A49" stopOpacity="0.4"/>
              </linearGradient>
              <linearGradient id="waveB" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ADB5" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#009A49" stopOpacity="0.3"/>
              </linearGradient>
              <radialGradient id="blobY" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FCD116" stopOpacity="1"/>
                <stop offset="100%" stopColor="#FCD116" stopOpacity="0"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-10 py-8 md:py-10" style={{ position: "relative", zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
            <div className="space-y-4">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="font-black leading-[1.1] tracking-[-0.02em] text-[#061209]"
                style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontFamily: "'Clash Grotesk', sans-serif" }}>
                Every loss has a story.{" "}
                <span className="text-primary" style={{ fontFamily: "'Emilys Candy', cursive" }}>Back2U writes the ending.</span>
              </motion.h1>
              <motion.p initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-base text-slate-500 font-medium max-w-md leading-relaxed">
                Whether it's a phone, a wallet, or a loved one. We can help you find it.
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
                <p className="text-sm text-slate-500 font-medium"><span className="font-bold text-primary">250+</span> {t("trustLine")}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                {[
                  { icon: CheckCircle2, text: "First post free" },
                  { icon: CheckCircle2, text: "Missing persons free" },
                  { icon: CheckCircle2, text: "300 XAF/year" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <item.icon size={13} className="text-primary" />
                    <span className="uppercase tracking-widest text-[10px]">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
              className="relative flex items-center justify-center mt-6 lg:mt-0">
              <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto" style={{ transform: `translateY(${scrollY * 0.06}px)`, transition: "transform 0.1s linear" }}>
                <div className="rounded-3xl overflow-hidden flex items-center justify-center" style={{ background: "linear-gradient(135deg,#e8f5ee,#f0fdfa,#f0fdf4)", height: "300px" }}>
                  <img src="/images/hero-illustration.png" alt="Back2U lost and found illustration" className="w-full h-full object-contain drop-shadow-2xl" />
                </div>
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
                <div className="absolute -top-4 -right-6 bg-white rounded-2xl px-4 py-3 text-center"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" }}>
                  <p className="text-xl font-black text-primary leading-none">40</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Active reports</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-5 md:px-10 py-3" style={{ background: "linear-gradient(90deg,#f0fdf4 0%,#f0fdfa 50%,#f0fdf4 100%)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: "250+", label: t("itemsRecovered"),   bg: "#fce8e8", color: "#e03535", icon: PackageCheck },
            { value: "227+", label: t("communityMembers"), bg: "#fef0e6", color: "#e76a10", icon: Users        },
            { value: "10",   label: t("citiesCovered"),    bg: "#e8f9ee", color: "#18b150", icon: MapPin       },
            { value: "78%",  label: t("recoveryRate"),     bg: "#f0fdfa", color: "#0064b5", icon: CheckCircle2 },
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
      {/* Change 1: "What is Back2U?" label moved to right side above the two image cards */}
      <section className="py-8 px-4 md:px-10 max-w-7xl mx-auto" style={{ background: "linear-gradient(160deg, #fff 0%, #f0fdfa 60%, #f0fdf4 100%)" }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT — image collage with placeholder cards */}
          {/* Change 2: two stacked image cards with placeholder areas */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative hidden md:block" style={{ height: "400px" }}>
            {/* Card 1 — placeholder */}
            <div className="absolute left-0 top-0 w-64 h-72 rounded-3xl overflow-hidden"
              style={{ background: "linear-gradient(135deg,#e8f5ee,#f0fdf4)", border: "1.5px dashed #009A49" }}>
              <img src="/images/about-1.jpg" alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,154,73,0.1)", border: "1.5px dashed #009A49" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#009A49" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
                <p style={{ color: "#009A49", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", textAlign: "center" }}>about-1.jpg</p>
              </div>
            </div>

            {/* Card 2 — placeholder for user image */}
            <div className="absolute right-0 bottom-6 w-48 h-56 rounded-3xl overflow-hidden shadow-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)", border: "1px solid #fde68a" }}>
              <img src="/images/about-2.jpg" alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              {/* Placeholder shown when no image */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(252,209,22,0.2)", border: "1.5px dashed #FCD116" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
                <p style={{ color: "#b45309", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
                  Add image
                </p>
              </div>
            </div>

            {/* Floating stat */}
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

          {/* RIGHT — storytelling with label at top */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            {/* Change 1: label is here on the right, above the heading */}
            <div className="inline-block text-[13px] font-bold uppercase tracking-[0.3em] px-3 py-2 rounded-full mb-5"
              style={{ background: "#f0fdf4", color: "#009A49", border: "1px solid #bbf7d0" }}>
              What is Back2U?
            </div>
            <h2 className="font-black leading-tight mb-5"
              style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", fontFamily: "'Clash Grotesk',sans-serif", color: "#222831" }}>
              Over 2000+ items are lost in Cameroon daily.
              <span className="text-primary"> Most never come back.</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">
              Whethr it's taxis, schools, roads or other public spaces. We often assume they were stolen. In many cases, however, the people who find these items simply have no way of returning them to their rightful owners.
            </p>
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
              We built a platform where the person who finds your phone, wallet, document, bag, or any lost item can connect safely with the person who lost it. Beyond lost property, Back2U also supports missing-person searches, helping families and communities share information and work together to locate loved ones who have gone missing. By making it easy to report, search, match, and recover lost items or reconnect missing persons with their families, Back2U fosters trust, community responsibility, and meaningful reunions across Cameroon.
            </p>
            <div className="space-y-4 mb-7">
              {[
                { n: "1", title: t("whatPoint1Title"), desc: t("whatPoint1Desc") },
                { n: "2", title: t("whatPoint2Title"), desc: t("whatPoint2Desc") },
                { n: "3", title: t("whatPoint3Title"), desc: t("whatPoint3Desc") },
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
            {/* Change 3: auth-aware explore button */}
            <button onClick={handleExplore}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
              style={{ background: "#009A49" }}>
              {t("exploreBack2u")} <ArrowRight size={15} />
            </button>
          </motion.div>

        </div>
      </section>

      <ScrollRevealFeature />

      {/* HOW IT WORKS */}
      <section className="pt-12 pb-4 px-4 max-w-7xl mx-auto" id="how-it-works" style={{ background: "linear-gradient(160deg, #ffffff 0%, #f0fdfa 50%, #e8f5ee 100%)" }}>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-slate-900" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
            How it works
          </h2>
          <p className="text-slate-400 font-medium max-w-md mx-auto text-sm leading-relaxed">
            From posting a report to recovering your item, here is exactly what happens.
          </p>
        </div>

        {/* Desktop — 4 columns, dotted lines NO arrows (Change 4) */}
        <div className="relative hidden lg:block">
          <svg className="absolute top-0 left-0 w-full pointer-events-none" style={{ height: "170px" }}
            viewBox="0 0 1200 170" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* Arc 1 to 2: curves UP — no arrowhead */}
            <path d="M 240 90 Q 300 35 360 90" stroke="#00ADB5" strokeWidth="2" strokeDasharray="7 5" fill="none" strokeLinecap="round"/>
            {/* Arc 2 to 3: curves DOWN — no arrowhead */}
            <path d="M 540 90 Q 600 145 660 90" stroke="#00ADB5" strokeWidth="2" strokeDasharray="7 5" fill="none" strokeLinecap="round"/>
            {/* Arc 3 to 4: curves UP — no arrowhead */}
            <path d="M 840 90 Q 900 35 960 90" stroke="#00ADB5" strokeWidth="2" strokeDasharray="7 5" fill="none" strokeLinecap="round"/>
          </svg>

          <div className="grid grid-cols-4 gap-0">
            {[
              { step: "01", title: t("step1Title"), delay: 0, desc: t("step1Desc"), svg: (<img src="/images/hiw-1.svg" alt="Post report" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />) },
              { step: "02", title: t("step2Title"), delay: 0.1, desc: t("step2Desc"), svg: (<img src="/images/hiw-2.svg" alt="Smart matching" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />) },
              { step: "03", title: t("step3Title"), delay: 0.2, desc: t("step3Desc"), svg: (<img src="/images/hiw-3.svg" alt="Verify and chat" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />) },
              { step: "04", title: t("step4Title"), delay: 0.3, desc: t("step4Desc"), svg: (<img src="/images/hiw-4.svg" alt={t("step4Title")} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.opacity = "0"; }} />) },
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

        {/* Mobile — clean 2x2 grid */}
        <div className="lg:hidden grid grid-cols-2 gap-3">
          {[
            { step: "1", title: t("step1Title"), desc: "Fill in a simple form, add photos, and indicate where the item was lost or found.", img: "/images/hiw-1.svg" },
            { step: "2", title: t("step2Title"), desc: "Back2U automatically looks for reports that may match yours.", img: "/images/hiw-2.svg" },
            { step: "3", title: t("step3Title"), desc: "Confirm ownership with a few questions, then securely connect.", img: "/images/hiw-3.svg" },
            { step: "4", title: t("step4Title"), desc: t("step4Desc"), img: "/images/hiw-4.svg" },
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
      <section className="py-8 px-4 max-w-7xl mx-auto" style={{ background: "linear-gradient(135deg, #f0fdfa 0%, #fffbeb 50%, #fafffe 100%)" }}>
        <div className="text-center mb-10">
          <h2 className="font-black text-slate-900 leading-tight mb-2"
            style={{ fontFamily: "'Clash Grotesk', sans-serif", fontSize: "clamp(1.5rem, 2.5vw, 2rem)" }}>
            Simple pricing<span className="text-primary"> to trust us.</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium max-w-md mx-auto">
            One fair price built for all.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-center gap-6">

          {/* PRICING CARD */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="w-full md:w-72 bg-white rounded-2xl overflow-visible relative"
            style={{ paddingTop: "10px", paddingBottom: "24px", boxShadow: "0 6px 30px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", borderBottom: "4px solid #222831" }}>
            <div className="px-7 pt-3 pb-4">
              <h3 className="font-black text-2xl text-slate-900 leading-tight mb-0" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                Annual Pass
                <span className="block text-xs font-normal text-slate-400 mt-0.5">For lost item owners</span>
              </h3>
            </div>
            <div className="relative mx-0 mb-5" style={{ marginLeft: "-1px" }}>
              <div className="flex items-baseline gap-1 px-7 py-2.5 relative"
                style={{ background: "#FCD116", borderRadius: "0 6px 6px 0", width: "calc(100% + 1px)" }}>
                <span className="text-sm font-light text-slate-700 self-start mt-1">XAF</span>
                <span className="font-black text-3xl text-slate-900 leading-none" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>300</span>
                <span className="text-sm font-light text-slate-600">/ year</span>
                <div className="absolute -bottom-5 right-0 w-0 h-0"
                  style={{ borderTop: "12px solid #b45309", borderBottom: "10px solid transparent", borderRight: "12px solid transparent" }} />
              </div>
            </div>
            <div className="px-7 space-y-2.5 mb-6">
              {[t("pricingFeature1"),t("pricingFeature2"),t("pricingFeature3"),t("pricingFeature4"),t("pricingFeature5")].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-primary shrink-0" />
                  <span className="text-sm font-medium text-slate-600">{item}</span>
                </div>
              ))}
            </div>
            <div className="px-7">
              <Link href="/subscribe" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all" style={{ background: "#222831" }}>
                <Zap size={15} /> Get Annual Pass
              </Link>
              <p className="text-center text-[10px] text-slate-300 font-medium mt-2.5 uppercase tracking-widest">MTN MoMo · Orange Money</p>
            </div>
          </motion.div>

          {/* WHY BACK2U CARD */}
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="w-full md:w-72 bg-white rounded-2xl overflow-visible relative"
            style={{ paddingTop: "10px", paddingBottom: "24px", boxShadow: "0 6px 30px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0", borderBottom: "4px solid #009A49", marginBottom: "28px" }}>
            <div className="px-7 pt-3 pb-4">
              <h3 className="font-black text-2xl text-slate-900 leading-tight mb-0" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                Why Back2U
                <span className="block text-xs font-normal text-slate-400 mt-0.5">Built for Cameroon</span>
              </h3>
            </div>
            <div className="relative mx-0 mb-5" style={{ marginLeft: "-1px" }}>
              <div className="flex items-center gap-2 px-7 py-2.5"
                style={{ background: "#00ADB5", borderRadius: "0 6px 6px 0", width: "calc(100% + 1px)" }}>
                <MapPin size={14} className="text-white shrink-0" />
                <span className="font-bold text-white text-sm">Made for where you live</span>
                <div className="absolute -bottom-5 right-0 w-0 h-0"
                  style={{ borderTop: "12px solid #007a80", borderBottom: "10px solid transparent", borderRight: "12px solid transparent" }} />
              </div>
            </div>
            <div className="px-7 space-y-2.5 mb-6">
              {[
                { icon: CheckCircle2, text: t("whyReason1") },
                { icon: Bell,         text: t("whyReason2") },
                { icon: Lock,         text: t("whyReason3") },
                { icon: Smartphone,   text: t("whyReason4") },
                { icon: Award,        text: t("whyReason5") },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "#f0fdfa", border: "1px solid #99f6e4" }}>
                    <item.icon size={12} style={{ color: "#00ADB5" }} />
                  </div>
                  <span className="text-sm font-medium text-slate-600">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="px-7">
              <Link href="/browse" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all" style={{ background: "#009A49" }}>
                <Search size={15} /> Browse reports
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* REVIEWS — Change 5: 4 cards, 2x2 on mobile, smaller, light green tint */}
      <section className="relative py-8 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a2e1a 0%, #222831 40%, #0d2020 70%, #1a2818 100%)" }} />
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,154,73,0.08) 0%, transparent 65%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,173,181,0.07) 0%, transparent 65%)", filter: "blur(40px)" }} />
        <style>{`
          .testi-card { transition: all 0.48s cubic-bezier(0.23, 1, 0.32, 1); }
          .testi-card:hover { box-shadow: 6px 6px 0px #009A49; border-color: #009A49 !important; transform: translate(-6px, -6px); }
        `}</style>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#00ADB5", letterSpacing: "0.2em" }}>Testimonials</p>
            <h2 className="font-black leading-tight" style={{ fontFamily: "'Clash Grotesk', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#FCD116" }}>
              What our community says
            </h2>
          </div>
          {/* 4 cards — 4 cols desktop, 2x2 mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {REVIEWS.map((review, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="testi-card flex flex-col gap-3 p-5 rounded-2xl"
                style={{
                  background: "rgba(0,154,73,0.08)",
                  border: "1px solid rgba(0,154,73,0.2)",
                  backdropFilter: "blur(8px)",
                }}>
                {/* Avatar + name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                    style={{
                      background: i === 0 ? "#009A49" : i === 1 ? "#00ADB5" : i === 2 ? "#FCD116" : "#CE1126",
                      color: i === 2 ? "#222831" : "#fff",
                      fontFamily: "'Clash Grotesk', sans-serif",
                    }}>
                    {review.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-black text-white text-xs leading-none" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>{review.name}</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: "#00ADB5" }}>{review.location}</p>
                  </div>
                </div>
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(review.stars)].map((_, s) => (
                    <Star key={s} size={12} className="fill-secondary text-secondary" />
                  ))}
                </div>
                {/* Text */}
                <p className="text-xs font-medium leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {review.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — Change 6: removed "How long does a report stay active?", increased text sizes */}
      <section className="py-6 px-4 max-w-7xl mx-auto" style={{ background: "linear-gradient(160deg, #fafffe 0%, #f0fdf4 60%, #fffbeb 100%)" }}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black mb-2">Common <span className="text-primary">questions.</span></h2>
          <p className="text-slate-400 text-sm font-medium">Everything you need to know before getting started.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { q: t("faq1q"), a: t("faq1a") },
            { q: t("faq2q"), a: t("faq2a") },
            { q: t("faq3q"), a: t("faq3a") },
            { q: t("faq4q"), a: t("faq4a") },
            { q: t("faq5q"), a: t("faq5a") },
            { q: t("faq6q"), a: t("faq6a") },
          ].map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-6" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #f0fdfa 100%)" }}>
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