"use client";

import { useAuth } from "@/contexts/AuthContext";
import { logError } from "@/lib/error-logger";
import { otpService } from "@/services/otp.service";
import React, { useEffect, useState } from "react";
import { EmailVerificationModal } from "./EmailVerificationModal";
import { PhoneVerificationModal } from "./PhoneVerificationModal";

interface VerificationGateProps {
  children: React.ReactNode;
  requireEmail?: boolean;
  requirePhone?: boolean;
  message?: string;
  actionName?: string; // e.g., "checkout", "place bid"
}

/**
 * Verification Gate Component
 *
 * Blocks unverified users from sensitive actions
 *
 * Features:
 * - Check email/phone verification status
 * - Show verification modal if required
 * - Customizable messages
 * - Dark mode support
 * - Mobile responsive
 *
 * Usage:
 * ```tsx
 * <VerificationGate requireEmail requirePhone actionName="checkout">
 *   <CheckoutForm />
 * </VerificationGate>
 * ```
 */
export function VerificationGate({
  children,
  requireEmail = false,
  requirePhone = false,
  message,
  actionName = "proceed",
}: VerificationGateProps) {
  const { user } = useAuth();
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkVerificationStatus();
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user) {
      setChecking(false);
      return;
    }

    setChecking(true);

    try {
      // Check email verification if required
      if (requireEmail) {
        const isEmailVerified = await otpService.isVerified(user.id, "email");
        setEmailVerified(isEmailVerified);
      } else {
        setEmailVerified(true); // Not required
      }

      // Check phone verification if required
      if (requirePhone) {
        const isPhoneVerified = await otpService.isVerified(user.id, "phone");
        setPhoneVerified(isPhoneVerified);
      } else {
        setPhoneVerified(true); // Not required
      }
    } catch (error) {
      logError(error as Error, {
        component: "VerificationGate.checkStatus",
        metadata: { message: "Failed to check verification status" },
      });
    } finally {
      setChecking(false);
    }
  };

  const handleEmailVerified = () => {
    setEmailVerified(true);
    setShowEmailModal(false);
  };

  const handlePhoneVerified = () => {
    setPhoneVerified(true);
    setShowPhoneModal(false);
  };

  // Show loading state
  if (checking) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Show verification required message
  if (!emailVerified || !phoneVerified) {
    const defaultMessage = `Please verify your ${
      !emailVerified ? "email" : ""
    }${!emailVerified && !phoneVerified ? " and " : ""}${
      !phoneVerified ? "phone number" : ""
    } to ${actionName}.`;

    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start">
          {/* Warning Icon */}
          <svg
            className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>

          <div className="flex-1">
            {/* Title */}
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Verification Required
            </h3>

            {/* Message */}
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              {message || defaultMessage}
            </p>

            {/* Verification Buttons */}
            <div className="flex flex-wrap gap-3">
              {!emailVerified && user?.email && (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                    transition-colors duration-200"
                >
                  Verify Email
                </button>
              )}

              {!phoneVerified && user?.phone && (
                <button
                  onClick={() => setShowPhoneModal(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
                    transition-colors duration-200"
                >
                  Verify Phone
                </button>
              )}
            </div>

            {/* Missing contact info warning */}
            {(!user?.email && requireEmail) ||
            (!user?.phone && requirePhone) ? (
              <p className="mt-4 text-sm text-yellow-700 dark:text-yellow-300">
                Please update your profile with{" "}
                {!user?.email && requireEmail ? "email" : ""}
                {!user?.email && !user?.phone && requireEmail && requirePhone
                  ? " and "
                  : ""}
                {!user?.phone && requirePhone ? "phone number" : ""} first.
              </p>
            ) : null}
          </div>
        </div>

        {/* Modals */}
        {user?.email && (
          <EmailVerificationModal
            isOpen={showEmailModal}
            onClose={() => setShowEmailModal(false)}
            userId={user.id}
            email={user.email}
            onVerified={handleEmailVerified}
          />
        )}

        {user?.phone && (
          <PhoneVerificationModal
            isOpen={showPhoneModal}
            onClose={() => setShowPhoneModal(false)}
            userId={user.id}
            phoneNumber={user.phone}
            onVerified={handlePhoneVerified}
          />
        )}
      </div>
    );
  }

  // All verifications passed, show children
  return <>{children}</>;
}
