// src/components/shared/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, PlusCircle, User, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import NotificationBell from "@/components/shared/NotificationBell";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Scroll handler — unchanged ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Get current session + listen for auth changes ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Logout handler ──
  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoggingOut(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: "Browse", href: "/browse", icon: Search },
    { name: "Dashboard", href: "/dashboard", icon: User },
    { name: "Messages", href: "/chat", icon: Search },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? "py-4" : "py-6"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`glass-card rounded-full px-6 py-3 flex items-center justify-between border border-white/10 shadow-2xl transition-all ${scrolled ? "bg-black/60 backdrop-blur-xl" : "bg-transparent"}`}>

          {/* Logo — unchanged */}
          <Link href="/" className="font-clash text-2xl font-black tracking-tighter text-white flex items-center gap-1">
            back2u<span className="text-primary text-4xl leading-none">.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {/* Notification bell — only when logged in */}
            {user && <NotificationBell userId={user.id} />}

            {/* Report button — unchanged */}
            <Link
              href="/report"
              className="bg-primary text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
            >
              <PlusCircle size={14} /> Report
            </Link>

            {/* Auth: Login or Logout */}
            {user ? (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-red-400 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {loggingOut
                  ? <Loader2 size={14} className="animate-spin" />
                  : <LogOut size={14} />
                }
                {loggingOut ? "..." : "Logout"}
              </button>
            ) : (
              <Link
                href="/auth"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle — unchanged */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — unchanged layout */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[-1] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-4xl font-clash font-black uppercase italic text-white hover:text-primary transition-all"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/report"
              onClick={() => setIsOpen(false)}
              className="mt-4 bg-primary text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest"
            >
              Report Item
            </Link>

            {/* Mobile auth */}
            {user ? (
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="text-white/40 font-black uppercase tracking-widest text-sm flex items-center gap-2 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setIsOpen(false)}
                className="text-white/40 font-black uppercase tracking-widest text-sm hover:text-primary transition-colors"
              >
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}