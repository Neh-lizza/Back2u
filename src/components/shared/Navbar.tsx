// src/components/shared/Navbar.tsx
// ♻️ REPLACE
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, PlusCircle, User, LogOut, Loader2, Home, MessageSquare, LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import NotificationBell from "@/components/shared/NotificationBell";

const PILL_STYLE = {
  background: "rgba(0,154,73,0.18)",
  backdropFilter: "blur(12px) saturate(180%) contrast(200%)",
  WebkitBackdropFilter: "blur(12px) saturate(180%) contrast(200%)",
  border: "1px solid rgba(0,154,73,0.35)",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15), inset 2px 2px 5px -2px rgba(255,255,255,0.15), inset -2px -2px 5px 2px rgba(255,255,255,0.08)",
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
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
    { name: "Home",      href: "/",          icon: Home },
    { name: "Browse",    href: "/browse",     icon: Search },
    { name: "Report",    href: "/report",     icon: PlusCircle },
    { name: "Dashboard", href: "/dashboard",  icon: LayoutDashboard },
    { name: "Messages",  href: "/messages",   icon: MessageSquare },
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

  return (
    <>
      {/* ── MOBILE NAVBAR ── logo + hamburger only */}
      <nav className="fixed top-0 w-full z-[100] flex justify-center pt-3 md:hidden">
        <div className="flex items-center justify-between px-4 py-2.5 w-[calc(100%-24px)] rounded-full" style={PILL_STYLE}>
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
      <nav className="fixed top-0 w-full z-[100] hidden md:flex justify-center pt-3">
        <div className="flex items-center gap-1 px-3 py-2 rounded-full" style={{ ...PILL_STYLE, maxWidth: "720px", width: "calc(100% - 48px)" }}>
          {/* Logo */}
          <Link href="/" className="font-clash text-xl font-black tracking-tighter text-white flex items-center gap-0.5 shrink-0 px-3 mr-2">
            back2u<span className="text-primary text-3xl leading-none">.</span>
          </Link>

          {/* Nav items */}
          <div className="flex items-center gap-1 flex-1 justify-center">
            {navItems.map(item => <NavItem key={item.name} item={item} />)}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-1 ml-2">
            {user && <NotificationBell userId={user.id} />}
            {user ? (
              <button onClick={handleLogout} disabled={loggingOut}
                className="flex flex-col items-center px-3 py-2 rounded-full transition-all"
                style={{ color: "rgba(255,255,255,0.5)", minWidth: "52px" }}>
                {loggingOut ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} strokeWidth={1.8} />}
                <span style={{ fontSize: "0.6rem", fontWeight: 700, lineHeight: 1, marginTop: 3, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {loggingOut ? "..." : "Logout"}
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
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-6 md:hidden"
            style={{ background: "rgba(6,18,9,0.97)", backdropFilter: "blur(20px)" }}
          >
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-8 py-4 rounded-2xl w-64 transition-all"
                style={{
                  background: pathname === item.href ? "rgba(0,154,73,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${pathname === item.href ? "rgba(0,154,73,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: pathname === item.href ? "#009A49" : item.href === "/report" ? "#FCD116" : "rgba(255,255,255,0.8)",
                }}>
                <item.icon size={22} />
                <span className="font-black uppercase tracking-widest text-sm">{item.name}</span>
              </Link>
            ))}
            {user ? (
              <button onClick={() => { handleLogout(); setIsOpen(false); }}
                className="flex items-center gap-4 px-8 py-4 rounded-2xl w-64 mt-2"
                style={{ background: "rgba(255,77,77,0.08)", border: "1px solid rgba(255,77,77,0.15)", color: "rgba(255,100,100,0.8)" }}>
                <LogOut size={22} />
                <span className="font-black uppercase tracking-widest text-sm">Logout</span>
              </button>
            ) : (
              <Link href="/auth" onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-8 py-4 rounded-2xl w-64 mt-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                <User size={22} />
                <span className="font-black uppercase tracking-widest text-sm">Login</span>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}