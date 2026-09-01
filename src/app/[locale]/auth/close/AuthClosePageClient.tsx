"use client";
import { normalizeError } from "@mohasinac/appkit/client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Row, Stack, Text } from "@mohasinac/appkit/ui";
const __P = {
  p6: "p-[var(--appkit-space-6)]",
} as const;

export function AuthClosePageClient() {
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
      // audit-silent-degrade-ok: the opener is the window that started the
      // OAuth popup. By this point the user may have closed it, or navigated it
      // cross-origin — postMessage then throws, and there is no one left to
      // tell. Nothing downstream reads the result.
    } catch (_err) {
      void normalizeError(_err);
    }

    if (error) return;
    const t = setTimeout(() => window.close(), 200);
    return () => clearTimeout(t);
  }, [error, uid, role, isNew]);

  if (error) {
    return (
      <Row className={`min-h-screen ${__P.p6} text-center`} align="center" justify="center">
        <Stack gap="3">
          <Text className="text-error" size="lg" weight="semibold">Sign-in failed</Text>
          <Text size="sm" color="muted">{decodeURIComponent(error)}</Text>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.close()}
            className="mt-4"
          >
            Close window
          </Button>
        </Stack>
      </Row>
    );
  }

  return (
    <Row className="min-h-screen" align="center" justify="center">
      <Text size="sm" color="faint">Signing in… closing window</Text>
    </Row>
  );
}
