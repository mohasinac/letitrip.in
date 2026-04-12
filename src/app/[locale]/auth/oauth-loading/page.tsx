"use client";

/**
 * /auth/oauth-loading — OAuth popup relay page
 *
 * Opened synchronously as the initial popup URL (inside the user-gesture) so
 * browsers don't treat window.open() as a popup to block.
 *
 * After the async auth-event init completes, the opener posts:
 *   { url: string }  — the full /api/auth/{provider}/start?eventId=... URL
 *
 * This page also fires { type: 'oauth_ready' } to window.opener as soon as
 * its message listener is registered, so the opener can re-send the URL if it
 * was ready before this page loaded.
 *
 * Security:
 *  - Only reacts to messages from the same origin.
 *  - Only navigates to same-origin /api/auth/ paths.
 */

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Text, Spinner, Stack } from "@mohasinac/appkit/ui";

export default function OAuthLoadingPage() {
  const t = useTranslations("auth.oauth");

  useEffect(() => {
    const origin = window.location.origin;

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const url = event.data?.url;
      if (typeof url === "string" && url.startsWith(`${origin}/api/auth/`)) {
        window.location.replace(url);
      }
    };

    window.addEventListener("message", handleMessage);

    // Tell the opener we are ready to receive the navigation URL.
    // If the opener already has the URL it will send it immediately;
    // otherwise it will send it once initAuthEvent() resolves.
    if (window.opener) {
      window.opener.postMessage({ type: "oauth_ready" }, origin);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <Stack align="center" className="min-h-screen gap-4">
      <Spinner size="xl" variant="primary" />
      <Text variant="secondary">{t("redirecting")}</Text>
    </Stack>
  );
}
