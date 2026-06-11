// src/app/api/detect-category/route.ts
// ♻️ REPLACE
import { NextRequest, NextResponse } from "next/server";

const IMAGGA_API_KEY    = process.env.IMAGGA_API_KEY!;
const IMAGGA_API_SECRET = process.env.IMAGGA_API_SECRET!;

const CATEGORY_MAP: Record<string, string[]> = {
  electronics:  ["phone", "smartphone", "mobile", "laptop", "computer", "tablet", "camera", "electronic", "device", "gadget", "charger", "headphone", "earphone", "keyboard", "mouse", "screen", "iphone", "samsung", "macbook", "cable", "battery"],
  documents:    ["document", "passport", "id", "identity", "license", "card", "paper", "certificate", "notebook", "identification", "booklet", "folder"],
  keys:         ["key", "keychain", "remote", "fob"],
  bags:         ["bag", "backpack", "handbag", "luggage", "suitcase", "briefcase", "purse", "tote", "satchel", "pouch", "wallet"],
  clothing:     ["clothing", "shirt", "jacket", "coat", "dress", "shoe", "boot", "hat", "cap", "scarf", "glove", "trouser", "pants", "skirt", "sock", "apparel", "garment"],
  accessories:  ["watch", "jewelry", "ring", "necklace", "bracelet", "earring", "glasses", "sunglasses", "belt", "accessory", "spectacles"],
  animals:      ["dog", "cat", "bird", "animal", "pet", "puppy", "kitten", "creature"],
  money:        ["money", "cash", "coin", "currency", "banknote", "bill", "credit card", "bank card"],
};

function detectCategoryFromTags(tags: { tag: { en: string }; confidence: number }[]): { category: string; confidence: number } {
  const scores: Record<string, number> = {};

  for (const { tag, confidence } of tags) {
    const label = tag.en.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
      for (const keyword of keywords) {
        if (label.includes(keyword) || keyword.includes(label)) {
          scores[category] = (scores[category] ?? 0) + confidence;
        }
      }
    }
  }

  if (Object.keys(scores).length === 0) return { category: "other", confidence: 0 };

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const confidence = Math.min(97, Math.round(best[1] / 100));

  return { category: best[0], confidence };
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ error: "imageUrl required" }, { status: 400 });

    // Call Imagga tagging API with image URL directly
    const credentials = Buffer.from(`${IMAGGA_API_KEY}:${IMAGGA_API_SECRET}`).toString("base64");

    const res = await fetch(
      `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}&limit=20`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Imagga error:", err);
      return NextResponse.json({ error: "Imagga API failed", category: "other" }, { status: 500 });
    }

    const data = await res.json();
    const tags = data.result?.tags ?? [];

    if (tags.length === 0) {
      return NextResponse.json({ category: "other", confidence: 0, tags: [] });
    }

    const { category, confidence } = detectCategoryFromTags(tags);

    return NextResponse.json({
      category,
      confidence,
      tags: tags.slice(0, 5).map((t: any) => t.tag.en),
    });

  } catch (err: any) {
    console.error("detect-category error:", err);
    return NextResponse.json({ error: err.message, category: "other" }, { status: 500 });
  }
}