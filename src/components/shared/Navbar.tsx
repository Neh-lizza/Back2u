//src/components/shared/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, Search, PlusCircle, User } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Browse", href: "/browse", icon: Search },
    { name: "Dashboard", href: "/dashboard", icon: User },
    { name: "Chat", href: "/chat", icon: Bell },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? "py-4" : "py-6"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`glass-card rounded-full px-6 py-3 flex items-center justify-between border border-white/10 shadow-2xl transition-all ${scrolled ? "bg-black/60 backdrop-blur-xl" : "bg-transparent"}`}>
          
          {/* Logo */}
          <Link href="/" className="font-clash text-2xl font-black tracking-tighter text-white flex items-center gap-1">
            back2u<span className="text-primary text-4xl leading-none">.</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors">
                {link.name}
              </Link>
            ))}
            <Link href="/report" className="bg-primary text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2">
              <PlusCircle size={14} /> Report
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[-1] flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-4xl font-clash font-black uppercase italic text-white hover:text-primary transition-all">
                {link.name}
              </Link>
            ))}
            <Link href="/report" onClick={() => setIsOpen(false)} className="mt-4 bg-primary text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest">
              Report Item
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}