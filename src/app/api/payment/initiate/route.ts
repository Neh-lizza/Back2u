// src/app/api/payment/initiate/route.ts
// ♻️ REPLACE — MeSomb replaces NotchPay
// Handles both: contact unlock fees AND optional tips after recovery

import { NextRequest, NextResponse } from "next/server";

// ── Fee tier lookup (mirrors DB get_unlock_fee function) ──
const UNLOCK_FEES: Record<string, number> = {
  under_10k:   300,
  "10k_50k":   500,
  "50k_150k":  1000,
  "150k_500k": 2000,
  over_500k:   5000,
  unknown:     500,
};

// Fee split: 40% to finder, 60% to platform
const FINDER_SHARE = 0.4;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,          // XAF amount
      phone,           // e.g. "677000000"
      channel,         // "mtn" | "orange"
      recovery_id,     // UUID of the recovery row
      description,     // human-readable label
      payment_type,    // "unlock_fee" | "tip"
      value_range,     // for unlock_fee — determines amount automatically
    } = body;

    // ── Compute amount from value_range for unlock fees ──
    const finalAmount = payment_type === "unlock_fee" && value_range
      ? UNLOCK_FEES[value_range] ?? 500
      : amount;

    if (!finalAmount || finalAmount < 100) {
      return NextResponse.json(
        { error: "Minimum payment amount is 100 XAF." },
        { status: 400 }
      );
    }

    if (!phone || !channel) {
      return NextResponse.json(
        { error: "Phone number and payment channel are required." },
        { status: 400 }
      );
    }

    if (!["mtn", "orange"].includes(channel)) {
      return NextResponse.json(
        { error: "Channel must be 'mtn' or 'orange'." },
        { status: 400 }
      );
    }

    const MESOMB_APP_KEY    = process.env.MESOMB_APP_KEY;
    const MESOMB_ACCESS_KEY = process.env.MESOMB_ACCESS_KEY;
    const MESOMB_SECRET_KEY = process.env.MESOMB_SECRET_KEY;

    if (!MESOMB_APP_KEY || !MESOMB_ACCESS_KEY || !MESOMB_SECRET_KEY) {
      // Keys not configured — return mock success for local dev
      console.warn("MeSomb keys not configured. Returning mock success.");
      return NextResponse.json({
        success:        true,
        transaction_id: `mock_${Date.now()}`,
        amount:         finalAmount,
        finder_payout:  Math.floor(finalAmount * FINDER_SHARE),
        message:        "MeSomb keys not configured. Mock success returned.",
      });
    }

    // ── MeSomb payment collection ──────────────────────────
    // MeSomb uses HMAC-SHA256 signature authentication
    const timestamp   = new Date().toISOString();
    const nonce       = Math.random().toString(36).slice(2, 12);
    const reference   = `back2u_${recovery_id ?? "tip"}_${Date.now()}`;

    // Build the request body
    const mesombBody = {
      amount:    finalAmount,
      service:   channel === "mtn" ? "MTN" : "ORANGE",  // MeSomb service names
      payer:     `+237${phone.replace(/^\+?237/, "")}`,  // normalize to +237XXXXXXXXX
      nonce,
      currency:  "XAF",
      reference,
      message:   description ?? "Back2U payment",
    };

    // MeSomb API endpoint
    const mesombUrl = `https://mesomb.hachther.com/api/v1.1/payment/collect/`;

    const mesombResponse = await fetch(mesombUrl, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "X-MeSomb-Application": MESOMB_APP_KEY,
        "X-MeSomb-Date":        timestamp,
        "X-MeSomb-Nonce":       nonce,
        // Authorization uses HMAC — simplified here; full HMAC signing
        // should use the @hachther/mesomb npm package in production
        "Authorization": `Application ${MESOMB_ACCESS_KEY}`,
      },
      body: JSON.stringify(mesombBody),
    });

    const mesombData = await mesombResponse.json();

    if (!mesombResponse.ok || mesombData.status === "FAILED") {
      throw new Error(
        mesombData.message ?? mesombData.detail ?? "MeSomb payment failed."
      );
    }

    // ── Compute finder payout (40% of unlock fee, 0 for tips) ──
    const finderPayout = payment_type === "unlock_fee"
      ? Math.floor(finalAmount * FINDER_SHARE)
      : 0;

    return NextResponse.json({
      success:        true,
      transaction_id: mesombData.transaction?.id ?? reference,
      amount:         finalAmount,
      finder_payout:  finderPayout,
      status:         mesombData.status,
    });

  } catch (err: any) {
    console.error("MeSomb payment error:", err);
    return NextResponse.json(
      { error: err.message ?? "Payment failed." },
      { status: 500 }
    );
  }
}