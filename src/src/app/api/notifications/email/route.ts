// src/app/api/notifications/email/route.ts
// Called by Supabase Edge Functions or internal triggers
// to send transactional emails via Resend

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { createClient } from "@supabase/supabase-js";
import type { EmailType } from "@/lib/email/templates";

// Use service role for reading user emails
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, data } = body as {
      user_id: string;
      type: EmailType;
      data: Record<string, any>;
    };

    if (!user_id || !type) {
      return NextResponse.json(
        { error: "user_id and type are required." },
        { status: 400 }
      );
    }

    // Get user email from auth
    const { data: { user }, error } = await supabase.auth.admin.getUserById(user_id);

    if (error || !user?.email) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Get user name from profile
    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user_id)
      .single();

    const success = await sendEmail({
      to: user.email,
      type,
      data: {
        ...data,
        userName: profile?.full_name ?? "there",
      },
    });

    return NextResponse.json({ success });
  } catch (err: any) {
    console.error("Email route error:", err);
    return NextResponse.json(
      { error: err.message ?? "Failed to send email." },
      { status: 500 }
    );
  }
}