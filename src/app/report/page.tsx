// src/app/report/page.tsx
//  REPLACE
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, ArrowRight, ArrowLeft, Search, ShieldAlert,
  EyeOff, CheckCircle2, Upload, X, Loader2,
  AlertCircle, Smartphone, Shirt, Car, CreditCard,
  Key, Briefcase, HelpCircle, Users, Lock, Package
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = [
  { id: "electronics",  label: "Electronics",  icon: Smartphone, color: "#3B82F6" },
  { id: "documents",    label: "Documents",    icon: CreditCard,  color: "#8B5CF6" },
  { id: "accessories",  label: "Accessories",  icon: Briefcase,   color: "#F59E0B" },
  { id: "clothing",     label: "Clothing",     icon: Shirt,       color: "#EC4899" },
  { id: "vehicles",     label: "Vehicles",     icon: Car,         color: "#EF4444" },
  { id: "keys",         label: "Keys",         icon: Key,         color: "#10B981" },
  { id: "other",        label: "Other",        icon: HelpCircle,  color: "#6B7280" },
];

const SENSITIVITY_LEVELS = [
  { id: "normal",         icon: Package,    label: "Standard",  desc: "Visible to all",        color: "#009A49" },
  { id: "sensitive",      icon: ShieldAlert, label: "Sensitive", desc: "Photo blurred",          color: "#F59E0B" },
  { id: "very_sensitive", icon: EyeOff,     label: "High Risk", desc: "Admin review required",  color: "#EF4444" },
];


