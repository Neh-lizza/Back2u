// src/app/api/match-image/route.ts
// NEW FILE
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY!;
const HF_MODEL   = "openai/clip-vit-base-patch32";

// ── Get image embedding from Hugging Face CLIP ──
async function getImageEmbedding(imageUrl: string): Promise<number[] | null> {
  try {
    // Fetch image as base64
    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

    // Call HuggingFace feature extraction
    const res = await fetch(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { image: `data:${mimeType};base64,${base64}` },
          options: { wait_for_model: true },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("HF API error:", err);
      return null;
    }

    const data = await res.json();

    // CLIP returns embeddings as a flat array
    if (Array.isArray(data) && Array.isArray(data[0])) return data[0];
    if (Array.isArray(data)) return data;
    return null;
  } catch (err) {
    console.error("Embedding error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { item_id } = await req.json();
    if (!item_id) return NextResponse.json({ error: "item_id required" }, { status: 400 });

    // 1. Get the item
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, type, photos, city, title, user_id")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // 2. Get embedding for first photo
    const firstPhoto = item.photos?.[0];
    if (!firstPhoto) {
      return NextResponse.json({ message: "No photos to embed" });
    }

    const embedding = await getImageEmbedding(firstPhoto);
    if (!embedding) {
      return NextResponse.json({ error: "Failed to generate embedding" }, { status: 500 });
    }

    // 3. Store embedding on item
    await supabase
      .from("items")
      .update({ embedding: `[${embedding.join(",")}]` })
      .eq("id", item_id);

    // 4. Find visually similar items (opposite type)
    const matchType = item.type === "lost" ? "found" : "lost";

    const { data: matches } = await supabase.rpc("find_visual_matches", {
      query_embedding: `[${embedding.join(",")}]`,
      match_item_id:   item_id,
      match_type:      matchType,
      similarity_threshold: 0.72,
      max_results:     5,
    });

    if (!matches || matches.length === 0) {
      return NextResponse.json({ message: "No visual matches found", matches: [] });
    }

    // 5. Store matches + notify users
    const db = supabase as any;
    const newMatches = [];

    for (const match of matches) {
      // Avoid duplicate entries
      const { error: upsertError } = await db.from("visual_matches").upsert(
        { item_a_id: item_id, item_b_id: match.id, similarity: match.similarity },
        { onConflict: "item_a_id,item_b_id", ignoreDuplicates: true }
      );

      if (!upsertError) {
        newMatches.push(match);

        // Get owner of matched item to notify them
        const { data: matchedItem } = await db
          .from("items")
          .select("user_id, title")
          .eq("id", match.id)
          .single();

        if (matchedItem) {
          // Notify the person who posted the new item
          await db.from("notifications").insert({
            user_id: item.user_id,
            type:    "match_found",
            title:   "Visual match found!",
            body:    `Your ${item.type} report "${item.title}" visually matches a ${matchType} report. Check it out.`,
            data:    { item_id: item_id, match_id: match.id, similarity: match.similarity },
          });

          // Notify the owner of the matched item
          await db.from("notifications").insert({
            user_id: matchedItem.user_id,
            type:    "match_found",
            title:   "Visual match found!",
            body:    `Your ${matchType} report "${matchedItem.title}" visually matches a new ${item.type} report. Check it out.`,
            data:    { item_id: match.id, match_id: item_id, similarity: match.similarity },
          });
        }
      }
    }

    return NextResponse.json({
      message: `Found ${newMatches.length} visual match(es)`,
      matches: newMatches,
    });

  } catch (err: any) {
    console.error("match-image error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}