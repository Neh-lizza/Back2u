// src/components/shared/OneSignalInit.tsx
// NEW FILE
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;

export default function OneSignalInit() {
  const supabase = createClient();

  useEffect(() => {
    if (!ONESIGNAL_APP_ID || typeof window === "undefined") return;

    const init = async () => {
      // Dynamically import OneSignal
      const OneSignal = (await import("react-onesignal")).default;

      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: { enable: false }, // we handle this manually
        promptOptions: {
          slidedown: {
            prompts: [{
              type: "push",
              autoPrompt: false,
              text: {
                actionMessage: "Back2U wants to notify you when a match is found for your lost item.",
                acceptButton: "Allow",
                cancelButton: "Later",
              },
            }]
          }
        }
      });

      // Get current user and link their OneSignal ID to their Supabase user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Set external user ID so we can target them specifically
      await OneSignal.login(user.id);

      // Request permission after login
      const permission = await OneSignal.Notifications.permission;
      if (!permission) {
        // Show prompt after 3 seconds — not immediately
        setTimeout(() => {
          OneSignal.Slidedown.promptPush();
        }, 3000);
      }
    };

    init().catch(console.error);
  }, []);

  return null;
}