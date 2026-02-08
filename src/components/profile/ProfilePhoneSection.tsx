/**
 * Profile Phone Section Component
 *
 * Allows users to add and verify their phone number (optional).
 * Supports Indian numbers primarily but allows other country codes.
 * NOT used for authentication - only for profile verification.
 */

"use client";

import { useState } from "react";
import { Button, Card } from "@/components";
import { FormField } from "@/components/FormField";
import { apiClient, API_ENDPOINTS } from "@/lib/api-client";
import { THEME_CONSTANTS } from "@/constants";
import { classNames } from "@/helpers";

interface ProfilePhoneSectionProps {
  currentPhone: string | null;
  phoneVerified: boolean;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ProfilePhoneSection({
  currentPhone,
  phoneVerified,
  onSuccess,
  onError,
}: ProfilePhoneSectionProps) {
  const { themed } = THEME_CONSTANTS;
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  const handleAddPhone = async () => {
    if (!phoneNumber.trim()) {
      onError("Please enter a valid phone number");
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s-()]/g, ""))) {
      onError(
        "Please enter a valid phone number with country code (e.g., +919876543210)",
      );
      return;
    }

    setIsAddingPhone(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.PROFILE.ADD_PHONE, {
        phoneNumber: phoneNumber.trim(),
      });

      if (response.verificationId) {
        setVerificationId(response.verificationId);
        setShowVerificationInput(true);
        onSuccess("Verification code sent to your phone!");
      }
    } catch (error: any) {
      onError(error.message || "Failed to add phone number");
    } finally {
      setIsAddingPhone(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      onError("Please enter the 6-digit verification code");
      return;
    }

    if (!verificationId) {
      onError("Verification ID missing. Please request a new code.");
      return;
    }

    setIsVerifying(true);
    try {
      await apiClient.post(API_ENDPOINTS.PROFILE.VERIFY_PHONE, {
        verificationId,
        code: verificationCode,
      });

      onSuccess("Phone number verified successfully!");
      setShowVerificationInput(false);
      setVerificationCode("");
      // Refresh page to update verified status
      // Refresh user data to show updated phone verification status
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error: any) {
      onError(error.message || "Failed to verify phone number");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setVerificationCode("");
    await handleAddPhone();
  };

  return (
    <Card>
      <div className={`p-6 ${THEME_CONSTANTS.spacing.stack}`}>
        <div>
          <h3 className={`text-lg font-semibold ${themed.textPrimary}`}>
            Phone Number
          </h3>
          <p className={`text-sm ${themed.textSecondary} mt-1`}>
            Add and verify your phone number (optional). Primarily for Indian
            numbers (+91).
          </p>
        </div>

        {/* Current Phone Status */}
        {currentPhone && (
          <div
            className={classNames(
              "p-3 rounded-lg",
              phoneVerified
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-yellow-50 dark:bg-yellow-900/20",
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={classNames(
                    "text-sm font-medium",
                    phoneVerified
                      ? "text-green-800 dark:text-green-200"
                      : "text-yellow-800 dark:text-yellow-200",
                  )}
                >
                  {currentPhone}
                </p>
                <p
                  className={classNames(
                    "text-xs",
                    phoneVerified
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400",
                  )}
                >
                  {phoneVerified ? "✓ Verified" : "⚠ Not verified"}
                </p>
              </div>
              {!phoneVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPhoneNumber(currentPhone);
                    handleAddPhone();
                  }}
                  disabled={isAddingPhone}
                >
                  Verify
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Add/Update Phone */}
        {!showVerificationInput && (
          <div className={THEME_CONSTANTS.spacing.stack}>
            <FormField
              label="Phone Number (with country code)"
              name="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={setPhoneNumber}
              disabled={isAddingPhone}
              placeholder="+919876543210"
              helpText="Format: +[country code][number] (e.g., +919876543210 for India)"
            />

            <Button
              variant="primary"
              onClick={handleAddPhone}
              disabled={isAddingPhone || !phoneNumber.trim()}
              className="w-full"
            >
              {isAddingPhone
                ? "Sending code..."
                : currentPhone
                  ? "Update & Verify"
                  : "Add & Verify"}
            </Button>
          </div>
        )}

        {/* Verification Code Input */}
        {showVerificationInput && (
          <div className={`${THEME_CONSTANTS.spacing.stack} border-t pt-4`}>
            <FormField
              label="Verification Code (6 digits)"
              name="verificationCode"
              type="text"
              value={verificationCode}
              onChange={setVerificationCode}
              disabled={isVerifying}
              placeholder="Enter 6-digit code"
            />

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleVerifyCode}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isAddingPhone}
              >
                Resend
              </Button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowVerificationInput(false);
                setVerificationCode("");
                setVerificationId(null);
              }}
              className={`text-sm ${themed.textSecondary} hover:underline`}
            >
              Cancel verification
            </button>
          </div>
        )}

        {/* Info Note */}
        <div className={`text-xs ${themed.textSecondary} border-t pt-4`}>
          <p>
            <strong>Note:</strong> Your phone number is used for profile
            verification only, not for login. You can still sign in using your
            email or OAuth accounts.
          </p>
        </div>
      </div>
    </Card>
  );
}
