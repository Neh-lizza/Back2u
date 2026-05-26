// src/app/api/detect-category/route.ts
// NEW FILE
import { NextRequest, NextResponse } from "next/server";

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;

// Category labels with descriptive text for CLIP zero-shot classification
const CATEGORY_LABELS = [
  { id: "electronics",  label: "a phone, laptop, tablet, camera, or electronic device" },
  { id: "documents",    label: "an ID card, passport, wallet, license, or document" },
  { id: "keys",         label: "keys, a keychain, or car keys" },
  { id: "bags",         label: "a bag, backpack, handbag, or luggage" },
  { id: "clothing",     label: "clothing, a shirt, jacket, shoes, or clothing item" },
  { id: "accessories",  label: "jewelry, a watch, glasses, belt, or accessory" },
  { id: "animals",      label: "a pet, dog, cat, or animal" },
  { id: "money",        label: "cash, money, coins, or a bank card" },
  { id: "other",        label: "a miscellaneous lost or found object" },
];

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

    // Fetch image and convert to base64
    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

    // Use CLIP zero-shot image classification via HuggingFace
    const res = await fetch(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {
            image: `data:${mimeType};base64,${base64}`,
            text: CATEGORY_LABELS.map(c => c.label),
          },
          options: { wait_for_model: true },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("HF category detection error:", err);
      return NextResponse.json({ error: "Detection failed", category: "other" });
    }

    const scores: number[] = await res.json();

    // Find highest scoring category
    const maxIndex = scores.indexOf(Math.max(...scores));
    const detected = CATEGORY_LABELS[maxIndex];
    const confidence = Math.round(scores[maxIndex] * 100);

    return NextResponse.json({
      category:   detected.id,
      confidence,
      label:      detected.label,
      all_scores: CATEGORY_LABELS.map((c, i) => ({
        id:         c.id,
        score:      Math.round(scores[i] * 100),
      })),
    });

  } catch (err: any) {
    console.error("detect-category error:", err);
    return NextResponse.json({ error: err.message, category: "other" }, { status: 500 });
  }
}