// src/components/shared/OneSignalInit.tsx
// REPLACE
"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OneSignalInit() {
  const supabase = createClient();

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId || typeof window === "undefined") return;

    // Prevent duplicate init and lock conflicts
    if ((window as any).__onesignalInit) return;
    (window as any).__onesignalInit = true;

    const init = async () => {
      try {
        const OneSignal = (await import("react-onesignal")).default;

        // Only init if not already initialized
        if ((OneSignal as any).initialized) return;

        await (OneSignal.init as any)({
          appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: "/" },
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await OneSignal.login(user.id);

        const permission = await OneSignal.Notifications.permission;
        if (!permission) {
          // Delay prompt so it does not fire on every page load
          setTimeout(() => {
            try { OneSignal.Slidedown.promptPush(); } catch {}
          }, 5000);
        }
      } catch (err: any) {
        // Silently ignore - OneSignal errors should not break the app
        if (!err?.message?.includes("configured")) {
          console.warn("OneSignal:", err?.message);
        }
      }
    };

    init();
  }, []);

  return null;
}