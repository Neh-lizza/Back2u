// src/app/auth/page.tsx
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

// Cameroon cities/regions for the dropdown
const CAMEROON_CITIES = [
  { city: "Douala",    region: "Littoral" },
  { city: "Yaoundé",  region: "Centre" },
  { city: "Buea",     region: "South West" },
  { city: "Bamenda",  region: "North West" },
  { city: "Garoua",   region: "North" },
  { city: "Maroua",   region: "Far North" },
  { city: "Bafoussam",region: "West" },
  { city: "Ngaoundéré", region: "Adamawa" },
  { city: "Bertoua",  region: "East" },
  { city: "Ebolowa",  region: "South" },
];

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isFlipped, setIsFlipped] = useState(false);

  // ── LOGIN STATE ──
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ── REGISTER STATE ──
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    city: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // ── LOGIN HANDLER ──
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
        setLoginError("Please check your inbox and confirm your email before signing in.");
      } else {
        setLoginError(error.message);
      }
      setLoginLoading(false);
      return;
    }

    // Show success tick then redirect
    setLoginSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1200);
  };

  // ── REGISTER HANDLER ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);

    // Basic validation
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

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: registerData.email,
      password: registerData.password,
      options: {
        data: {
          full_name: registerData.fullName,  // picked up by handle_new_user trigger
        },
      },
    });

    if (error) {
      setRegisterError(
        error.message.includes("already registered")
          ? "This email is already registered. Try signing in."
          : error.message
      );
      setRegisterLoading(false);
      return;
    }

    // Update profile with city + region (trigger created the row already)
    if (data.user) {
      await supabase
        .from("users")
        .update({
          city:   selectedCity?.city,
          region: selectedCity?.region,
        })
        .eq("id", data.user.id);
    }

    // Show success tick — don't redirect yet, user needs to confirm email first
    setRegisterSuccess(true);
  };

  return (
    <main className="min-h-screen bg-white flex overflow-hidden">
      {/* --- FONT IMPORT --- */}
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
        .perspective-2000 { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* --- LEFT SIDE: UNCHANGED --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative p-16 flex-col justify-between overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary rounded-full blur-[120px]"
          />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2 text-white/40 hover:text-primary transition-all font-black uppercase tracking-[0.4em] text-[10px]">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="relative z-10">
          <h1 className="text-white text-8xl font-black leading-[0.85] tracking-tighter uppercase mb-8 font-clash">
            Secure <br /> Your <span className="text-primary"> belongings.</span>
          </h1>
          <div className="flex gap-6 items-center">
            <div className="h-[1px] w-12 bg-primary" />
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Cameroon's #1 Recovery Network</p>
          </div>
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 max-w-sm">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} className="fill-primary text-primary" />)}
          </div>
          <p className="text-white/80 font-medium mb-6 leading-relaxed italic text-sm">
            "Leaving my bag in a Douala taxi was a nightmare. Back2U connected me to the driver in less than 24 hours."
          </p>
          <p className="text-white font-black text-xs uppercase tracking-widest">Nadine E. — Douala</p>
        </div>
      </div>

      {/* --- RIGHT SIDE: 3D FLIP --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50 relative perspective-2000">

        {/* ── HEIGHT: 580 login / 680 register (only necessary change) ── */}
        <div className={`relative w-full max-w-[440px] transition-all duration-700 ${isFlipped ? "h-[680px]" : "h-[580px]"}`}>
          <motion.div
            className="w-full h-full relative preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 25 }}
          >

            {/* ════ FRONT: LOGIN ════ */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-12 flex flex-col justify-center border border-slate-100">
              <div className="mb-10 text-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase font-clash">
                  Welcome <span className="text-primary">Back.</span>
                </h2>
                <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Identify yourself</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-all normal-case"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                {/* Error message */}
                {loginError && (
                  <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} />
                    {loginError}
                  </div>
                )}

                {/* Submit button — shows loader → tick */}
                <button
                  type="submit"
                  disabled={loginLoading || loginSuccess}
                  className="w-full bg-dark text-white py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-primary hover:text-dark transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loginSuccess ? (
                    <>
                      <CheckCircle size={16} className="text-primary animate-bounce" />
                      SIGNED IN
                    </>
                  ) : loginLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SIGNING IN...
                    </>
                  ) : (
                    <>
                      SIGN IN <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center">
                <button onClick={() => { setIsFlipped(true); setLoginError(null); }} className="group flex flex-col items-center gap-2 mx-auto">
                  <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">No account?</span>
                  <span className="text-primary font-black text-[10px] tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
                    Create one <RefreshCw size={12} />
                  </span>
                </button>
              </div>
            </div>

            {/* ════ BACK: REGISTER ════ */}
            <div className="absolute inset-0 w-full h-full backface-hidden bg-dark rounded-[3.5rem] shadow-2xl p-12 flex flex-col justify-center border border-white/5 rotate-y-180">
              <div className="mb-8 text-center">
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white font-clash">
                  Start <span className="text-primary">Fresh.</span>
                </h2>
                <p className="text-white/30 font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Join the network</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-all normal-case"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="password"
                    placeholder="Password (min 8 chars)"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white placeholder:text-white/30 focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                {/* City — new field for feed filtering */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={18} />
                  <select
                    required
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 font-black text-[10px] tracking-widest text-white focus:border-primary focus:outline-none transition-all uppercase appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-dark text-white/40">YOUR CITY</option>
                    {CAMEROON_CITIES.map((c) => (
                      <option key={c.city} value={c.city} className="bg-dark text-white">
                        {c.city.toUpperCase()} — {c.region.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error message */}
                {registerError && (
                  <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} />
                    {registerError}
                  </div>
                )}

                {/* Submit button — shows loader → tick */}
                <button
                  type="submit"
                  disabled={registerLoading || registerSuccess}
                  className="w-full bg-primary text-dark py-5 rounded-2xl font-black tracking-[0.2em] text-[10px] hover:bg-white transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {registerSuccess ? (
                    <>
                      <CheckCircle size={16} className="animate-bounce" />
                      ACCOUNT CREATED
                    </>
                  ) : registerLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      CREATING ACCOUNT...
                    </>
                  ) : (
                    <>
                      REGISTER <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Email confirmation notice — only shows after successful register */}
                {registerSuccess && (
                  <div className="flex items-start gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-4">
                    <CheckCircle size={14} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                      Check your inbox — we sent you a confirmation link. Click it then come back to sign in.
                    </p>
                  </div>
                )}
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => { setIsFlipped(false); setRegisterError(null); }} className="group flex flex-col items-center gap-2 mx-auto">
                  <span className="text-white/30 font-bold text-[10px] tracking-widest uppercase">Already a member?</span>
                  <span className="text-primary font-black text-[10px] tracking-widest uppercase flex items-center gap-2 group-hover:gap-4 transition-all">
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