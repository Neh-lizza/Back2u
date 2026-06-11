"use client";

// src/components/shared/Footer.tsx
import { ShieldCheck, Heart, MapPin, Twitter, Instagram, Github, Facebook } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-[#050505] pt-10 pb-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand Block */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-clash text-3xl font-black  italic  text-white">
             Lost it? Report it.<span className="text-primary">Found it? Return it.</span>
            </h3>
            <p className="text-white/30 text-sm max-w-sm font-medium leading-relaxed">
              From lost phones and wallets to missing documents and loved ones, Back2U helps communities across Cameroon reconnect what has been separated through trust, technology, and collective action.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <div key={i} className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary transition-all cursor-pointer">
                  <Icon size={16} />
                </div>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Platform</p>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-white/60">
              <li><Link href="/browse" className="hover:text-primary transition-colors">Browse Reports</Link></li>
              <li><Link href="/report" className="hover:text-primary transition-colors">Report Lost Item</Link></li>
              <li><Link href="/report" className="hover:text-primary transition-colors">Report Found Item</Link></li>
              <li><Link href="/browse?type=missing" className="hover:text-primary transition-colors">Missing Persons</Link></li>
           
            </ul>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 pt-2">Contact</p>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-widest text-white/60">
              <li><Link href="#" className="hover:text-primary transition-colors">Support Center</Link></li>
             
            </ul>
          </div>

          {/* Trust Block */}
          <div className="bg-white/5 p-6 rounded-[1.5rem] border border-white/10 space-y-3">
            <ShieldCheck className="text-secondary" size={28} />
            <p className="text-xs font-black uppercase tracking-widest text-white">Trust & Safety</p>
            <ul className="space-y-2 text-[10px] text-white/30 font-medium leading-relaxed">
              {["Verified Reports", "Secure Claim Verification",  "Privacy & Protection"].map(t => (
                <li key={t} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary/40 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-white/5 gap-3">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
            © 2026 Back2U — <span className="italic normal-case">kindness brings it back</span>
          </p>
          <div className="flex gap-6 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
            <Link href="#" className="hover:text-white/40 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/40 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}