// src/lib/email/send.ts
// Resend email sender — used by API routes and Edge Functions

import { getEmailTemplate, type EmailType } from "./templates";

interface SendEmailParams {
  to: string;
  type: EmailType;
  data: {
    userName?: string;
    itemTitle?: string;
    matchScore?: number;
    matcherName?: string;
    daysLeft?: number;
    senderName?: string;
    messagePreview?: string;
    rejectionReason?: string;
  };
}

export async function sendEmail({ to, type, data }: SendEmailParams): Promise<boolean> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send.");
    return false;
  }

  const { subject, html } = getEmailTemplate(type, data, APP_URL);

  if (!html) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Back2U <notifications@back2u.cm>",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}