// src/app/api/subscribe/route.ts
// NEW FILE
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MESOMB_APP_KEY     = process.env.MESOMB_APP_KEY!;
const MESOMB_ACCESS_KEY  = process.env.MESOMB_ACCESS_KEY!;
const MESOMB_SECRET_KEY  = process.env.MESOMB_SECRET_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { phone, operator, amount, subscription_id, user_id } = await req.json();

    if (!phone || !operator || !user_id || !subscription_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Call MeSomb payment API ──
    const mesombRes = await fetch("https://mesomb.hachther.com/en/api/v1.1/payment/collect/", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "X-MeSomb-Application": MESOMB_APP_KEY,
        "X-MeSomb-Nonce": Date.now().toString(),
      },
      body: JSON.stringify({
        amount,
        service:  operator.toUpperCase(),
        payer:    phone,
        currency: "XAF",
        reference: `sub_${subscription_id}`,
      }),
    });

    const mesombData = await mesombRes.json();

    if (!mesombRes.ok || mesombData.status === "FAILED") {
      // Update subscription as failed
      await supabase.from("subscriptions" as any)
        .update({ status: "failed" })
        .eq("id", subscription_id);

      return NextResponse.json({
        error: mesombData.message ?? "Payment failed. Please check your balance and try again."
      }, { status: 400 });
    }

    // ── Payment successful ──
    // 1. Update subscription record
    await supabase.from("subscriptions" as any).update({
      status:     "paid",
      mesomb_ref: mesombData.transaction?.pk ?? null,
      paid_at:    new Date().toISOString(),
    }).eq("id", subscription_id);

    // 2. Activate subscription on user
    await supabase.rpc("activate_subscription", { p_user_id: user_id });

    // 3. Send notification
    await supabase.from("notifications" as any).insert({
      user_id,
      type:  "subscription_activated",
      title: "Subscription Activated!",
      body:  "Your Back2U Annual Pass is now active. Post unlimited reports for 12 months.",
      data:  { subscription_id },
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Subscribe API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}