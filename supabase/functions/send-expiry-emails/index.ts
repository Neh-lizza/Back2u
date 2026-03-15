// supabase/functions/send-expiry-emails/index.ts
// Supabase Edge Function — called by pg_cron daily
// Sends expiry warning emails for items expiring in 7 days

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://back2u.cm";

Deno.serve(async () => {
  try {
    // Find items expiring in next 7 days that haven't been warned yet
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const now = new Date();

    const { data: expiringItems, error } = await supabase
      .from("items")
      .select("id, title, user_id, expires_at")
      .eq("status", "active")
      .lte("expires_at", in7Days.toISOString())
      .gte("expires_at", now.toISOString());

    if (error) throw error;
    if (!expiringItems || expiringItems.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    let sent = 0;

    for (const item of expiringItems) {
      // Check if we already sent a warning for this item
      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", item.user_id)
        .eq("type", "item_expiring")
        .contains("data", { item_id: item.id })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle();

      if (existingNotif) continue; // Already warned

      // Get user email + name
      const { data: { user } } = await supabase.auth.admin.getUserById(item.user_id);
      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", item.user_id)
        .single();

      if (!user?.email) continue;

      const daysLeft = Math.ceil(
        (new Date(item.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send email via Resend
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Back2U <notifications@back2u.cm>",
          to: user.email,
          subject: `⚠️ Your listing "${item.title}" expires in ${daysLeft} days`,
          html: buildExpiryEmail(profile?.full_name ?? "there", item.title, daysLeft, APP_URL),
        }),
      });

      if (emailRes.ok) {
        // Create in-app notification too
        await supabase.from("notifications").insert({
          user_id: item.user_id,
          type: "item_expiring",
          title: "Listing expiring soon",
          body: `Your listing "${item.title}" expires in ${daysLeft} days. Renew it to keep it active.`,
          data: { item_id: item.id, days_left: daysLeft },
        });
        sent++;
      }
    }

    return new Response(JSON.stringify({ sent }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

function buildExpiryEmail(name: string, itemTitle: string, daysLeft: number, appUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 48px 24px;">
        <div style="max-width: 560px; margin: 0 auto;">
          <div style="margin-bottom: 48px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: -2px;">
              back2u<span style="color: #009A49; font-size: 36px;">.</span>
            </span>
          </div>

          <div style="background: rgba(252,209,22,0.08); border: 1px solid rgba(252,209,22,0.2); border-radius: 24px; padding: 32px; margin-bottom: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
            <h1 style="font-size: 32px; font-weight: 900; text-transform: uppercase; color: #FCD116; margin: 0;">Listing Expiring Soon</h1>
          </div>

          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi <strong style="color: #fff;">${name}</strong>,
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
            Your listing <strong style="color: #fff;">"${itemTitle}"</strong> will be archived in 
            <strong style="color: #FCD116;">${daysLeft} days</strong>. 
            Renew it to keep it active.
          </p>

          <a href="${appUrl}/dashboard" style="display: inline-block; background: #009A49; color: #000; padding: 16px 32px; border-radius: 100px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; text-decoration: none;">
            Renew Listing
          </a>

          <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: rgba(255,255,255,0.1); font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
              Cameroon's #1 Lost & Found Network
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}