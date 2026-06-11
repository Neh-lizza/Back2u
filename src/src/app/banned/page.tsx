// src/app/banned/page.tsx
// NEW FILE
"use client";

import { motion } from "framer-motion";
import { ShieldX, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BannedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{
      background: "#061209",
      backgroundImage: "linear-gradient(rgba(0,154,73,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,154,73,0.06) 1px,transparent 1px)",
      backgroundSize: "24px 24px",
    }}>
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
          style={{ background: "rgba(206,17,38,0.15)", border: "1px solid rgba(206,17,38,0.3)" }}
        >
          <ShieldX size={48} style={{ color: "#CE1126" }} />
        </motion.div>

        {/* Heading */}
        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-2"
            style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
            Account Suspended
          </h1>
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            Your Back2U account has been suspended due to activity that violated our community guidelines.
          </p>
        </div>

        {/* What this means */}
        <div className="rounded-2xl p-5 text-left space-y-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#CE1126" }}>
            What this means
          </p>
          {[
            "You cannot post new reports",
            "You cannot open new chats",
            "Your active reports have been hidden",
            "You can still view the browse feed",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
              <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>{item}</p>
            </div>
          ))}
        </div>

        {/* Appeal */}
        <div className="rounded-2xl p-5 text-left"
          style={{ background: "rgba(0,154,73,0.08)", border: "1px solid rgba(0,154,73,0.2)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">
            Think this is a mistake?
          </p>
          <p className="text-xs font-medium mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            If you believe your account was suspended in error, contact our support team and we will review your case within 48 hours.
          </p>
          <a href="mailto:support@back2u.cm"
            className="flex items-center gap-2 text-xs font-black text-primary hover:underline">
            <Mail size={14} /> support@back2u.cm
          </a>
        </div>

        {/* Back link */}
        <Link href="/" className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          <ArrowLeft size={13} /> Back to homepage
        </Link>
      </motion.div>
    </main>
  );
}