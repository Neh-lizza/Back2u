// src/app/auth/reset/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Lock,
  ArrowRight, CheckCircle, AlertCircle, Loader2, KeyRound
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stage = "request" | "sent" | "update" | "done";

export default function ResetPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stage, setStage] = useState<Stage>("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Detect Supabase recovery token in URL hash ──
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setStage("update");
    }
  }, []);

  // ── STEP 1: Send reset email ──
  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setStage("sent");
  };

  // ── STEP 2: Update password after clicking email link ──
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setStage("done");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-white flex overflow-hidden">
      {/* --- FONT IMPORT --- */}
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
      `}</style>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative p-16 flex-col justify-between overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#009A49] rounded-full blur-[120px]"
          />
        </div>

        <Link
          href="/auth"
          className="relative z-10 flex items-center gap-2 text-white/40 hover:text-[#009A49] transition-all font-black uppercase tracking-[0.4em] text-[10px]"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>

        <div className="relative z-10">
          <h1 className="text-white text-8xl font-black leading-[0.85] tracking-tighter uppercase mb-8 font-clash">
            Reset <br /> Your <span className="text-[#009A49]">Access.</span>
          </h1>
          <div className="flex gap-6 items-center">
            <div className="h-[1px] w-12 bg-[#009A49]" />
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
              Cameroon&apos;s #1 Recovery Network
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 max-w-sm">
          <KeyRound size={20} className="text-[#009A49] mb-4" />
          <p className="text-white/80 font-medium mb-3 leading-relaxed text-sm">
            Enter your email and we&apos;ll send you a secure link to reset your password. The link expires in 1 hour.
          </p>
          <p className="text-white/30 font-black text-[10px] uppercase tracking-widest">
            Check spam if you don&apos;t see it
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative">

        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px]"
        >

          {/* ════ STAGE: REQUEST ════ */}
          {stage === "request" && (
            <div className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-12 border border-slate-100">
              <div className="mb-10 text-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase font-clash">
                  Forgot <span className="text-[#009A49]">Password?</span>
                </h2>
                <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">
                  We&apos;ll send a reset link
                </p>
              </div>

              <form onSubmit={handleRequest} className="space-y-4">
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#009A49] transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    placeholder="Your email address"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-[#009A49] focus:outline-none transition-all normal-case"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#061209] text-white py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-[#009A49] hover:text-[#061209] transition-all shadow-xl shadow-[#009A49]/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    <>
                      SEND RESET LINK <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <Link
                  href="/auth"
                  className="text-slate-400 font-black text-[10px] tracking-widest uppercase hover:text-[#009A49] transition-colors"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* ════ STAGE: EMAIL SENT ════ */}
          {stage === "sent" && (
            <div className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-12 border border-slate-100 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-[#009A49]/10 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <Mail size={32} className="text-[#009A49]" />
              </motion.div>

              <h2 className="text-4xl font-black tracking-tighter uppercase font-clash mb-3">
                Check Your <span className="text-[#009A49]">Inbox.</span>
              </h2>
              <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mb-8">
                Reset link sent
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#009A49] flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-[10px]">1</span>
                  </div>
                  <p className="text-slate-600 font-bold text-[10px] tracking-widest uppercase">Open the email from Back2U</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#009A49] flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-[10px]">2</span>
                  </div>
                  <p className="text-slate-600 font-bold text-[10px] tracking-widest uppercase">Click the reset link</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#009A49] flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-[10px]">3</span>
                  </div>
                  <p className="text-slate-600 font-bold text-[10px] tracking-widest uppercase">Set your new password</p>
                </div>
              </div>

              <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase mb-6">
                Didn&apos;t receive it? Check your spam folder.
              </p>

              <button
                onClick={() => { setStage("request"); setError(null); }}
                className="text-[#009A49] font-black text-[10px] tracking-widest uppercase hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          {/* ════ STAGE: UPDATE PASSWORD ════ */}
          {stage === "update" && (
            <div className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-12 border border-slate-100">
              <div className="mb-10 text-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase font-clash">
                  New <span className="text-[#009A49]">Password.</span>
                </h2>
                <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">
                  Choose something strong
                </p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#009A49] transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    placeholder="New password (min 8 chars)"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-[#009A49] focus:outline-none transition-all"
                  />
                </div>

                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#009A49] transition-colors"
                    size={18}
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-[#009A49] focus:outline-none transition-all"
                  />
                </div>

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            password.length >= (i + 1) * 3
                              ? password.length >= 12
                                ? "bg-[#009A49]"
                                : password.length >= 8
                                ? "bg-[#FCD116]"
                                : "bg-red-400"
                              : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">
                      {password.length < 8 ? "Too short" : password.length < 12 ? "Acceptable" : "Strong"}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || stage === "done"}
                  className="w-full bg-[#061209] text-white py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-[#009A49] hover:text-[#061209] transition-all shadow-xl shadow-[#009A49]/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      UPDATING...
                    </>
                  ) : (
                    <>
                      SET NEW PASSWORD <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ════ STAGE: DONE ════ */}
          {stage === "done" && (
            <div className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-12 border border-slate-100 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-[#009A49]/10 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle size={32} className="text-[#009A49]" />
              </motion.div>

              <h2 className="text-4xl font-black tracking-tighter uppercase font-clash mb-3">
                All <span className="text-[#009A49]">Set.</span>
              </h2>
              <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mb-6">
                Password updated successfully
              </p>
              <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                Redirecting to dashboard...
              </p>

              <div className="mt-6">
                <Loader2 size={20} className="animate-spin text-[#009A49] mx-auto" />
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </main>
  );
}