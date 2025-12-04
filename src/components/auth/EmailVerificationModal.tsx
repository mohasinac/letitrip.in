"use client";

import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { otpService } from "@/services/otp.service";
import { useEffect, useState } from "react";
import { OTPInput } from "./OTPInput";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  email: string;
  onVerified: () => void;
}

/**
 * Email Verification Modal
 *
 * Features:
 * - Send OTP to user's email
 * - 6-digit OTP input with auto-focus
 * - Resend OTP functionality with countdown
 * - Error handling and validation
 * - Dark mode support
 * - Mobile responsive
 */
export function EmailVerificationModal({
  isOpen,
  onClose,
  userId,
  email,
  onVerified,
}: EmailVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpId, setOtpId] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const { isLoading: sending, execute: executeSend } = useLoadingState({
    onLoadError: (error) => {
      logError(error as Error, {
        component: "EmailVerificationModal.sendOTP",
        metadata: { userId, email },
      });
      setError("Failed to send OTP. Please try again.");
    },
  });

  const { isLoading: verifying, execute: executeVerify } = useLoadingState({
    onLoadError: (error) => {
      logError(error as Error, {
        component: "EmailVerificationModal.verifyOTP",
        metadata: { userId, email },
      });
      setError("Verification failed. Please try again.");
    },
  });

  // Send OTP on mount
  useEffect(() => {
    if (isOpen && !otpId) {
      sendOTP();
    }
  }, [isOpen]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  // Expiry countdown
  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const now = new Date();
      const timeLeft = expiresAt.getTime() - now.getTime();

      if (timeLeft <= 0) {
        setError("OTP expired. Please request a new one.");
        setCanResend(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const sendOTP = async () => {
    setError("");
    setSuccess("");
    setOtp("");

    await executeSend(async () => {
      const result = await otpService.sendOTP({
        userId,
        type: "email",
        destination: email,
      });

      setOtpId(result.id);
      setExpiresAt(result.expiresAt);
      setCanResend(false);
      setResendCountdown(60); // 60 second cooldown
      setSuccess("OTP sent to your email!");
    });
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setError("");
    setSuccess("");

    await executeVerify(async () => {
      const result = await otpService.verifyOTP({
        userId,
        type: "email",
        destination: email,
        otp,
      });

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1500);
      } else {
        setError(result.message);
        setOtp(""); // Clear OTP on error
      }
    });
  };

  const handleResend = async () => {
    if (!canResend) return;
    await sendOTP();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-verification-title"
    >
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            id="email-verification-title"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            Verify Email
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Description */}
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold">{email}</span>
        </p>

        {/* OTP Input */}
        <div className="mb-6">
          <OTPInput
            value={otp}
            onChange={setOtp}
            disabled={verifying}
            error={!!error}
            autoFocus
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            role="alert"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            role="alert"
          >
            <p className="text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          </div>
        )}

        {/* Resend OTP */}
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{" "}
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={sending}
                className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 disabled:opacity-50"
              >
                Resend OTP
              </button>
            ) : (
              <span className="font-semibold text-gray-500 dark:text-gray-400">
                Resend in {resendCountdown}s
              </span>
            )}
          </p>
        </div>

        {/* Verify Button */}
        <button
          onClick={verifyOTP}
          disabled={verifying || otp.length !== 6}
          className="w-full px-4 py-3 text-white bg-primary-600 rounded-lg hover:bg-primary-700 
            disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
            transition-colors duration-200"
        >
          {verifying ? "Verifying..." : "Verify Email"}
        </button>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-3 px-4 py-2 text-gray-700 dark:text-gray-300 
            hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
