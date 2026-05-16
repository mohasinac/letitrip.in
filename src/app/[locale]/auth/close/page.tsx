"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-15: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-15) */
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Text } from "@mohasinac/appkit";

export default function Page() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const uid = searchParams.get("uid");
  const role = searchParams.get("role");
  const isNew = searchParams.get("isNew") === "1";

  useEffect(() => {
    // Always signal the opener — this is the postMessage fallback for when
    // the RTDB signal channel is unavailable or fires after the popup closes.
    try {
      if (error) {
        window.opener?.postMessage(
          { type: "letitrip_auth_close", status: "error", error: decodeURIComponent(error) },
          window.location.origin,
        );
      } else {
        window.opener?.postMessage(
          { type: "letitrip_auth_close", status: "success", uid, role, isNewUser: isNew },
          window.location.origin,
        );
      }
    } catch {
      // opener may be gone or cross-origin — non-fatal
    }

    if (error) return;
    const t = setTimeout(() => window.close(), 200);
    return () => clearTimeout(t);
  }, [error, uid, role, isNew]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <Text className="text-lg font-semibold text-rose-600">Sign-in failed</Text>
          <Text className="text-sm text-zinc-500">{decodeURIComponent(error)}</Text>
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 transition-colors"
          >
            Close window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Text className="text-sm text-zinc-400">Signing in… closing window</Text>
    </div>
  );
}
