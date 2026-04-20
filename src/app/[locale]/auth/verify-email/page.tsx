"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { VerifyEmailView } from "@mohasinac/appkit/features/auth";
import { FirebaseClientAuthProvider } from "@mohasinac/appkit/providers/firebase-client";
import { ROUTES } from "@mohasinac/appkit/constants";

const authProvider = new FirebaseClientAuthProvider();

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!oobCode) {
      setStatus("error");
      setError("Invalid or missing verification code.");
      return;
    }
    authProvider
      .applyActionCode(oobCode)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed.");
      });
  }, [oobCode]);

  return (
    <VerifyEmailView
      status={status}
      error={error}
      renderContinueButton={() => (
        <button onClick={() => router.push(String(ROUTES.HOME))}>Continue</button>
      )}
    />
  );
}