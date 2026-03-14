"use client";

/**
 * /auth/close — Popup close page
 *
 * This page is the final redirect target for both Google and Apple OAuth popups.
 * It immediately closes the popup window via window.close().
 *
 * The main window is already listening to the RTDB auth event and will react
 * to the outcome before this page even loads — but we still close as fast as
 * possible so the user doesn't see a dangling popup.
 *
 * Query params:
 *   error  — Optional. If present the popup was opened outside of a valid flow
 *             (e.g. direct navigation). We show a brief message before closing.
 *
 * Wrapped in Suspense because AuthCloseContent uses useSearchParams().
 */

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Text, Spinner } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;

function AuthCloseContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const [closed, setClosed] = useState(false);
  const t = useTranslations("auth.oauth");

  useEffect(() => {
    // Give the parent window a brief tick to read the RTDB event, then close.
    const id = setTimeout(() => {
      if (typeof window !== "undefined" && window.opener) {
        window.close();
      } else {
        // Opened directly (no popup parent) — redirect to home instead
        window.location.replace("/");
      }
      setClosed(true);
    }, 200);

    return () => clearTimeout(id);
  }, []);

  if (closed) return null;

  return (
    <div className={`${flex.center} min-h-screen`}>
      {errorCode ? (
        <Text variant="error">{t("closeError")}</Text>
      ) : (
        <Text variant="secondary">{t("closing")}</Text>
      )}
    </div>
  );
}

export default function AuthClosePage() {
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} min-h-screen`}>
          <Spinner size="sm" />
        </div>
      }
    >
      <AuthCloseContent />
    </Suspense>
  );
}
