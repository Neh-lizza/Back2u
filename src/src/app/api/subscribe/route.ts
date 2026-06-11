// src/app/api/subscribe/route.ts
// ♻️ REPLACE — Simulated payment for MVP demo
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { phone, operator, amount, subscription_id, user_id } = await req.json();

    if (!phone || !user_id || !subscription_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simulate a 1.5 second processing delay
    await new Promise(r => setTimeout(r, 1500));

    // Mark subscription as paid
    await supabase.from("subscriptions" as any).update({
      status:   "paid",
      paid_at:  new Date().toISOString(),
      mesomb_ref: `SIM-${Date.now()}`,
    }).eq("id", subscription_id);

    // Activate subscription on user
    await supabase.rpc("activate_subscription", { p_user_id: user_id });

    // Send notification
    await supabase.from("notifications" as any).insert({
      user_id,
      type:  "subscription_activated",
      title: "Subscription Activated!",
      body:  "Your Back2U Annual Pass is now active. Post unlimited reports for 12 months.",
      data:  { subscription_id },
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}