// src/components/StickyScrollFeatures.tsx
// 🆕 NEW FILE
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FEATURES = [
  {
    tag: "Real Stories",
    heading: "People Are Finding Each Other Every Day.",
    body: "Across Douala, Buea, Yaoundé and beyond — Back2U users are posting lost items and finding them within hours. These are real reports from real people in your city.",
    img: "/screenshots/sample1.jpg", // replace with your WhatsApp screenshots
    accent: "#009A49",
  },
  {
    tag: "Smart Matching",
    heading: "Our Algorithm Finds the Connection You Can't.",
    body: "The moment you post, our engine scores every active report by keyword overlap, GPS proximity, and date. If it scores 60 or above, both users get a real-time notification.",
    img: "/screenshots/sample2.jpg",
    accent: "#FCD116",
  },
  {
    tag: "Private & Secure",
    heading: "Sensitive Items Stay Hidden Until It's Safe.",
    body: "Passport? Bank card? High-value device? Mark it as Sensitive or High Risk. Images blur automatically and admin approval gates the post before it goes public.",
    img: "/screenshots/sample3.jpg",
    accent: "#009A49",
  },
  {
    tag: "Guardian System",
    heading: "Build a Reputation. Earn Real Rewards.",
    body: "Every verified recovery earns you Guardian points. Reach Gold and your listings get priority placement, a verified badge, and the community's trust — permanently.",
    img: "/screenshots/sample4.jpg",
    accent: "#FCD116",
  },
  {
    tag: "Pay Your Way",
    heading: "No Bank Card? No Problem.",
    body: "Contact unlock fees are paid via MTN Mobile Money or Orange Money — the way Cameroonians actually pay. 300–5,000 XAF based on item value. 40% goes straight to the finder.",
    img: "/screenshots/sample5.jpg",
    accent: "#009A49",
  },
];

export default function StickyScrollFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      featureRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const mid = window.innerHeight / 2;
        if (rect.top < mid && rect.bottom > mid) {
          setActiveIndex(i);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="bg-[#0a0a0a] rounded-[4rem] mx-4 my-6">
      <div className="max-w-7xl mx-auto px-8 py-24">

        {/* Section label */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-6">
            Community in action
          </div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-white">
            See It. <span className="text-primary">Believe It.</span>
          </h2>
        </div>

        {/* Sticky scroll layout */}
        <div className="flex gap-16 lg:gap-24 items-start">

          {/* LEFT — scrolling text */}
          <div className="w-full lg:w-1/2 space-y-0">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                ref={el => { featureRefs.current[i] = el; }}
                className={`py-20 px-6 border-l-2 transition-all duration-500 ${
                  activeIndex === i
                    ? "border-primary opacity-100 pl-8"
                    : "border-white/5 opacity-30"
                }`}
                style={{
                  borderLeftColor: activeIndex === i ? feature.accent : undefined,
                }}
              >
                {/* Tag */}
                <div
                  className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-5"
                  style={{
                    backgroundColor: `${feature.accent}15`,
                    color: feature.accent,
                  }}
                >
                  {feature.tag}
                </div>

                {/* Heading */}
                <h3
                  className="text-3xl font-black uppercase tracking-tight text-white mb-4 leading-tight"
                  style={{ fontFamily: "'Clash Grotesk', sans-serif" }}
                >
                  {feature.heading}
                </h3>

                {/* Body */}
                <p className="text-white/40 font-medium leading-relaxed text-sm max-w-md">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT — sticky image */}
          <div className="hidden lg:flex w-1/2 sticky top-8 h-[85vh] items-center justify-center">
            <div className="w-full h-[540px] rounded-[2.5rem] overflow-hidden relative border border-white/5 bg-white/5">

              {/* Image crossfade */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={FEATURES[activeIndex].img}
                    alt={FEATURES[activeIndex].heading}
                    className="w-full h-full object-cover"
                    onError={e => {
                      // Fallback placeholder if screenshot not found
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />

                  {/* Placeholder shown when image is missing */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                    <div
                      className="w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${FEATURES[activeIndex].accent}20` }}
                    >
                      <span className="text-5xl font-black" style={{ color: FEATURES[activeIndex].accent, fontFamily: "'Clash Grotesk', sans-serif" }}>
                        {String(activeIndex + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest text-center px-8">
                      Add your screenshot here
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

              {/* Progress dots */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {FEATURES.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: activeIndex === i ? "24px" : "6px",
                      backgroundColor: activeIndex === i ? FEATURES[i].accent : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>

              {/* Active label */}
              <div className="absolute top-5 left-5 z-10">
                <div
                  className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md"
                  style={{
                    backgroundColor: `${FEATURES[activeIndex].accent}20`,
                    color: FEATURES[activeIndex].accent,
                    border: `1px solid ${FEATURES[activeIndex].accent}30`,
                  }}
                >
                  {FEATURES[activeIndex].tag}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}