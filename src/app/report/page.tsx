// src/app/report/page.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Package, ArrowRight, ArrowLeft,
  Search, ShieldAlert, EyeOff, CheckCircle2, Heart,
  Upload, X, Loader2, AlertCircle,
  Smartphone, Shirt, Car, CreditCard, Key, Briefcase, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";

// ── ITEM CATEGORIES ──────────────────────────────────────
const CATEGORIES = [
  { id: "electronics",  label: "Electronics",  icon: Smartphone },
  { id: "documents",    label: "Documents",    icon: CreditCard },
  { id: "accessories",  label: "Accessories",  icon: Briefcase },
  { id: "clothing",     label: "Clothing",     icon: Shirt },
  { id: "vehicles",     label: "Vehicles",     icon: Car },
  { id: "keys",         label: "Keys",         icon: Key },
  { id: "other",        label: "Other",        icon: HelpCircle },
];

export default function EnhancedReportPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Photo state
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    type:        "lost",
    title:       "",
    description: "",
    sensitivity: "normal",   // renamed from category to avoid confusion
    itemCategory:"",          // new — electronics, documents etc.
    location:    "",
    anonymous:   false,
    dateOccurred:"",
  });

  // ── PHOTO HANDLER ──
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      alert("Maximum 5 photos allowed.");
      return;
    }
    const newFiles = [...photos, ...files].slice(0, 5);
    setPhotos(newFiles);
    setPhotoPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    setPhotoPreviews(updated.map(f => URL.createObjectURL(f)));
  };

  // ── CONFETTI ──
  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#009A49", "#FCD116", "#ffffff"],
    });
  };

  // ── SUBMIT TO SUPABASE ──
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // 2. Rate limit check — max 3 active reports
      const { count } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active");

      if ((count ?? 0) >= 3) {
        setSubmitError("You already have 3 active reports. Please resolve or remove one before posting a new item.");
        setSubmitting(false);
        return;
      }

      // 3. Get user's city + region for feed filtering
      const { data: profile } = await supabase
        .from("users")
        .select("city, region")
        .eq("id", user.id)
        .single();

      // 4. Upload photos to Supabase Storage
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("item-photos")
          .upload(path, photo, { upsert: false });

        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from("item-photos")
          .getPublicUrl(path);

        photoUrls.push(publicUrl);
      }

      // 5. Insert item into DB
      const { error: insertError } = await supabase
        .from("items")
        .insert({
          user_id:       user.id,
          type:          formData.type as "lost" | "found",
          title:         formData.title,
          description:   formData.description || null,
          category:      formData.itemCategory || null,
          photos:        photoUrls,
          location_name: formData.location || null,
          city:          profile?.city ?? null,
          region:        profile?.region ?? null,
          sensitivity:   formData.sensitivity as "normal" | "sensitive" | "very_sensitive",
          is_anonymous:  formData.anonymous,
          date_occurred: formData.dateOccurred || null,
          // admin_approved defaults to true except very_sensitive
          // expires_at defaults to now() + 6 months
          // matching algorithm triggers automatically via DB trigger
        });

      if (insertError) throw new Error(insertError.message);

      // 6. If very_sensitive → notify admins (insert admin notification)
      if (formData.sensitivity === "very_sensitive") {
        // Get all admin user IDs
        const { data: admins } = await supabase
          .from("users")
          .select("id")
          .eq("role", "admin");

        if (admins && admins.length > 0) {
          await supabase.from("notifications").insert(
            admins.map(admin => ({
              user_id: admin.id,
              type:    "admin_approved" as const,
              title:   "High Risk item pending review",
              body:    `New Very Sensitive item posted: "${formData.title}" — requires approval before going live.`,
              data:    { item_title: formData.title },
            }))
          );
        }
      }

      // 7. Success
      setIsSubmitted(true);
      triggerConfetti();

    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── STEP VALIDATION ──
  const canProceedToStep3 = formData.title.trim().length > 0;

  if (isSubmitted) return <SuccessState sensitivity={formData.sensitivity} />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
      `}</style>

      {/* Progress & Nav — unchanged */}
      <nav className="max-w-4xl mx-auto flex justify-between items-center mb-16">
        <Link href="/" className="text-white/20 hover:text-primary transition-all font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
          <ArrowLeft size={14} /> Back
        </Link>
        <div className="flex gap-3">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 w-12 rounded-full transition-all duration-700 ${step >= s ? "bg-primary shadow-[0_0_15px_#009A49]" : "bg-white/5"}`}
            />
          ))}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">

          {/* ════ STEP 1: CONTEXT — unchanged layout ════ */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="text-center md:text-left">
                <h1 className="text-6xl font-black font-clash uppercase leading-none tracking-tighter mb-4">
                  Report <br /><span className="text-primary">Valuables.</span>
                </h1>
                <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">Step 01 — Context</p>
              </div>

              {/* Lost / Found toggle — unchanged */}
              <div className="grid md:grid-cols-2 gap-6">
                {["lost", "found"].map(t => (
                  <button
                    key={t}
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group ${formData.type === t ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10" : "border-white/5 bg-white/5 hover:border-white/10"}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center ${formData.type === t ? "bg-primary text-black" : "bg-white/10 text-white"}`}>
                      {t === "lost" ? <Search size={24} /> : <CheckCircle2 size={24} />}
                    </div>
                    <p className="font-clash font-black text-2xl uppercase italic">{t === "lost" ? "Lost Item" : "Found Item"}</p>
                    {t === "found" && (
                      <div className="mt-4 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          id="anon"
                          checked={formData.anonymous}
                          onChange={e => setFormData({ ...formData, anonymous: e.target.checked })}
                          className="accent-primary w-4 h-4"
                        />
                        <label htmlFor="anon" className="text-[10px] font-bold uppercase tracking-widest text-white/40 cursor-pointer">
                          Report Anonymously
                        </label>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Privacy level — unchanged */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 text-center">Privacy Level</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "normal",         icon: Package,    label: "Standard" },
                    { id: "sensitive",      icon: ShieldAlert, label: "Sensitive" },
                    { id: "very_sensitive", icon: EyeOff,     label: "High Risk" },
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setFormData({ ...formData, sensitivity: lvl.id })}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.sensitivity === lvl.id ? "border-secondary bg-secondary/5 text-secondary shadow-[0_0_15px_rgba(252,209,22,0.1)]" : "border-white/5 text-white/30"}`}
                    >
                      <lvl.icon size={20} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{lvl.label}</span>
                    </button>
                  ))}
                </div>
                {/* Privacy hint */}
                {formData.sensitivity === "sensitive" && (
                  <p className="text-[9px] text-secondary/60 font-bold uppercase tracking-widest text-center">
                    Image will be blurred — description visible to all
                  </p>
                )}
                {formData.sensitivity === "very_sensitive" && (
                  <p className="text-[9px] text-red-400/60 font-bold uppercase tracking-widest text-center">
                    Post will be reviewed by admin before going live
                  </p>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-primary text-black py-6 rounded-3xl font-black tracking-[0.4em] text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,154,73,0.1)]"
              >
                CONTINUE <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ════ STEP 2: DETAILS ════ */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-5xl font-black font-clash uppercase tracking-tighter mb-8 leading-none">
                The <span className="text-primary">Details.</span>
              </h2>

              <div className="space-y-4">
                {/* Title — unchanged */}
                <input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="TITLE (E.G. IPHONE 15 PRO MAX)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-clash font-black text-xl uppercase tracking-tighter focus:border-primary focus:outline-none transition-all"
                />

                {/* Description — unchanged */}
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="DESCRIPTION / UNIQUE MARKS / SERIAL NUMBERS..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 font-bold text-xs tracking-widest uppercase focus:border-primary focus:outline-none transition-all"
                />

                {/* NEW: Item Category */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Item Category</p>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, itemCategory: cat.id })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${formData.itemCategory === cat.id ? "border-primary bg-primary/5 text-primary" : "border-white/5 text-white/30 hover:border-white/10"}`}
                      >
                        <cat.icon size={18} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* NEW: Date occurred */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 focus-within:border-primary transition-all">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 shrink-0">Date</span>
                  <input
                    type="date"
                    value={formData.dateOccurred}
                    onChange={e => setFormData({ ...formData, dateOccurred: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-transparent w-full focus:outline-none text-xs font-bold uppercase tracking-widest text-white/60 cursor-pointer"
                  />
                </div>

                {/* Photos — real file input with previews */}
                <div
                  className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {photoPreviews.length === 0 ? (
                    <>
                      <Upload className="mx-auto mb-4 text-white/20 group-hover:text-primary transition-colors" size={32} />
                      <p className="font-clash font-black text-lg uppercase italic">Drop Photos Here</p>
                      <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Up to 5 photos • Visual proof speeds up recovery</p>
                    </>
                  ) : (
                    <div className="flex gap-3 flex-wrap justify-center" onClick={e => e.stopPropagation()}>
                      {photoPreviews.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {photoPreviews.length < 5 && (
                        <div
                          className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 hover:border-primary hover:text-primary transition-all cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={20} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Location — unchanged */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4 focus-within:border-primary transition-all">
                  <MapPin className="text-primary shrink-0" size={20} />
                  <input
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="LAST SEEN AT (STREET, QUARTER, TOWN...)"
                    className="bg-transparent w-full focus:outline-none text-xs font-bold uppercase tracking-widest"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-6 rounded-3xl border-2 border-white/5 font-black text-xs tracking-widest hover:bg-white/5 transition-all">
                  BACK
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedToStep3}
                  className="flex-[2] py-6 rounded-3xl bg-primary text-black font-black text-xs tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(0,154,73,0.1)] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  FINAL STEP <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ════ STEP 3: REVIEW — unchanged layout, real submit ════ */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12"
            >
              <div>
                <ShieldAlert size={60} className="mx-auto text-primary mb-6 animate-pulse" />
                <h2 className="text-5xl font-black font-clash uppercase tracking-tighter mb-4">
                  Review <br /> & <span className="text-primary">Submit.</span>
                </h2>
                <p className="text-white/30 text-sm font-medium">By submitting, you agree that all information is truthful.</p>
              </div>

              {/* Review card — added category + location rows */}
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 text-left space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Entry Type</span>
                  <span className="text-primary font-black uppercase tracking-widest text-[10px]">{formData.type} Valuable</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Title</span>
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">{formData.title || "Untitled"}</span>
                </div>
                {formData.itemCategory && (
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Category</span>
                    <span className="text-white font-black uppercase tracking-widest text-[10px]">{formData.itemCategory}</span>
                  </div>
                )}
                {formData.location && (
                  <div className="flex justify-between border-b border-white/5 pb-4">
                    <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Location</span>
                    <span className="text-white font-black uppercase tracking-widest text-[10px] max-w-[60%] text-right">{formData.location}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-white/5 pb-4">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Photos</span>
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">{photos.length} attached</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Privacy</span>
                  <span className="text-secondary font-black uppercase tracking-widest text-[10px]">{formData.sensitivity.replace("_", " ")}</span>
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-left">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">{submitError}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={submitting}
                  className="flex-1 py-6 rounded-3xl border-2 border-white/5 font-black text-xs tracking-widest hover:bg-white/5 transition-all disabled:opacity-40"
                >
                  BACK
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-[2] bg-primary text-black py-6 rounded-[2.5rem] font-black tracking-[0.3em] text-xs shadow-[0_20px_50px_rgba(0,154,73,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      SUBMITTING...
                    </>
                  ) : (
                    "SUBMIT REPORT NOW"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ── SUCCESS STATE — unchanged design ──
function SuccessState({ sensitivity }: { sensitivity: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative mb-12">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center"
        >
          <Heart size={60} className="text-primary fill-primary" />
        </motion.div>
      </div>

      <h1 className="text-6xl font-black font-clash uppercase tracking-tighter text-white mb-4">
        Report <br /> <span className="text-primary">Received!</span>
      </h1>

      {sensitivity === "very_sensitive" ? (
        <p className="text-secondary/70 max-w-sm font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-4">
          Your high-risk report is pending admin review. It will go live once approved.
        </p>
      ) : (
        <p className="text-white/40 max-w-sm font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-4">
          Integrity is the bedrock of our community. Our guardians are now scanning the network for matches.
        </p>
      )}

      <Link
        href="/dashboard"
        className="bg-white text-black px-12 py-5 rounded-2xl font-black tracking-widest text-xs uppercase hover:bg-primary transition-all"
      >
        Go to Dashboard
      </Link>
    </motion.div>
  );
}