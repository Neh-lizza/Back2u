// src/components/shared/Navbar.tsx
//  REPLACE
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, PlusCircle, User, LogOut, Loader2, Home, MessageSquare, LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import NotificationBell from "@/components/shared/NotificationBell";

const PILL_STYLE = {
  background: "#061209",
  borderBottom: "1px solid rgba(0,154,73,0.25)",
  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang } = useI18n();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (_) {
        // Lock conflict - ignore
      }
    };
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoggingOut(false);
    router.push("/");
    router.refresh();
  };

  const navItems = [
    { name: t("home"),      href: "/",          icon: Home },
    { name: t("browse"),    href: "/browse",     icon: Search },
    { name: t("report"),    href: "/report",     icon: PlusCircle },
    { name: t("dashboard"), href: "/dashboard",  icon: LayoutDashboard },
    { name: t("messages"),  href: "/chat",      icon: MessageSquare },
  ];

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    const isReport = item.href === "/report";
    return (
      <Link href={item.href}
        onClick={() => setIsOpen(false)}
        className="flex flex-col items-center px-3 py-2 rounded-full transition-all"
        style={{
          background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
          color: isActive ? "#009A49" : isReport ? "#FCD116" : "rgba(255,255,255,0.75)",
          boxShadow: isActive ? "inset 2px 2px 5px -2px rgba(255,255,255,0.3), inset -2px -1px 5px 0 rgba(255,255,255,0.15)" : "none",
          minWidth: "52px",
        }}
      >
        <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
        <span style={{ fontSize: "0.6rem", fontWeight: 700, lineHeight: 1, marginTop: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {item.name}
        </span>
      </Link>
    );
  };


  const LangToggle = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      onClick={() => setLang(lang === "en" ? "fr" : "en")}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full font-black transition-all"
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.7)",
        fontSize: "0.6rem",
        letterSpacing: "0.08em",
        minWidth: mobile ? "64px" : "52px",
      }}>
      <span style={{ color: lang === "en" ? "#009A49" : "rgba(255,255,255,0.35)", fontWeight: 900 }}>EN</span>
      <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 1px" }}>/</span>
      <span style={{ color: lang === "fr" ? "#009A49" : "rgba(255,255,255,0.35)", fontWeight: 900 }}>FR</span>
    </button>
  );

  return (
    <>
      {/* ── MOBILE NAVBAR ── logo + hamburger only */}
      <nav className="fixed top-0 w-full z-[100] md:hidden">
        <div className="flex items-center justify-between px-5 py-3 w-full" style={PILL_STYLE}>
          <Link href="/" className="font-clash text-xl font-black tracking-tighter text-white flex items-center gap-0.5">
            back2u<span className="text-primary text-3xl leading-none">.</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && <NotificationBell userId={user.id} />}
            <button onClick={() => setIsOpen(!isOpen)} style={{ color: "rgba(255,255,255,0.8)" }}>
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── DESKTOP NAVBAR ── full pill with icons */}
      <nav className="fixed top-0 w-full z-[100] hidden md:flex">
        <div className="flex items-center gap-1 px-6 py-2 w-full" style={PILL_STYLE}>
          {/* Logo */}
          <Link href="/" className="font-clash text-xl font-black tracking-tighter text-white flex items-center gap-0.5 shrink-0 px-3 mr-2">
            back2u<span className="text-primary text-3xl leading-none">.</span>
          </Link>

          {/* Nav items */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            {navItems.map(item => <NavItem key={item.name} item={item} />)}
          </div>

          {/* Lang + Auth */}
          <div className="flex items-center gap-1 ml-2">
            <LangToggle />
            {user && <NotificationBell userId={user.id} />}
            {user ? (
              <button onClick={handleLogout} disabled={loggingOut}
                className="flex flex-col items-center px-3 py-2 rounded-full transition-all"
                style={{ color: "rgba(255,255,255,0.5)", minWidth: "52px" }}>
                {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} strokeWidth={1.8} />}
                <span style={{ fontSize: "0.6rem", fontWeight: 700, lineHeight: 1, marginTop: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {loggingOut ? "..." : t("logout")}
                </span>
              </button>
            ) : (
              <Link href="/auth" className="flex flex-col items-center px-3 py-2 rounded-full transition-all"
                style={{ color: "rgba(255,255,255,0.5)", minWidth: "52px" }}>
                <User size={18} strokeWidth={1.8} />
                <span style={{ fontSize: "0.6rem", fontWeight: 700, lineHeight: 1, marginTop: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE FULL SCREEN MENU ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[98] md:hidden"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsOpen(false)}
            />
            {/* Slide-in panel from right */}
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full z-[99] flex flex-col md:hidden"
              style={{ width: "280px", background: "#0a0a0a", borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="font-black text-lg text-white" style={{ fontFamily: "'Clash Grotesk', sans-serif" }}>
                  back<span style={{ color: "#009A49" }}>2u</span>
                </span>
                <button onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              {/* Nav links */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                {navItems.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: pathname === item.href ? "rgba(0,154,73,0.12)" : "transparent",
                      color: pathname === item.href ? "#009A49" : "rgba(255,255,255,0.6)",
                    }}>
                    <item.icon size={16} />
                    <span className="font-bold text-sm">{item.name}</span>
                  </Link>
                ))}
              </div>
              {/* Bottom: lang toggle + auth */}
              <div className="px-4 py-5 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <LangToggle />
                {user ? (
                  <button onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all"
                    style={{ background: "rgba(206,17,38,0.1)", color: "#CE1126" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    {t("logout")}
                  </button>
                ) : (
                  <Link href="/auth" onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all"
                    style={{ background: "#009A49" }}>
                    {t("login")}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}