"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Text, Div, Button } from "@mohasinac/appkit/ui";

const __P = {
  p6: "p-6",
} as const;

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
      <Div className={`flex min-h-screen items-center justify-center ${__P.p6} text-center`}>
        <Div className="space-y-3">
          <Text className="text-error" size="lg" weight="semibold">Sign-in failed</Text>
          <Text className="text-zinc-500 dark:text-zinc-400" size="sm">{decodeURIComponent(error)}</Text>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.close()}
            className="mt-4"
          >
            Close window
          </Button>
        </Div>
      </Div>
    );
  }

  return (
    <Div className="flex min-h-screen items-center justify-center">
      <Text size="sm" color="faint">Signing in… closing window</Text>
    </Div>
  );
}