export default function ReportPage() {
  const router = useRouter();
  const supabase = createClient();
  const db = supabase as any;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedItemId, setSubmittedItemId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [detectingCategory, setDetectingCategory] = useState(false);
  const [detectedConfidence, setDetectedConfidence] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    type:              "lost",
    title:             "",
    description:       "",
    sensitivity:       "normal",
    itemCategory:      "",
    location:          "",
    anonymous:         false,
    dateOccurred:      "",
    isMissingPerson:   false,
    missingPersonName: "",
    missingPersonAge:  "",
    missingPersonGender: "",
  });

  const update = (key: string, val: any) => setFormData(f => ({ ...f, [key]: val }));

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) { alert("Maximum 5 photos."); return; }
    const newFiles = [...photos, ...files].slice(0, 5);
    setPhotos(newFiles);
    setPhotoPreviews(newFiles.map(f => URL.createObjectURL(f)));

    if (newFiles.length > 0 && !formData.itemCategory) {
      setDetectingCategory(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const file = newFiles[0];
          const ext = file.name.split(".").pop();
          const path = `${user.id}/preview-${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from("item-photos").upload(path, file, { upsert: true });
          if (!uploadErr) {
            const { data: { publicUrl } } = supabase.storage.from("item-photos").getPublicUrl(path);
            const res = await fetch("/api/detect-category", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: publicUrl }),
            });
            const data = await res.json();
            if (data.category && data.category !== "other") {
              update("itemCategory", data.category);
              setDetectedConfidence(data.confidence);
            }
          }
        }
      } catch (_) {}
      setDetectingCategory(false);
    }
  };

  const removePhoto = (i: number) => {
    const updated = photos.filter((_, idx) => idx !== i);
    setPhotos(updated);
    setPhotoPreviews(updated.map(f => URL.createObjectURL(f)));
  };


  const handleSubmit = async () => {
    setSubmitting(true); setSubmitError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth"); return; }

      if (formData.type === "lost" && !formData.isMissingPerson) {
        const { data: canPost } = await db.rpc("can_user_post", { p_user_id: user.id });
        if (!canPost) { router.push("/subscribe?reason=post_limit"); return; }
      }

      const { count } = await db.from("items").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active");
      if ((count ?? 0) >= 3) { setSubmitError("You already have 3 active reports. Resolve one before posting."); setSubmitting(false); return; }

      const { data: profile } = await db.from("users").select("city, region").eq("id", user.id).single();

      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("item-photos").upload(path, photo, { upsert: false });
        if (uploadError) throw new Error(`Photo upload failed: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage.from("item-photos").getPublicUrl(path);
        photoUrls.push(publicUrl);
      }

      const { data: insertedItem, error: insertError } = await db.from("items").insert({
        user_id:              user.id,
        type:                 formData.type as "lost" | "found",
        title:                formData.title,
        description:          formData.description || null,
        category:             formData.itemCategory || null,
        photos:               photoUrls,
        location_name:        formData.location || null,
        city:                 profile?.city ?? null,
        region:               profile?.region ?? null,
        sensitivity:          formData.sensitivity as "normal" | "sensitive" | "very_sensitive",
        is_anonymous:         formData.anonymous,
        date_occurred:        formData.dateOccurred || null,
        is_missing_person:    formData.isMissingPerson,
        missing_person_name:  formData.isMissingPerson ? formData.missingPersonName || null : null,
        missing_person_age:   formData.isMissingPerson && formData.missingPersonAge ? parseInt(formData.missingPersonAge) : null,
        missing_person_gender:formData.isMissingPerson ? formData.missingPersonGender || null : null,
      }).select().single();

      if (insertError) {
        if (insertError.message?.includes("DUPLICATE_REPORT")) throw new Error("You already posted a report with this title in the last 7 days.");
        throw new Error(insertError.message);
      }

      if (formData.sensitivity === "very_sensitive") {
        const { data: admins } = await db.from("users").select("id").eq("role", "admin");
        if (admins?.length > 0) {
          await db.from("notifications").insert(admins.map((admin: any) => ({
            user_id: admin.id, type: "admin_approved",
            title: "High Risk item pending review",
            body: `New Very Sensitive item: "${formData.title}"`,
            data: { item_title: formData.title },
          })));
        }
      }

      if (insertedItem?.id && photos.length > 0) {
        fetch("/api/match-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item_id: insertedItem.id }) }).catch(() => {});
      }

      setSubmittedItemId(insertedItem?.id ?? null);
      setIsSubmitted(true);
        } catch (err: any) {
      setSubmitError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = formData.title.trim().length > 0;

  if (isSubmitted) return <SuccessState sensitivity={formData.sensitivity} itemId={submittedItemId} />;

  return (
    <main className="min-h-screen" style={{ background: "#F0F4F8" }}>
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-grotesk@700,600,400&f[]=satoshi@700,500,400&display=swap');
        body { font-family: 'Satoshi', sans-serif; }
        .font-clash { font-family: 'Clash Grotesk', sans-serif; }
      `}</style>

      {/* Hero banner */}
      <div className="relative overflow-hidden w-full" style={{ background: "#061209", minHeight: "140px" }}>
        {/* Green glow blobs */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: "rgba(0,154,73,0.12)", filter: "blur(40px)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: "rgba(252,209,22,0.07)", filter: "blur(50px)", transform: "translate(20%, 30%)" }} />

        {/* SVG illustration — right side */}
        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 opacity-70 hidden sm:block">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Person silhouette */}
            <circle cx="60" cy="35" r="16" fill="rgba(0,154,73,0.3)" stroke="#009A49" strokeWidth="1.5"/>
            <path d="M30 95 Q60 70 90 95" fill="rgba(0,154,73,0.2)" stroke="#009A49" strokeWidth="1.5"/>
            {/* Location pin */}
            <circle cx="88" cy="28" r="10" fill="rgba(252,209,22,0.15)" stroke="#FCD116" strokeWidth="1.5"/>
            <circle cx="88" cy="28" r="3" fill="#FCD116"/>
            <path d="M88 38 L88 46" stroke="#FCD116" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Floating dots */}
            <circle cx="20" cy="40" r="3" fill="rgba(0,154,73,0.4)"/>
            <circle cx="15" cy="55" r="2" fill="rgba(0,154,73,0.3)"/>
            <circle cx="100" cy="60" r="2.5" fill="rgba(252,209,22,0.4)"/>
            <circle cx="110" cy="45" r="2" fill="rgba(252,209,22,0.3)"/>
            {/* Search circle */}
            <circle cx="35" cy="75" r="12" fill="none" stroke="rgba(0,154,73,0.4)" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M43 83 L50 90" stroke="rgba(0,154,73,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Connection lines */}
            <path d="M44 43 Q66 20 78 28" fill="none" stroke="rgba(0,154,73,0.2)" strokeWidth="1" strokeDasharray="3 3"/>
          </svg>
        </div>

        {/* Text content */}
        <div className="relative z-10 px-5 md:px-8 py-6 max-w-2xl">
          <Link href="/" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}>
            <ArrowLeft size={12} /> Back
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight font-clash mb-1">
            {formData.isMissingPerson ? "Report a " : formData.type === "found" ? "Report " : "Report a "}
            <span style={{ color: formData.isMissingPerson ? "#CE1126" : "#009A49" }}>
              {formData.isMissingPerson ? "Missing Person" : formData.type === "found" ? "Found Item" : "Lost Item"}
            </span>
          </h1>
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            {formData.isMissingPerson ? "Free forever. Help someone find their loved one." : formData.type === "found" ? "Help someone recover what they lost. Always free." : "Post free. Get matched. Recover faster."}
          </p>

          {/* Step indicators inside banner */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all ${
                  step > s ? "bg-primary text-white" : step === s ? "bg-white text-[#061209]" : "text-white/30"
                }`} style={step <= s && step !== s ? { border: "1px solid rgba(255,255,255,0.2)" } : {}}>
                  {step > s ? <CheckCircle2 size={12} /> : s}
                </div>
                {s < 3 && <div className={`w-6 h-px transition-all ${step > s ? "bg-primary" : "bg-white/20"}`} />}
              </div>
            ))}
            <span className="text-[9px] font-bold uppercase tracking-widest ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>
              Step {step} of 3
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        <AnimatePresence mode="wait">

          {/*  STEP 1: TYPE  */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">

              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight font-clash">
                  What are you <span className="text-primary">reporting?</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">Lost something, found something, or reporting a missing person?</p>
              </div>

              {/* Missing person toggle */}
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => update("isMissingPerson", !formData.isMissingPerson)}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left"
                style={{
                  background:   formData.isMissingPerson ? "rgba(206,17,38,0.06)" : "white",
                  borderColor:  formData.isMissingPerson ? "#CE1126" : "#e2e8f0",
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: formData.isMissingPerson ? "rgba(206,17,38,0.1)" : "#f1f5f9" }}>
                    <Users size={18} style={{ color: formData.isMissingPerson ? "#CE1126" : "#94a3b8" }} />
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">Reporting a Missing Person?</p>
                    <p className="text-[10px] text-slate-400 font-medium">Always free  no fees ever for missing persons</p>
                  </div>
                </div>
                <div className="w-11 h-6 rounded-full transition-all flex items-center px-0.5 shrink-0"
                  style={{ background: formData.isMissingPerson ? "#CE1126" : "#e2e8f0" }}>
                  <motion.div animate={{ x: formData.isMissingPerson ? 20 : 0 }}
                    className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </motion.button>

              {/* Missing person fields */}
              <AnimatePresence>
                {formData.isMissingPerson && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#CE1126" }}>Missing Person Details</p>
                      <input type="text" placeholder="Full name of missing person"
                        value={formData.missingPersonName} onChange={e => update("missingPersonName", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-red-400 transition-all" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Age (approx.)"
                          value={formData.missingPersonAge} onChange={e => update("missingPersonAge", e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-red-400 transition-all" />
                        <select value={formData.missingPersonGender} onChange={e => update("missingPersonGender", e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-red-400 transition-all bg-white">
                          <option value="">Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lost / Found */}
              {!formData.isMissingPerson && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "lost",  label: "I Lost Something",  Icon: Search,       desc: "Post a lost report and get matched", color: "#EF4444" },
                    { id: "found", label: "I Found Something", Icon: CheckCircle2, desc: "Help someone recover their item",      color: "#009A49" },
                  ].map(t => (
                    <motion.button key={t.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                      onClick={() => update("type", t.id)}
                      className="relative p-5 rounded-2xl border-2 text-left transition-all overflow-hidden"
                      style={{
                        background:  formData.type === t.id ? `${t.color}08` : "white",
                        borderColor: formData.type === t.id ? t.color : "#e2e8f0",
                        boxShadow:   formData.type === t.id ? `0 8px 24px ${t.color}20` : "0 2px 8px rgba(0,0,0,0.04)",
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                        style={{ background: formData.type === t.id ? `${t.color}15` : "#f1f5f9" }}>
                        <t.Icon size={20} style={{ color: formData.type === t.id ? t.color : "#94a3b8" }} />
                      </div>
                      <p className="font-black text-sm text-slate-900 mb-1">{t.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{t.desc}</p>
                      {formData.type === t.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: t.color }}>
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Found anonymous */}
              {formData.type === "found" && !formData.isMissingPerson && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 p-4">
                  <input type="checkbox" id="anon" checked={formData.anonymous}
                    onChange={e => update("anonymous", e.target.checked)} className="accent-primary w-4 h-4" />
                  <label htmlFor="anon" className="text-sm font-medium text-slate-600 cursor-pointer">
                    Report anonymously <span className="text-slate-400 text-xs">(your name won't be shown)</span>
                  </label>
                </motion.div>
              )}

              {/* Privacy */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Privacy Level</p>
                <div className="grid grid-cols-3 gap-2">
                  {SENSITIVITY_LEVELS.map(lvl => (
                    <button key={lvl.id} onClick={() => update("sensitivity", lvl.id)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: formData.sensitivity === lvl.id ? lvl.color : "#e2e8f0",
                        background:  formData.sensitivity === lvl.id ? `${lvl.color}08` : "transparent",
                      }}>
                      <lvl.icon size={18} style={{ color: formData.sensitivity === lvl.id ? lvl.color : "#94a3b8" }} />
                      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: formData.sensitivity === lvl.id ? lvl.color : "#94a3b8" }}>
                        {lvl.label}
                      </span>
                      <span className="text-[8px] text-slate-400 text-center leading-tight">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 text-white transition-all"
                style={{ background: "#061209", boxShadow: "0 8px 24px rgba(6,18,9,0.2)" }}>
                Continue <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          )}

          {/*  STEP 2: DETAILS  */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">

              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight font-clash">
                  Tell us <span className="text-primary">more.</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">The more detail, the better your chances of a match.</p>
              </div>

              {/* Title */}
              <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
                <input value={formData.title} onChange={e => update("title", e.target.value)}
                  placeholder={formData.isMissingPerson ? "Full name or description..." : "What did you lose or find?"}
                  className="w-full px-4 py-3 text-base font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent" />
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <textarea rows={3} value={formData.description} onChange={e => update("description", e.target.value)}
                  placeholder="Add more details  color, brand, unique marks, serial number..."
                  className="w-full px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none resize-none bg-transparent rounded-2xl" />
              </div>

              {/* Photo upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Photos</p>
                  {detectingCategory && (
                    <div className="flex items-center gap-1.5">
                      <Loader2 size={11} className="animate-spin text-primary" />
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest">AI detecting category...</span>
                    </div>
                  )}
                  {detectedConfidence && !detectingCategory && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                      AI detected  {detectedConfidence}% confidence
                    </span>
                  )}
                </div>

                {photoPreviews.length === 0 ? (
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary transition-all bg-white group">
                    <div className="w-12 h-12 bg-slate-100 group-hover:bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all">
                      <Upload size={22} className="text-slate-300 group-hover:text-primary transition-all" />
                    </div>
                    <p className="font-bold text-sm text-slate-500 mb-1">Upload photos</p>
                    <p className="text-[10px] text-slate-300 font-medium">Up to 5 photos  AI will auto-detect category</p>
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 p-3">
                    <div className="flex gap-2 flex-wrap">
                      {photoPreviews.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-100">
                          <img src={src} className="w-full h-full object-cover" alt="" />
                          <button onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {photoPreviews.length < 5 && (
                        <motion.div whileHover={{ scale: 1.05 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all cursor-pointer">
                          <Upload size={18} />
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              {/* Category — only shown after photo uploaded, pre-selected by AI */}
              {photoPreviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Category</p>
                  {detectedConfidence && !detectingCategory && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                      AI detected · {detectedConfidence}% confidence
                    </span>
                  )}
                  {detectingCategory && (
                    <div className="flex items-center gap-1.5">
                      <Loader2 size={11} className="animate-spin text-primary" />
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest">AI detecting...</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => update("itemCategory", cat.id)}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: formData.itemCategory === cat.id ? cat.color : "#f1f5f9",
                        background:  formData.itemCategory === cat.id ? `${cat.color}10` : "#f8fafc",
                      }}>
                      <cat.icon size={16} style={{ color: formData.itemCategory === cat.id ? cat.color : "#94a3b8" }} />
                      <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: formData.itemCategory === cat.id ? cat.color : "#94a3b8" }}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              )} {/* end category conditional */}

              {/* Location + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                  <MapPin size={16} className="text-primary shrink-0" />
                  <input value={formData.location} onChange={e => update("location", e.target.value)}
                    placeholder="Location (area, quarter...)"
                    className="bg-transparent flex-1 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none" />
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                  <MapPin size={14} className="text-slate-300 shrink-0" />
                  <input type="date" value={formData.dateOccurred} onChange={e => update("dateOccurred", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-transparent flex-1 text-xs font-medium text-slate-500 focus:outline-none cursor-pointer" />
                </div>
              </div>



              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-200 font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">
                  Back
                </button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(3)} disabled={!canProceed}
                  className="flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 text-white transition-all disabled:opacity-40"
                  style={{ background: "#061209" }}>
                  Review <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/*  STEP 3: REVIEW  */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">

              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight font-clash">
                  Ready to <span className="text-primary">submit?</span>
                </h1>
                <p className="text-slate-500 text-sm mt-1 font-medium">Review your report before it goes live.</p>
              </div>

              {/* Preview card */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {photoPreviews[0] && (
                  <div className="relative h-40 overflow-hidden">
                    <img src={photoPreviews[0]} className={`w-full h-full object-cover ${formData.sensitivity !== "normal" ? "blur-lg" : ""}`} alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-white"
                        style={{ background: formData.type === "found" ? "#009A49" : formData.isMissingPerson ? "#CE1126" : "#EF4444" }}>
                        {formData.isMissingPerson ? "Missing Person" : formData.type === "lost" ? "Lost" : "Found"}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-4 space-y-2">
                  {[
                    { label: "Title",       value: formData.title },
                    { label: "Category",    value: formData.itemCategory },
                    { label: "Location",    value: formData.location },
                    { label: "Date",        value: formData.dateOccurred },
                    { label: "Privacy",     value: formData.sensitivity.replace("_", " ") },
                    { label: "Photos",      value: `${photos.length} attached` },
                  ].filter(Boolean).map((row: any, i) => row.value && (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{row.label}</span>
                      <span className="text-xs font-bold text-slate-900 capitalize">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-500 text-xs font-bold">{submitError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} disabled={submitting}
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-200 font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all disabled:opacity-40">
                  Back
                </button>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit} disabled={submitting}
                  className="flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 text-white transition-all disabled:opacity-60"
                  style={{ background: "#009A49", boxShadow: "0 8px 24px rgba(0,154,73,0.3)" }}>
                  {submitting
                    ? <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                    : <>Submit Report <CheckCircle2 size={16} /></>
                  }
                </motion.button>
              </div>

              <p className="text-center text-[9px] text-slate-300 font-medium uppercase tracking-widest">
                By submitting you confirm all information is truthful
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

//  SUCCESS STATE 
function SuccessState({ sensitivity, itemId }: { sensitivity: string; itemId: string | null }) {
  const supabase = createClient();
  const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "done" | "exists">("idle");

  const requestFacebookShare = async () => {
    if (!itemId) return;
    setShareStatus("loading");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setShareStatus("idle"); return; }
    const { error } = await (supabase as any).from("facebook_share_requests").insert({ item_id: itemId, user_id: user.id, note: null });
    if (error?.code === "23505") { setShareStatus("exists"); }
    else if (error) { setShareStatus("idle"); }
    else {
      await (supabase as any).from("notifications").insert({
        user_id: null, type: "facebook_share_request",
        title: "New Facebook Share Request",
        body: "A user has requested their report to be shared on the Back2U Facebook account.",
        data: { item_id: itemId },
      });
      setShareStatus("done");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: "#061209", backgroundImage: "linear-gradient(rgba(0,154,73,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,154,73,0.06) 1px,transparent 1px)", backgroundSize: "24px 24px" }}>

      <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }} transition={{ repeat: Infinity, duration: 4 }}
        className="w-28 h-28 bg-primary/20 rounded-full flex items-center justify-center mb-8">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <motion.circle cx="28" cy="28" r="24" stroke="#009A49" strokeWidth="3" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} />
          <motion.path d="M16 28l8 8 16-16" stroke="#009A49" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }} />
        </svg>
      </motion.div>

      <h1 className="text-5xl font-black text-white mb-3 font-clash">
        Report <span className="text-primary">Received!</span>
      </h1>

      {sensitivity === "very_sensitive" ? (
        <p className="text-white/40 max-w-sm text-sm font-medium mb-8 leading-relaxed">
          Your high-risk report is pending admin review. It will go live once approved.
        </p>
      ) : (
        <p className="text-white/40 max-w-sm text-sm font-medium mb-8 leading-relaxed">
          Our system is now scanning for matches. You will be notified the moment we find one.
        </p>
      )}

      {/* Facebook share request */}
      {itemId && (
        <div className="max-w-sm w-full mb-6 rounded-2xl p-4 text-left"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Reach more people</p>
          <p className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            Request the Back2U team to share your report on the official Back2U Facebook account.
          </p>
          {shareStatus === "done" ? (
            <div className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
              <CheckCircle2 size={14} /> Request sent!
            </div>
          ) : shareStatus === "exists" ? (
            <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
              <CheckCircle2 size={14} /> Already requested
            </div>
          ) : (
            <button onClick={requestFacebookShare} disabled={shareStatus === "loading"}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white disabled:opacity-50 hover:opacity-90 transition-all"
              style={{ background: "#1877F2" }}>
              {shareStatus === "loading"
                ? <><Loader2 size={13} className="animate-spin" /> Sending...</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Request Facebook Share</>
              }
            </button>
          )}
        </div>
      )}

      <Link href="/dashboard"
        className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
        Go to Dashboard
      </Link>
    </motion.div>
  );
}