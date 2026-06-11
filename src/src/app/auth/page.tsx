// src/app/auth/page.tsx
//  REPLACE
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Lock, User,
  ArrowRight, RefreshCw, Star, MapPin,
  CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

const CAMEROON_CITIES = [
  { city: "Douala",      region: "Littoral" },
  { city: "Yaoundé",    region: "Centre" },
  { city: "Buea",       region: "South West" },
  { city: "Bamenda",    region: "North West" },
  { city: "Garoua",     region: "North" },
  { city: "Maroua",     region: "Far North" },
  { city: "Bafoussam",  region: "West" },
  { city: "Ngaoundéré", region: "Adamawa" },
  { city: "Bertoua",    region: "East" },
  { city: "Ebolowa",    region: "South" },
];

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const [isFlipped, setIsFlipped] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [registerData, setRegisterData] = useState({ fullName: "", email: "", password: "", city: "" });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });
    if (error) {
      if (error.message === "Invalid login credentials") {
        setLoginError("Wrong email or password. Please try again.");
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        setLoginError("Please confirm your email before signing in.");
      } else {
        setLoginError(error.message);
      }
      setLoginLoading(false);
      return;
    }
    setLoginSuccess(true);
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1200);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);
    if (registerData.password.length < 8) {
      setRegisterError("Password must be at least 8 characters.");
      setRegisterLoading(false);
      return;
    }
    if (!registerData.city) {
      setRegisterError("Please select your city.");
      setRegisterLoading(false);
      return;
    }
    const selectedCity = CAMEROON_CITIES.find(c => c.city === registerData.city);
    const { data, error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: { data: { full_name: registerData.fullName } },
    });
    if (error) {
      setRegisterError(error.message.includes("already registered") ? "This email is already registered. Try signing in." : error.message);
      setRegisterLoading(false);
      return;
    }
    if (data.user) {
      await (supabase.from("users") as any).update({ city: selectedCity?.city, region: selectedCity?.region }).eq("id", data.user.id);
    }
    setRegisterSuccess(true);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] lg:bg-white flex overflow-hidden relative">
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* Mobile background image - behind everything on small screens */}
      <div className="absolute inset-0 lg:hidden z-0">
        <img
          src="/images/auth.png"
          alt=""
          className="w-full h-full object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a]/90" />
      </div>

      {/* Mobile top branding */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-10 px-6 pt-5 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-primary transition-all font-black uppercase tracking-[0.4em] text-[9px]">
          <ArrowLeft size={12} /> Home
        </Link>
        <p className="text-primary font-black text-[9px] uppercase tracking-[0.3em]">🇨🇲 Back2U</p>
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative flex-col justify-between overflow-hidden">

        {/* Glow */}
        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"
          />
        </div>

        {/* Image - takes most of the left panel */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/auth.png"
            alt=""
            className="w-full h-full object-cover object-center opacity-60"
          />
          {/* Dark gradient overlay so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        </div>

        {/* Top nav */}
        <div className="relative z-10 p-10">
          <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-primary transition-all font-black uppercase tracking-[0.4em] text-[10px]">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>

        {/* Bottom text */}
        <div className="relative z-10 p-10 space-y-6">
          <div>
            <p className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-3">
              🇨🇲 Cameroon's #1 Recovery Network
            </p>
            <h1 className="text-white text-4xl font-black leading-tight tracking-tight font-clash">
              Good to have you here.
              <br />
              <span className="text-primary">Let's find what's yours.</span>
            </h1>
          </div>

          <p className="text-white/40 text-sm font-medium leading-relaxed max-w-xs">
            Join thousands of Cameroonians who have already recovered lost items through Back2U.
          </p>

          {/* Testimonial */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 max-w-sm">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-primary text-primary" />)}
            </div>
            <p className="text-white/70 font-medium text-xs leading-relaxed italic mb-3">
              "Back2U connected me to the taxi driver who found my bag in less than 24 hours."
            </p>
            <p className="text-white/40 font-black text-[9px] uppercase tracking-widest">Nadine E. - Douala</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: 3D FLIP ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative z-10 lg:bg-slate-50 px-4 md:px-8 py-16 lg:py-8">
        <div className={`relative w-full max-w-[440px] transition-all duration-700 ${isFlipped ? "h-[640px] md:h-[680px]" : "h-[520px] md:h-[580px]"}`}>
          <motion.div
            className="w-full h-full relative preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 25 }}
          >

            {/* ════ FRONT: LOGIN ════ */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-white/90 lg:bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-7 md:p-12 flex flex-col justify-center border border-white/20 lg:border-slate-100">
              <div className="mb-6 md:mb-10 text-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase font-clash">
                  Welcome <span className="text-primary">Back.</span>
                </h2>
                <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Identify yourself</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input type="email" placeholder={t("emailAddress")} required autoCapitalize="none" autoCorrect="off" spellCheck={false}
                    value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-all normal-case" />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input type="password" placeholder={t("password")} required
                    value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-all" />
                </div>

                <div className="flex justify-end">
                  <Link href="/auth/reset" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                    Forgot password?
                  </Link>
                </div>

                {loginError && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} />{loginError}
                  </div>
                )}

                <button type="submit" disabled={loginLoading || loginSuccess}
                  className="w-full bg-[#061209] text-white py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-primary hover:text-[#061209] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                  {loginSuccess ? <><CheckCircle size={16} className="text-primary animate-bounce" />SIGNED IN</>
                    : loginLoading ? <><Loader2 size={16} className="animate-spin" />SIGNING IN...</>
                    : <>SIGN IN <ArrowRight size={16} /></>}
                </button>
              </form>

              <div className="mt-5 md:mt-10 text-center">
                <button onClick={() => { setIsFlipped(true); setLoginError(null); }} className="group flex flex-col items-center gap-2 mx-auto">
                  <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">No account?</span>
                  <span className="text-primary font-black text-[10px] tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                    Create one <RefreshCw size={12} />
                  </span>
                </button>
              </div>
            </div>

            {/* ════ BACK: REGISTER ════ */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-[#061209] rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl p-7 md:p-12 flex flex-col justify-center border border-white/5 rotate-y-180">
              <div className="mb-5 md:mb-8 text-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white font-clash">
                  Start <span className="text-primary">Fresh.</span>
                </h2>
                <p className="text-white/30 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Join the network</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="text" placeholder={t("fullName")} required
                    value={registerData.fullName} onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-all" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="email" placeholder={t("emailAddress")} required autoCapitalize="none" autoCorrect="off" spellCheck={false}
                    value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-all normal-case" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="password" placeholder="Password (min 8 chars)" required
                    value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-all" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                  <select required value={registerData.city} onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white focus:border-primary focus:outline-none transition-all uppercase appearance-none cursor-pointer">
                    <option value="" disabled className="bg-[#061209] text-white/40">YOUR CITY</option>
                    {CAMEROON_CITIES.map((c) => (
                      <option key={c.city} value={c.city} className="bg-[#061209] text-white">
                        {c.city.toUpperCase()} - {c.region.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {registerError && (
                  <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} />{registerError}
                  </div>
                )}

                <button type="submit" disabled={registerLoading || registerSuccess}
                  className="w-full bg-primary text-[#061209] py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-white transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
                  {registerSuccess ? <><CheckCircle size={16} className="animate-bounce" />ACCOUNT CREATED</>
                    : registerLoading ? <><Loader2 size={16} className="animate-spin" />CREATING ACCOUNT...</>
                    : <>REGISTER <ArrowRight size={16} /></>}
                </button>

                {registerSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ border: "1.5px solid rgba(0,154,73,0.3)" }}>
                    {/* Green header */}
                    <div className="px-5 py-5 text-center" style={{ background: "rgba(0,154,73,0.12)" }}>
                      <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                        style={{ background: "#009A49", boxShadow: "0 8px 24px rgba(0,154,73,0.35)" }}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <p className="font-black text-white text-base" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                        Check your email
                      </p>
                      <p className="text-xs font-medium mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Confirmation link sent to
                      </p>
                      <p className="text-sm font-black mt-0.5" style={{ color: "#4ade80" }}>
                        {registerData.email}
                      </p>
                    </div>
                    {/* Body */}
                    <div className="px-5 py-4 space-y-3" style={{ background: "rgba(0,0,0,0.2)" }}>
                      <p className="text-xs font-medium leading-relaxed text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Click the link in the email to activate your account, then come back here to sign in.
                      </p>
                      <div className="space-y-2">
                        {[
                          "Check your spam folder if you do not see it",
                          "The link expires in 24 hours",
                          "After confirming, sign in with your password",
                        ].map((tip, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: "#009A49" }} />
                            <p className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{tip}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => { setIsFlipped(false); setRegisterError(null); }}
                        className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all hover:opacity-80"
                        style={{ background: "#009A49", marginTop: "4px" }}>
                        Go to sign in
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>

              <div className="mt-4 md:mt-6 text-center">
                <button onClick={() => { setIsFlipped(false); setRegisterError(null); }} className="group flex flex-col items-center gap-2 mx-auto">
                  <span className="text-white/30 font-bold text-[10px] tracking-widest uppercase">Already a member?</span>
                  <span className="text-primary font-black text-[10px] tracking-widests uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                    Sign In <RefreshCw size={12} />
                  </span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}