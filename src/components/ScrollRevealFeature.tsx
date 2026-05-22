// src/components/ScrollRevealFeature.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const IMAGES = [
  { src: "/screenshots/sample1.jpg", label: "Lost item reported in Buea" },
  { src: "/screenshots/sample2.jpg", label: "Match found in Douala" },
  { src: "/screenshots/sample3.jpg", label: "Item returned in Yaoundé" },
  { src: "/screenshots/sample4.jpg", label: "Guardian points earned" },
  { src: "/screenshots/sample5.jpg", label: "Recovery confirmed" },
];

export default function ScrollRevealFeature() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto-advance every 3.5s
  useEffect(() => {
    const t = setInterval(() => {
      setDirection(1);
      setCurrent(i => (i + 1) % IMAGES.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent(i => (i + dir + IMAGES.length) % IMAGES.length);
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section
      className="relative mx-4 my-6 px-6 md:px-12 py-10 overflow-hidden"
      style={{ borderRadius: "1.5rem" }}
    >
      {/* Glass background */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px dashed rgba(0,154,73,0.55)",
          borderRadius: "1.5rem",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,154,73,0.12) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-40px] right-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(252,209,22,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-14">

        {/* LEFT — Image carousel */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full md:w-1/2 shrink-0"
        >
          <div
            className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              boxShadow: "6px 6px 0px 0px rgba(0,154,73,0.15)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {/* Sliding image */}
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img
                  src={IMAGES[current].src}
                  alt={IMAGES[current].label}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />

                {/* Fallback placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-3">
                    <span className="text-2xl font-black text-primary" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                      {String(current + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-widest text-center px-6">
                    Add → /public/screenshots/sample{current + 1}.jpg
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom gradient + label */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
            <p className="absolute bottom-3 left-4 text-white/50 text-[9px] font-bold uppercase tracking-widest z-10">
              {IMAGES[current].label}
            </p>

            {/* Prev / Next buttons */}
            <button
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all z-10"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black/80 transition-all z-10"
            >
              <ChevronRight size={14} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
              {IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? "14px" : "5px",
                    backgroundColor: i === current ? "#009A49" : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Text */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="w-full md:w-1/2 space-y-4"
        >
          <div className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-secondary/15 text-secondary">
            Real Stories
          </div>

          <h2
            className="text-2xl md:text-3xl font-black text-white leading-tight"
            style={{ fontFamily: "'Clash Grotesk', sans-serif" }}
          >
            Over 200+ people lose valuable items in Cameroon daily.
          </h2>

          <p className="text-white/40 font-medium leading-relaxed text-xs md:text-sm max-w-sm">
            Join thousands already using Back2U to recover what matters most. Post a report, get matched automatically, and reconnect with your belongings through a safe private chat.
          </p>

          <ul className="space-y-2">
            {[
              "Post a report in under 2 minutes",
              "Algorithm matches instantly on submit",
              "First contact is always free",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-white/60 text-xs font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}