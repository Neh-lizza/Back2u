// src/components/ScrollRevealFeature.tsx
// ♻️ REPLACE
"use client";
import { useI18n } from "@/lib/i18n";

import { motion } from "framer-motion";
import Link from "next/link";

const SLIDES = [
  { src: "/images/sample1.jpg", num: "01" },
  { src: "/images/sample2.jpg", num: "02" },
  { src: "/images/sample3.jpg", num: "03" },
  { src: "/images/sample4.jpg", num: "04" },
  { src: "/images/sample5.jpg", num: "05" },
];

const CLIP_PATHS = [
  "polygon(0% 0%, 92% 0%, 100% 8%, 100% 100%, 8% 88%, 0% 72%)",
  "polygon(0% 0%, 95% 0%, 100% 5%, 100% 96%, 50% 100%, 0% 96%)",
  "polygon(0% 0%, 100% 0%, 100% 94%, 85% 100%, 50% 96%, 15% 100%, 0% 94%)",
  "polygon(5% 0%, 100% 0%, 100% 96%, 50% 100%, 0% 96%, 0% 5%)",
  "polygon(0% 8%, 8% 0%, 100% 0%, 100% 72%, 92% 88%, 0% 100%)",
];

const HEIGHTS = [230, 245, 268, 245, 230];
const ROTATIONS = [-6, -2, 0, 2, 6];

export default function ScrollRevealFeature() {
  const { t } = useI18n();
  return (
    <section className="relative mt-0 mb-6 overflow-hidden" style={{ background: "#fff" }}>

      {/* Top text — reduced padding */}
      <div className="text-center px-6 pt-6 pb-8">
        <motion.h2
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-black text-slate-900 leading-tight mb-4"
          style={{ fontFamily: "'Clash Grotesk', sans-serif", fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}>
          {t("scrollHeading")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="text-slate-400 font-medium max-w-lg mx-auto mb-7 text-sm leading-relaxed">
With Back2U, recovery is no longer a matter of chance. Join a community dedicated to helping people recover lost items and reconnect missing loved ones.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: 0.15 }}>
          <Link href="/browse"
            className="inline-flex items-center px-7 py-3.5 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-all"
            style={{ background: "#222831" }}>
            Browse reports
          </Link>
        </motion.div>
      </div>

      {/* Fan image row with curved clip-paths */}
      <div className="flex items-end justify-center w-full px-0"
        style={{ height: "280px", gap: "3px" }}>
        {SLIDES.map((slide, i) => {
          const isCenter = i === 2;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.55, ease: "easeOut" }}
              style={{
                flex: isCenter ? "0 0 23%" : "0 0 18.5%",
                height: `${HEIGHTS[i]}px`,
                position: "relative",
                clipPath: CLIP_PATHS[i],
                transform: `rotate(${ROTATIONS[i]}deg)`,
                transformOrigin: "bottom center",
                overflow: "hidden",
              }}>
              <img
                src={slide.src}
                alt=""
                className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {/* Fallback */}
              <div className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)" }}>
                <span className="font-black text-5xl"
                  style={{ color: "#009A49", opacity: 0.12, fontFamily: "'Clash Grotesk',sans-serif" }}>
                  {slide.num}
                </span>
                <p style={{ color: "#94a3b8", fontSize: "8px", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "8px",
                  textAlign: "center", padding: "0 12px" }}>
                  /images{i + 1}.jpg
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}