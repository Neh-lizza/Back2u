// src/lib/email/templates.ts
// All Back2U email templates — branded dark design

export type EmailType =
  | "match_found"
  | "item_expiring"
  | "item_archived"
  | "new_message"
  | "recovery_confirmed"
  | "admin_approved"
  | "admin_rejected";

interface EmailData {
  userName?: string;
  itemTitle?: string;
  matchScore?: number;
  matcherName?: string;
  daysLeft?: number;
  senderName?: string;
  messagePreview?: string;
  rejectionReason?: string;
}

const BASE_STYLE = `
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #0a0a0a;
  color: #ffffff;
  margin: 0;
  padding: 0;
`;

const CONTAINER_STYLE = `
  max-width: 560px;
  margin: 0 auto;
  padding: 48px 24px;
`;

const LOGO = `
  <div style="margin-bottom: 48px;">
    <span style="font-size: 28px; font-weight: 900; letter-spacing: -2px; color: #ffffff;">
      back2u<span style="color: #009A49; font-size: 36px; line-height: 1;">.</span>
    </span>
  </div>
`;

const FOOTER = `
  <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05);">
    <p style="color: rgba(255,255,255,0.2); font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">
      Cameroon's #1 Lost & Found Network
    </p>
    <p style="color: rgba(255,255,255,0.1); font-size: 10px; margin: 0;">
      You're receiving this because you have an account on Back2U.
      <br/>If this wasn't you, please ignore this email.
    </p>
  </div>
`;

