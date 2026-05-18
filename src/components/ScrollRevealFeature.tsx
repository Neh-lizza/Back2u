// src/components/ScrollRevealFeature.tsx
// ♻️ REPLACE
"use client";

import { motion } from "framer-motion";

export default function ScrollRevealFeature() {
  return (
    <section className="relative mx-4 my-6 px-8 md:px-16 py-24 overflow-hidden" style={{ borderRadius: "1.5rem" }}>

      {/* Glassmorphism background */}
      <div
        className="absolute inset-0 rounded-[1.5rem]"
        style={{
          background: "rgba(8, 18, 12, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1.5px dashed rgba(0,154,73,0.55)",
          borderRadius: "1.5rem",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,154,73,0.15) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(252,209,22,0.10) 0%, transparent 70%)" }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">

        {/* Image — slides in from LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full md:w-1/2"
        >
          <div
            className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/5"
            style={{
              background: "rgba(255,255,255,0.04)",
              boxShadow: "7px 7px 0px 0px rgba(0,154,73,0.15)",
            }}
          >
            <img
              src="/screenshots/sample1.jpg"
              alt="Back2U in action"
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            {/* Fallback */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-[1.5rem] bg-primary/20 flex items-center justify-center mb-4">
                <span className="text-4xl font-black text-primary" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                  01
                </span>
              </div>
              <p className="text-white/20 text-[9px] font-black uppercase tracking-widest text-center px-8">
                Add → /public/screenshots/sample1.jpg
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
          </div>
        </motion.div>

        {/* Text — slides in from RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="w-full md:w-1/2 space-y-6"
        >
          <div className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary/15 text-primary">
            Real Stories
          </div>

          <h2
            className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-[0.95]"
            style={{ fontFamily: "'Clash Grotesk', sans-serif" }}
          >
            People Are Finding Each Other Every Day.
          </h2>

          <p className="text-white/40 font-medium leading-relaxed text-sm max-w-md">
            Across Douala, Buea, Yaoundé and beyond — Back2U users are posting
            lost items and finding them within hours. These are real reports
            from real people in your city.
          </p>

          <ul className="space-y-3">
            {[
              "Post a report in under 2 minutes",
              "Algorithm matches instantly on submit",
              "First contact is always free",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-white/60 text-sm font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}