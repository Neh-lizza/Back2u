// src/components/shared/ItemQRCode.tsx
// NEW FILE
"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, Download } from "lucide-react";

type Props = {
  itemId: string;
  itemTitle: string;
  itemType: string;
  size?: number;
};

export default function ItemQRCode({ itemId, itemTitle, itemType, size = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : "https://back2u.vercel.app"}/scan/${itemId}`;

  useEffect(() => {
    const generate = async () => {
      const QRCode = (await import("qrcode")).default;
      if (!canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: "#061209",
          light: "#ffffff",
        },
      });
      setReady(true);
    };
    generate();
  }, [url, size]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `back2u-${itemType}-${itemTitle.slice(0, 20).replace(/\s+/g, "-")}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative p-3 bg-white rounded-2xl shadow-lg"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
        <canvas ref={canvasRef} style={{ display: ready ? "block" : "none", borderRadius: "8px" }} />
        {!ready && (
          <div style={{ width: size, height: size }} className="flex items-center justify-center bg-slate-100 rounded-xl">
            <QrCode size={32} className="text-slate-300 animate-pulse" />
          </div>
        )}
        {/* Back2U logo overlay in center */}
        {ready && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-lg px-1.5 py-0.5 shadow-sm">
              <span className="text-[8px] font-black text-[#061209] leading-none">b2u</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Scan to view on Back2U</p>
        <button onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-[10px] font-bold text-slate-500 uppercase tracking-widest mx-auto">
          <Download size={10} />
          Download QR
        </button>
      </div>
    </div>
  );
}