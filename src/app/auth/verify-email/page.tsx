"use client";

/**
 * Email Verification Page
 *
 * Refactored to use API client and hooks
 */

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Button, Alert } from "@/components";
import { Heading, Text } from "@/components/typography";
import {
  onAuthStateChanged,
  getCurrentUser,
} from "@/lib/firebase/auth-helpers";
import { ROUTES, UI_LABELS } from "@/constants";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [tokenError, setTokenError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Firebase Auth handles email verification automatically
    // Just check if user is authenticated and email is verified
    const checkVerification = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          await user.reload(); // Refresh user data
          if (user.emailVerified) {
            setIsSuccess(true);
          } else {
            setError("Email not yet verified. Please check your email.");
          }
        } else {
          setError("Please sign in to verify your email.");
        }
      } catch (err: any) {
        setError(err.message || "Verification check failed");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      // Token is in URL (from email link)
      checkVerification();
    } else {
      setTokenError("No verification token provided");
      setIsLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full p-8 text-center">
        {isLoading && (
          <>
            <div className="mb-4 text-blue-500">
              <svg
                className="w-16 h-16 mx-auto animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <Heading level={4} className="mb-2">
              Verifying Your Email
            </Heading>
            <Text className="text-gray-600">
              Please wait while we verify your email address...
            </Text>
          </>
        )}

        {isSuccess && (
          <>
            <div className="mb-4 text-green-500">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <Heading level={4} className="mb-2">
              Email Verified!
            </Heading>
            <Text className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now access all
              features of your account.
            </Text>
            <Button
              variant="primary"
              onClick={() => router.push(ROUTES.USER.PROFILE)}
              className="w-full"
            >
              Go to Profile
            </Button>
          </>
        )}

        {(error || tokenError) && (
          <>
            <div className="mb-4 text-red-500">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <Heading level={4} className="mb-2">
              Verification Failed
            </Heading>
            <Alert variant="error" className="mb-6">
              {error || tokenError}
            </Alert>
            <Text className="text-gray-600 mb-6">
              The verification link may have expired or is invalid. Please
              request a new verification email.
            </Text>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => router.push(ROUTES.USER.PROFILE)}
                className="w-full"
              >
                Go to Profile
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push(ROUTES.HOME)}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          {UI_LABELS.LOADING.DEFAULT}
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