function wrapEmail(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="${BASE_STYLE}">
        <div style="${CONTAINER_STYLE}">
          ${LOGO}
          ${content}
          ${FOOTER}
        </div>
      </body>
    </html>
  `;
}

function primaryButton(text: string, url: string): string {
  return `
    <a href="${url}" style="
      display: inline-block;
      background-color: #009A49;
      color: #000000;
      padding: 16px 32px;
      border-radius: 100px;
      font-weight: 900;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 3px;
      text-decoration: none;
      margin-top: 32px;
    ">${text}</a>
  `;
}

// ── EMAIL TEMPLATES ────────────────────────────────────────

export function getEmailTemplate(
  type: EmailType,
  data: EmailData,
  appUrl: string
): { subject: string; html: string } {
  switch (type) {

    case "match_found":
      return {
        subject: `🎯 ${data.matchScore}% Match Found for "${data.itemTitle}"`,
        html: wrapEmail(`
          <div style="background: rgba(0,154,73,0.08); border: 1px solid rgba(0,154,73,0.2); border-radius: 24px; padding: 32px; margin-bottom: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
            <div style="display: inline-block; background: rgba(0,154,73,0.15); border: 1px solid rgba(0,154,73,0.3); border-radius: 100px; padding: 6px 16px; margin-bottom: 16px;">
              <span style="color: #009A49; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px;">${data.matchScore}% Match</span>
            </div>
            <h1 style="font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0; color: #ffffff;">It's a Match!</h1>
          </div>

          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 8px 0;">
            Hi <strong style="color: #ffffff;">${data.userName}</strong>,
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            We found a <strong style="color: #009A49;">${data.matchScore}% match</strong> for your 
            <strong style="color: #ffffff;">${data.itemTitle}</strong>. 
            Someone in our network may have found your item. 
            Open the app to connect with them now.
          </p>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px 24px;">
            <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Matched Item</p>
            <p style="color: #ffffff; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin: 0;">${data.itemTitle}</p>
          </div>

          ${primaryButton("View Match Now", `${appUrl}/browse`)}
        `),
      };

    case "item_expiring":
      return {
        subject: `⚠️ Your listing "${data.itemTitle}" expires in ${data.daysLeft} days`,
        html: wrapEmail(`
          <div style="background: rgba(252,209,22,0.08); border: 1px solid rgba(252,209,22,0.2); border-radius: 24px; padding: 32px; margin-bottom: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
            <h1 style="font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0; color: #FCD116;">Listing Expiring Soon</h1>
          </div>

          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi <strong style="color: #ffffff;">${data.userName}</strong>,
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Your listing <strong style="color: #ffffff;">"${data.itemTitle}"</strong> will be 
            <strong style="color: #FCD116;">archived in ${data.daysLeft} days</strong>. 
            If your item hasn't been recovered yet, renew your listing to keep it active.
          </p>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 20px 24px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Days Remaining</p>
              <p style="color: #FCD116; font-size: 24px; font-weight: 900; margin: 0;">${data.daysLeft}</p>
            </div>
          </div>

          ${primaryButton("Renew Listing", `${appUrl}/dashboard`)}
        `),
      };

    case "item_archived":
      return {
        subject: `📦 Your listing "${data.itemTitle}" has been archived`,
        html: wrapEmail(`
          <h1 style="font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0 0 24px 0; color: #ffffff;">
            Listing <span style="color: rgba(255,255,255,0.3);">Archived.</span>
          </h1>

          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi <strong style="color: #ffffff;">${data.userName}</strong>,
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Your listing <strong style="color: #ffffff;">"${data.itemTitle}"</strong> has been archived 
            after 6 months without a recovery. It's no longer visible to other users but is safely 
            stored in our system.
          </p>
          <p style="color: rgba(255,255,255,0.4); font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
            If you still haven't found your item, you can post a new listing at any time.
          </p>

          ${primaryButton("Post New Listing", `${appUrl}/report`)}
        `),
      };

    case "new_message":
      return {
        subject: `💬 New message from ${data.senderName}`,
        html: wrapEmail(`
          <div style="background: rgba(0,154,73,0.08); border: 1px solid rgba(0,154,73,0.15); border-radius: 24px; padding: 32px; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
              <div style="width: 48px; height: 48px; background: rgba(0,154,73,0.2); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 20px;">💬</span>
              </div>
              <div>
                <p style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">New Message From</p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 900; text-transform: uppercase; margin: 0;">${data.senderName}</p>
              </div>
            </div>
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px;">
              <p style="color: rgba(255,255,255,0.5); font-size: 13px; font-style: italic; margin: 0;">"${data.messagePreview}"</p>
            </div>
          </div>

          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi <strong style="color: #ffffff;">${data.userName}</strong>, 
            you have a new message about <strong style="color: #ffffff;">${data.itemTitle}</strong>.
            Open the app to reply.
          </p>

          ${primaryButton("Reply Now", `${appUrl}/chat`)}
        `),
      };

    case "recovery_confirmed":
      return {
        subject: `🎉 "${data.itemTitle}" has been successfully recovered!`,
        html: wrapEmail(`
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="font-size: 72px; margin-bottom: 24px;">🎉</div>
            <h1 style="font-size: 40px; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; margin: 0; color: #ffffff;">
              Item <span style="color: #009A49;">Recovered!</span>
            </h1>
          </div>

          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi <strong style="color: #ffffff;">${data.userName}</strong>,
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 32px 0;">
            Congratulations! Your item <strong style="color: #009A49;">"${data.itemTitle}"</strong> 
            has been successfully recovered. Your story helps build a more honest Cameroon. 🇨🇲
          </p>

          <div style="background: rgba(0,154,73,0.08); border: 1px solid rgba(0,154,73,0.2); border-radius: 20px; padding: 24px; text-align: center;">
            <p style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">You've earned</p>
            <p style="color: #009A49; font-size: 32px; font-weight: 900; margin: 0;">+50 Points</p>
          </div>

          ${primaryButton("View Dashboard", `${appUrl}/dashboard`)}
        `),
      };

    case "admin_approved":
      return {
        subject: `✅ Your item "${data.itemTitle}" has been approved`,
        html: wrapEmail(`
          <h1 style="font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0 0 24px 0; color: #ffffff;">
            Item <span style="color: #009A49;">Approved.</span>
          </h1>

          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi <strong style="color: #ffffff;">${data.userName}</strong>,
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Your high-risk item <strong style="color: #ffffff;">"${data.itemTitle}"</strong> has been 
            reviewed and approved by our moderation team. It is now live and visible to the community.
          </p>

          ${primaryButton("View Listing", `${appUrl}/browse`)}
        `),
      };

    case "admin_rejected":
      return {
        subject: `❌ Your item "${data.itemTitle}" was not approved`,
        html: wrapEmail(`
          <h1 style="font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin: 0 0 24px 0; color: #ffffff;">
            Item <span style="color: #CE1126;">Not Approved.</span>
          </h1>

          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Hi <strong style="color: #ffffff;">${data.userName}</strong>,
          </p>
          <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
            Unfortunately your item <strong style="color: #ffffff;">"${data.itemTitle}"</strong> 
            could not be approved by our moderation team.
          </p>

          ${data.rejectionReason ? `
            <div style="background: rgba(206,17,38,0.08); border: 1px solid rgba(206,17,38,0.2); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.3); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Reason</p>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0;">${data.rejectionReason}</p>
            </div>
          ` : ""}

          <p style="color: rgba(255,255,255,0.4); font-size: 13px; line-height: 1.6; margin: 0 0 24px 0;">
            You can edit your listing and resubmit for review.
          </p>

          ${primaryButton("Edit & Resubmit", `${appUrl}/report`)}
        `),
      };

    default:
      return { subject: "Back2U Notification", html: "" };
  }
}