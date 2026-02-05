/**
 * Profile Phone Section Component
 */

import { useState, useEffect } from "react";
import { Card, Button } from "@/components";
import { FormField } from "@/components/FormField";
import { Heading } from "@/components/typography/Typography";
import { THEME_CONSTANTS } from "@/constants/theme";
import { apiClient } from "@/lib/api-client";
import {
  initializeRecaptcha,
  clearRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  formatPhoneNumber,
  isValidPhoneNumber,
} from "@/lib/firebase/phone-verification";
import type { ConfirmationResult } from "firebase/auth";

interface PhoneSectionProps {
  currentPhone?: string | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ProfilePhoneSection({
  currentPhone,
  onSuccess,
  onError,
}: PhoneSectionProps) {
  const { themed } = THEME_CONSTANTS;
  const [phoneNumber, setPhoneNumber] = useState(currentPhone || "");
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  useEffect(() => {
    try {
      initializeRecaptcha("recaptcha-container");
    } catch (error) {
      console.error("reCAPTCHA initialization error:", error);
    }
    return () => clearRecaptcha();
  }, []);

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      onError("Please enter a phone number");
      return;
    }

    const formatted = formatPhoneNumber(phoneNumber);
    if (!isValidPhoneNumber(formatted)) {
      onError("Please enter a valid phone number with country code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/profile/add-phone", {
        phoneNumber: formatted,
      });

      if (!response.success) {
        throw new Error(response.error || "Validation failed");
      }

      const appVerifier = (window as any).recaptchaVerifier;
      const result = await sendPhoneOTP(formatted, appVerifier);
      setConfirmationResult(result);
      setShowOtpInput(true);
      onSuccess("OTP sent successfully!");
    } catch (error: any) {
      onError(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!confirmationResult || !otpCode) {
      onError("Please enter the OTP code");
      return;
    }

    setIsLoading(true);
    try {
      await verifyPhoneOTP(confirmationResult, otpCode);

      const response = await apiClient.post("/api/profile/verify-phone", {
        phoneNumber: formatPhoneNumber(phoneNumber),
      });

      if (response.success) {
        onSuccess("Phone number verified successfully!");
        setShowOtpInput(false);
        setOtpCode("");
      } else {
        throw new Error(response.error || "Verification failed");
      }
    } catch (error: any) {
      onError(error.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={themed.bgSecondary}>
      <Heading level={3} className={themed.textPrimary}>
        Phone Number
      </Heading>

      <div className="space-y-4 mt-4">
        <FormField
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="+1234567890"
          disabled={!!currentPhone}
        />

        {!showOtpInput && !currentPhone && (
          <>
            <div id="recaptcha-container" />
            <Button onClick={handleSendOTP} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </Button>
          </>
        )}

        {showOtpInput && (
          <>
            <FormField
              label="OTP Code"
              name="otpCode"
              value={otpCode}
              onChange={setOtpCode}
              placeholder="123456"
            />
            <Button onClick={handleVerifyOTP} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
