// src/app/api/webhooks/match-notify/route.ts
// ♻️ REPLACE
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateAIReport(itemA: any, itemB: any, score: number): string {
  const sameCity = itemA?.city && itemB?.city && itemA.city.toLowerCase() === itemB.city.toLowerCase();
  const sameCategory = itemA?.category && itemB?.category && itemA.category.toLowerCase() === itemB.category.toLowerCase();
  const daysApart = itemA?.created_at && itemB?.created_at
    ? Math.abs(Math.round((new Date(itemA.created_at).getTime() - new Date(itemB.created_at).getTime()) / 86400000))
    : null;
  const probability = Math.min(98, Math.round(50 + score * 0.48));

  const cityText = sameCity
    ? `Both reports are from ${itemA.city}`
    : `The reports are from ${itemA?.city ?? "different areas"} and ${itemB?.city ?? "nearby"}`;

  const dateText = daysApart === null ? "" : daysApart === 0
    ? ", both posted on the same day"
    : daysApart === 1 ? ", posted just 1 day apart"
    : `, posted ${daysApart} days apart`;

  const categoryText = sameCategory
    ? `Both items are in the ${itemA.category} category.`
    : "";

  const confidence = score >= 80 ? "strong" : score >= 60 ? "good" : "potential";

  return `We found a ${confidence} match for your ${itemA?.type ?? "lost"} report. ${cityText}${dateText}. ${categoryText} Based on our analysis, we estimate a ${probability}% probability this is your item. We recommend reaching out to the other party as soon as possible.`;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record || record.type !== "match_found") {
      return NextResponse.json({ skipped: true });
    }

    const { user_id, data } = record;
    const itemId  = (data as any)?.item_id;
    const matchId = (data as any)?.match_id;
    const score   = (data as any)?.score ?? 0;

    // Get user email
    const { data: { user } } = await supabase.auth.admin.getUserById(user_id);
    if (!user?.email) return NextResponse.json({ skipped: true });

    // Get user profile
    const { data: profile } = await supabase.from("users").select("full_name").eq("id", user_id).single();

    // Get both items
    const [{ data: itemA }, { data: itemB }] = await Promise.all([
      supabase.from("items" as any).select("title, type, city, location_name, created_at").eq("id", itemId).single(),
      supabase.from("items" as any).select("title, type, city, location_name, created_at").eq("id", matchId).single(),
    ]);

    const aiReport = generateAIReport(itemA, itemB, score);
    const probability = Math.min(98, Math.round(50 + score * 0.48));
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://back2u.vercel.app";

    // Build email HTML
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="background:#0a0a0a;margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:48px 24px;">

    <div style="margin-bottom:40px;">
      <span style="font-size:28px;font-weight:900;letter-spacing:-2px;color:#ffffff;">back2u</span><span style="color:#009A49;font-size:36px;line-height:1;font-weight:900;">.</span>
    </div>

    <h1 style="color:#ffffff;font-size:32px;font-weight:900;margin:0 0 8px;letter-spacing:-1px;">Potential Match Found!</h1>
    <p style="color:rgba(255,255,255,0.4);font-size:14px;margin:0 0 32px;">Hello ${profile?.full_name ?? "there"}, we found a match for your report.</p>

    <!-- Score bar -->
    <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:20px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.08);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span style="color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Match Score</span>
        <span style="color:#009A49;font-size:20px;font-weight:900;">${score}/100</span>
      </div>
      <div style="background:rgba(255,255,255,0.1);border-radius:100px;height:6px;overflow:hidden;">
        <div style="background:#009A49;height:100%;width:${score}%;border-radius:100px;"></div>
      </div>
      <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:12px 0 0;font-weight:600;">
        Estimated <strong style="color:#009A49;">${probability}%</strong> probability this is your item
      </p>
    </div>

    <!-- Items -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
      <div style="background:rgba(255,77,77,0.08);border:1px solid rgba(255,77,77,0.2);border-radius:12px;padding:14px;">
        <p style="color:rgba(255,77,77,0.8);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Lost</p>
        <p style="color:#ffffff;font-size:13px;font-weight:700;margin:0 0 4px;">${itemA?.title ?? "Unknown"}</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">${itemA?.city ?? ""}</p>
      </div>
      <div style="background:rgba(0,154,73,0.08);border:1px solid rgba(0,154,73,0.2);border-radius:12px;padding:14px;">
        <p style="color:rgba(0,154,73,0.8);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:0 0 4px;">Found</p>
        <p style="color:#ffffff;font-size:13px;font-weight:700;margin:0 0 4px;">${itemB?.title ?? "Unknown"}</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin:0;">${itemB?.city ?? ""}</p>
      </div>
    </div>

    ${aiReport ? `
    <!-- AI Report -->
    <div style="background:rgba(0,154,73,0.05);border:1px solid rgba(0,154,73,0.15);border-radius:16px;padding:20px;margin-bottom:32px;">
      <p style="color:#009A49;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">AI Analysis</p>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.7;margin:0;">${aiReport}</p>
    </div>
    ` : ""}

    <!-- CTA -->
    <a href="${baseUrl}/browse/${itemId}" style="display:block;background:#009A49;color:#ffffff;text-align:center;padding:16px;border-radius:14px;font-weight:900;font-size:13px;text-decoration:none;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px;">
      View Match Now
    </a>
    <a href="${baseUrl}/browse" style="display:block;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.4);text-align:center;padding:14px;border-radius:14px;font-weight:700;font-size:12px;text-decoration:none;border:1px solid rgba(255,255,255,0.08);">
      Browse All Reports
    </a>

    <div style="margin-top:48px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="color:rgba(255,255,255,0.15);font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0;">
        Cameroon&apos;s #1 Lost &amp; Found Network
      </p>
    </div>
  </div>
</body>
</html>`;

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Back2U <onboarding@resend.dev>",
        to: user.email,
        subject: `Match found for your report — Score: ${score}/100`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error("Resend error:", err);
    }

    // Send OneSignal push notification
    const onesignalKey = process.env.ONESIGNAL_REST_API_KEY;
    const onesignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (onesignalKey && onesignalAppId) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${onesignalKey}`,
        },
        body: JSON.stringify({
          app_id: onesignalAppId,
          include_aliases: { external_id: [user_id] },
          target_channel: "push",
          headings: { en: "Potential Match Found!" },
          contents: { en: `Your report matched another item. Score: ${score}/100. Tap to view.` },
          url: `${process.env.NEXT_PUBLIC_APP_URL || "https://back2u-cmr.vercel.app"}/browse/${itemId}`,
          web_push_topic: "match_found",
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}