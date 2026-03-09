//src/components/shared/Footer.tsx
import { ShieldCheck, Heart, MapPin, Twitter, Instagram, Github } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#050505] pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Block */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-clash text-4xl font-black uppercase italic tracking-tighter text-white">
              Securing the <span className="text-primary">Future</span> of Recovery.
            </h3>
            <p className="text-white/30 text-sm max-w-sm font-medium leading-relaxed">
              Cameroon's first premium lost and found network. Built on trust, 
              verified by the community, and powered by the Silver Guardian system.
            </p>
            <div className="flex gap-4">
              {[Twitter, Instagram, Github].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary transition-all cursor-pointer">
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Platform</p>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-widest text-white/60">
              <li><Link href="/browse" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link href="/report" className="hover:text-primary transition-colors">Report Lost</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Guardian Portal</Link></li>
            </ul>
          </div>

          {/* Trust Block */}
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-4">
            <ShieldCheck className="text-secondary" size={32} />
            <p className="text-xs font-black uppercase tracking-widest text-white">Verified Safety</p>
            <p className="text-[10px] text-white/30 font-medium leading-relaxed">
              Every item reported is timestamped and location-verified for maximum security.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:row justify-between items-center pt-10 border-t border-white/5 gap-6">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
            © 2026 BACK2U — MADE IN CAMEROON
          </p>
          <div className="flex gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}