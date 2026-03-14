// src/app/api/payment/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      currency,
      phone,
      channel,
      recovery_id,
      description,
      email,
    } = body;

    // Validate
    if (!amount || amount < 100) {
      return NextResponse.json(
        { error: "Minimum tip amount is 100 XAF." },
        { status: 400 }
      );
    }

    const NOTCHPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_NOTCHPAY_PUBLIC_KEY;
    const NOTCHPAY_SECRET_KEY = process.env.NOTCHPAY_SECRET_KEY;

    if (!NOTCHPAY_PUBLIC_KEY || !NOTCHPAY_SECRET_KEY) {
      // Payment not configured yet — return mock success for development
      console.warn("NotchPay keys not configured. Returning mock success.");
      return NextResponse.json({
        success: true,
        transaction_id: `mock_${Date.now()}`,
        message: "Payment keys not configured. Mock success returned.",
      });
    }

    // ── Initiate NotchPay payment ──
    const notchPayResponse = await fetch(
      "https://api.notchpay.co/payments/initialize",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": NOTCHPAY_PUBLIC_KEY,
        },
        body: JSON.stringify({
          amount,
          currency: currency ?? "XAF",
          email,
          phone,
          channel,
          description,
          reference: `back2u_${recovery_id}_${Date.now()}`,
          callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/recovery/success?recovery_id=${recovery_id}&paid=true`,
        }),
      }
    );

    const notchData = await notchPayResponse.json();

    if (!notchPayResponse.ok) {
      throw new Error(notchData.message ?? "NotchPay error");
    }

    return NextResponse.json({
      success: true,
      payment_url: notchData.authorization_url ?? null,
      transaction_id: notchData.transaction?.reference ?? null,
    });

  } catch (err: any) {
    console.error("Payment error:", err);
    return NextResponse.json(
      { error: err.message ?? "Payment failed." },
      { status: 500 }
    );
  }
}