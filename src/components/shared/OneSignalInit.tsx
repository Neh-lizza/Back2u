"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!;
export default function OneSignalInit() {
  const supabase = createClient();
  useEffect(() => {
    if (!ONESIGNAL_APP_ID || typeof window === "undefined") return;
    const init = async () => {
      const OneSignal = (await import("react-onesignal")).default;
      await (OneSignal.init as any)({ appId: ONESIGNAL_APP_ID, allowLocalhostAsSecureOrigin: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await OneSignal.login(user.id);
      const permission = await OneSignal.Notifications.permission;
      if (!permission) setTimeout(() => OneSignal.Slidedown.promptPush(), 3000);
    };
    init().catch(console.error);
  }, []);
  return null;
}
