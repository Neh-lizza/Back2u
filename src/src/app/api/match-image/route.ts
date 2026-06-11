// src/app/api/match-image/route.ts
// ♻️ REPLACE
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;

// ── 1. CLIP — image embedding for visual similarity ──────
async function getCLIPEmbedding(imageUrl: string): Promise<number[] | null> {
  try {
    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

    const res = await fetch(
      "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: { image: `data:${mimeType};base64,${base64}` },
          options: { wait_for_model: true },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) return data[0];
    if (Array.isArray(data)) return data;
    return null;
  } catch { return null; }
}

// ── 2. BLIP — generate text caption from image ───────────
async function getBLIPCaption(imageUrl: string): Promise<string | null> {
  try {
    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

    const res = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: `data:${mimeType};base64,${base64}`,
          options: { wait_for_model: true },
        }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0]?.generated_text ?? null;
  } catch { return null; }
}

// ── 3. BERT — semantic text embedding ────────────────────
async function getBERTEmbedding(text: string): Promise<number[] | null> {
  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${HF_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) return data[0];
    if (Array.isArray(data)) return data;
    return null;
  } catch { return null; }
}

// ── 4. Cosine similarity ──────────────────────────────────
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  const dot   = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

export async function POST(req: NextRequest) {
  try {
    const { item_id } = await req.json();
    if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });

    // Get the item
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, type, photos, city, title, description, user_id")
      .eq("id", item_id)
      .single();

    if (itemError || !item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const firstPhoto = item.photos?.[0];
    if (!firstPhoto) return NextResponse.json({ message: "No photos to process" });

    // Run CLIP + BLIP in parallel
    const [clipEmbedding, blipCaption] = await Promise.all([
      getCLIPEmbedding(firstPhoto),
      getBLIPCaption(firstPhoto),
    ]);

    // Build semantic text: BLIP caption + item title + description
    const semanticText = [
      blipCaption,
      item.title,
      item.description,
    ].filter(Boolean).join(". ");

    // Get BERT embedding for semantic text
    const bertEmbedding = await getBERTEmbedding(semanticText);

    // Store CLIP embedding on item
    if (clipEmbedding) {
      await supabase.from("items")
        .update({
          embedding: `[${clipEmbedding.join(",")}]`,
          ...(blipCaption ? { blip_caption: blipCaption } : {}),
        })
        .eq("id", item_id);
    }

    // Find visually similar items using CLIP
    const matchType = item.type === "lost" ? "found" : "lost";
    const db = supabase as any;

    let clipMatches: any[] = [];
    if (clipEmbedding) {
      const { data } = await supabase.rpc("find_visual_matches", {
        query_embedding:     `[${clipEmbedding.join(",")}]`,
        match_item_id:       item_id,
        match_type:          matchType,
        similarity_threshold: 0.65,
        max_results:         10,
      });
      clipMatches = data ?? [];
    }

    // Re-rank using BERT semantic similarity if we have the embedding
    const rankedMatches: { id: string; title: string; user_id: string; similarity: number; semantic_score: number; combined_score: number }[] = [];

    for (const match of clipMatches) {
      let semanticScore = 0;

      if (bertEmbedding) {
        // Get or generate BERT embedding for the matched item
        const { data: matchedItem } = await db.from("items")
          .select("title, description, blip_caption")
          .eq("id", match.id)
          .single();

        if (matchedItem) {
          const matchText = [matchedItem.blip_caption, matchedItem.title, matchedItem.description].filter(Boolean).join(". ");
          const matchBert = await getBERTEmbedding(matchText);
          if (matchBert) {
            semanticScore = cosineSimilarity(bertEmbedding, matchBert);
          }
        }
      }

      // Combined score: 60% CLIP visual + 40% BERT semantic
      const combinedScore = (match.similarity * 0.6) + (semanticScore * 0.4);

      rankedMatches.push({
        ...match,
        semantic_score: semanticScore,
        combined_score: combinedScore,
      });
    }

    // Sort by combined score, keep above threshold
    const finalMatches = rankedMatches
      .sort((a, b) => b.combined_score - a.combined_score)
      .filter(m => m.combined_score >= 0.55);

    // Store matches + notify
    for (const match of finalMatches) {
      await db.from("visual_matches").upsert(
        { item_a_id: item_id, item_b_id: match.id, similarity: match.combined_score },
        { onConflict: "item_a_id,item_b_id", ignoreDuplicates: true }
      );

      const { data: matchedItem } = await db.from("items").select("user_id, title").eq("id", match.id).single();

      if (matchedItem) {
        const similarityPct = Math.round(match.combined_score * 100);

        await db.from("notifications").insert({
          user_id: item.user_id,
          type:    "match_found",
          title:   "Visual match found!",
          body:    `Your ${item.type} report "${item.title}" visually matches a ${matchType} report with ${similarityPct}% similarity.`,
          data:    { item_id, match_id: match.id, score: similarityPct, distance: null },
        });

        await db.from("notifications").insert({
          user_id: matchedItem.user_id,
          type:    "match_found",
          title:   "Visual match found!",
          body:    `Your ${matchType} report "${matchedItem.title}" visually matches a new ${item.type} report with ${similarityPct}% similarity.`,
          data:    { item_id: match.id, match_id: item_id, score: similarityPct, distance: null },
        });
      }
    }

    return NextResponse.json({
      message: `BLIP caption: "${blipCaption}". Found ${finalMatches.length} match(es).`,
      caption: blipCaption,
      matches: finalMatches.length,
    });

  } catch (err: any) {
    console.error("match-image error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}