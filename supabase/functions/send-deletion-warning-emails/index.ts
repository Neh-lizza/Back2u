// supabase/functions/send-deletion-warning-emails/index.ts
// Supabase Edge Function — called by pg_cron daily at 09:30
// Sends permanent deletion warning emails for items archived ~23 months ago
// (i.e. items that will be permanently deleted in ~30 days)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const APP_URL = Deno.env.get("APP_URL") ?? "https://back2u.vercel.app";

Deno.serve(async () => {
  try {
    // Find items that were archived between 23 and 24 months ago
    // These will be permanently deleted in ~30 days (at the 2-year mark)
    const twentyThreeMonthsAgo = new Date();
    twentyThreeMonthsAgo.setMonth(twentyThreeMonthsAgo.getMonth() - 23);

    const twentyFourMonthsAgo = new Date();
    twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);

    const { data: itemsDueDeletion, error } = await supabase
      .from("items")
      .select("id, title, user_id, updated_at")
      .eq("status", "archived")
      .lte("updated_at", twentyThreeMonthsAgo.toISOString())
      .gte("updated_at", twentyFourMonthsAgo.toISOString());

    if (error) throw error;
    if (!itemsDueDeletion || itemsDueDeletion.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No items due for deletion warning" }), {
        status: 200,
      });
    }

    let sent = 0;

    for (const item of itemsDueDeletion) {
      // Avoid sending duplicate warning for the same item this month
      const { data: existingNotif } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", item.user_id)
        .eq("type", "item_deletion_warning")
        .contains("data", { item_id: item.id })
        .gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        )
        .maybeSingle();

      if (existingNotif) continue; // Already warned this month

      // Get user email + name
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(item.user_id);
      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", item.user_id)
        .single();

      if (!user?.email) continue;

      // Calculate exact days until deletion
      const archivedAt = new Date(item.updated_at);
      const deletionDate = new Date(archivedAt);
      deletionDate.setFullYear(deletionDate.getFullYear() + 2);
      const daysUntilDeletion = Math.ceil(
        (deletionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      // Send warning email via Resend
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Back2U <notifications@back2u.vercel.app>",
          to: user.email,
          subject: `🗑️ Your archived listing "${item.title}" will be permanently deleted in ${daysUntilDeletion} days`,
          html: buildDeletionWarningEmail(
            profile?.full_name ?? "there",
            item.title,
            daysUntilDeletion,
            APP_URL
          ),
        }),
      });

      if (emailRes.ok) {
        // Create in-app notification
        await supabase.from("notifications").insert({
          user_id: item.user_id,
          type: "item_deletion_warning",
          title: "Listing scheduled for permanent deletion",
          body: `Your archived listing "${item.title}" will be permanently deleted in ${daysUntilDeletion} days. Post a new listing if your item is still missing.`,
          data: { item_id: item.id, days_until_deletion: daysUntilDeletion },
        });
        sent++;
      }
    }

    return new Response(JSON.stringify({ sent }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});

function buildDeletionWarningEmail(
  name: string,
  itemTitle: string,
  daysLeft: number,
  appUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 48px 24px;">
        <div style="max-width: 560px; margin: 0 auto;">

          <!-- Logo -->
          <div style="margin-bottom: 48px;">
            <span style="font-size: 28px; font-weight: 900; letter-spacing: -2px;">
              back2u<span style="color: #009A49; font-size: 36px;">.</span>
            </span>
          </div>

          <!-- Header card -->
          <div style="background: rgba(206,17,38,0.08); border: 1px solid rgba(206,17,38,0.2); border-radius: 24px; padding: 32px; margin-bottom: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🗑️</div>
            <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; color: #CE1126; margin: 0; letter-spacing: -1px;">
              Permanent Deletion Notice
            </h1>
          </div>

          <!-- Body -->
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi <strong style="color: #fff;">${name}</strong>,
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Your archived listing <strong style="color: #fff;">"${itemTitle}"</strong> has been stored 
            for nearly 2 years. In line with our data retention policy, it will be 
            <strong style="color: #CE1126;">permanently deleted in ${daysLeft} days</strong>.
          </p>
          <p style="color: rgba(255,255,255,0.4); font-size: 13px; line-height: 1.6; margin: 0 0 32px 0;">
            Once deleted, this listing cannot be recovered. If your item is still missing, 
            you can post a new listing at any time.
          </p>

          <!-- Days remaining pill -->
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px 24px; margin-bottom: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Days Until Permanent Deletion</p>
              <p style="color: #CE1126; font-size: 24px; font-weight: 900; margin: 0;">${daysLeft}</p>
            </div>
          </div>

          <!-- CTA -->
          <a href="${appUrl}/report" style="display: inline-block; background: #009A49; color: #000; padding: 16px 32px; border-radius: 100px; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; text-decoration: none;">
            Post New Listing
          </a>

          <!-- Footer -->
          <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05);">
            <p style="color: rgba(255,255,255,0.1); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">
              Cameroon's #1 Lost & Found Network · back2u.vercel.app
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
}