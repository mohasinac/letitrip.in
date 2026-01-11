"use client";

/**
 * MFA Verification Component
 *
 * Handles second-factor verification during sign-in
 * When user encounters MFA challenge, this component verifies the code
 */

import { cn } from "@/lib/utils";
import { authMFAService } from "@/services/auth-mfa-service";
import { MultiFactorResolver } from "firebase/auth";
import { AlertCircle, Key, Shield, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

export interface MFAVerificationProps {
  resolver: MultiFactorResolver;
  onVerificationComplete?: () => void;
  onVerificationError?: (error: Error) => void;
  onCancel?: () => void;
  className?: string;
}

export function MFAVerification({
  resolver,
  onVerificationComplete,
  onVerificationError,
  onCancel,
  className,
}: MFAVerificationProps) {
  const [selectedFactorIndex, setSelectedFactorIndex] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFactor = resolver.hints[selectedFactorIndex];
  const isPhoneFactor = selectedFactor?.factorId === "phone";
  const isTotpFactor = selectedFactor?.factorId === "totp";

  // Initialize reCAPTCHA for phone MFA
  useEffect(() => {
    if (typeof window !== "undefined" && isPhoneFactor) {
      try {
        authMFAService.initializeRecaptcha("recaptcha-container-verify");
      } catch (err) {
        console.error("Failed to initialize reCAPTCHA:", err);
      }
    }

    return () => {
      authMFAService.clearRecaptcha();
    };
  }, [isPhoneFactor]);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authMFAService.signInWithMFA({
        verificationCode,
        resolver,
        selectedFactorIndex,
      });

      onVerificationComplete?.();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Verification failed";
      setError(errorMessage);
      onVerificationError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleFactorChange = (index: number) => {
    setSelectedFactorIndex(index);
    setVerificationCode("");
    setError(null);
  };

  const handleCodeChange = (value: string) => {
    // Only allow digits, max 6 characters
    const cleaned = value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(cleaned);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && verificationCode.length === 6 && !loading) {
      handleVerify();
    }
  };

  return (
    <div className={cn("max-w-md mx-auto", className)}>
      <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Two-Factor Verification
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verify your identity to continue
            </p>
          </div>
        </div>

        {/* Factor Selection (if multiple factors) */}
        {resolver.hints.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose verification method:
            </label>
            <div className="space-y-2">
              {resolver.hints.map((hint, index) => (
                <button
                  key={hint.uid}
                  onClick={() => handleFactorChange(index)}
                  className={cn(
                    "w-full p-3 border-2 rounded-lg text-left transition-colors",
                    selectedFactorIndex === index
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {hint.factorId === "phone" ? (
                      <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {hint.displayName ||
                          (hint.factorId === "phone"
                            ? "SMS"
                            : "Authenticator App")}
                      </div>
                      {hint.factorId === "phone" &&
                        (hint as any).phoneNumber && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {(hint as any).phoneNumber}
                          </div>
                        )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Factor Info (single factor) */}
        {resolver.hints.length === 1 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              {isPhoneFactor ? (
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFactor?.displayName ||
                    (isPhoneFactor ? "SMS Verification" : "Authenticator App")}
                </div>
                {isPhoneFactor && (selectedFactor as any).phoneNumber && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Code sent to {(selectedFactor as any).phoneNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Verification Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isPhoneFactor
              ? "Enter the code sent to your phone"
              : "Enter the code from your authenticator app"}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={verificationCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="123456"
            maxLength={6}
            autoComplete="one-time-code"
            autoFocus
            disabled={loading}
            className={cn(
              "w-full px-4 py-3 border rounded-lg text-center text-2xl tracking-widest font-mono",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
              error
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600",
              loading && "opacity-50 cursor-not-allowed"
            )}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            {isPhoneFactor
              ? "Check your phone for the SMS code"
              : "Open your authenticator app to get the code"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={loading || verificationCode.length !== 6}
            className={cn(
              "w-full px-4 py-3 rounded-lg font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              loading || verificationCode.length !== 6
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
            )}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
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
                Verifying...
              </span>
            ) : (
              "Verify & Continue"
            )}
          </button>

          {onCancel && (
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isPhoneFactor ? (
              <>
                Didn't receive the code?{" "}
                <button className="text-blue-600 dark:text-blue-400 hover:underline">
                  Resend code
                </button>
              </>
            ) : (
              <>
                Lost access to your authenticator app?{" "}
                <button className="text-blue-600 dark:text-blue-400 hover:underline">
                  Contact support
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container-verify"></div>
    </div>
  );
}

export default MFAVerification;
