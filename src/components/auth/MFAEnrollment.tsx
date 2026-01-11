"use client";

/**
 * MFA Enrollment Component
 * 
 * Allows users to enroll in Multi-Factor Authentication (MFA)
 * Supports both Phone (SMS) and TOTP (Authenticator App) methods
 */

import { useState, useEffect } from "react";
import { authMFAService, MFAFactorInfo } from "@/services/auth-mfa-service";
import { TotpSecret } from "firebase/auth";
import { Smartphone, Shield, Key, Trash2, QrCode, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MFAEnrollmentProps {
  onEnrollmentComplete?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

type EnrollmentStep = "select" | "phone-verify" | "totp-setup" | "totp-verify";
type MFAMethod = "phone" | "totp";

export function MFAEnrollment({
  onEnrollmentComplete,
  onError,
  className,
}: MFAEnrollmentProps) {
  // State
  const [step, setStep] = useState<EnrollmentStep>("select");
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod | null>(null);
  const [enrolledFactors, setEnrolledFactors] = useState<MFAFactorInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phone MFA state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneDisplayName, setPhoneDisplayName] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [phoneCode, setPhoneCode] = useState("");

  // TOTP MFA state
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [totpDisplayName, setTotpDisplayName] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [secretCopied, setSecretCopied] = useState(false);

  // Load enrolled factors
  useEffect(() => {
    loadEnrolledFactors();
  }, []);

  // Initialize reCAPTCHA for phone MFA
  useEffect(() => {
    if (typeof window !== "undefined" && selectedMethod === "phone") {
      try {
        authMFAService.initializeRecaptcha("recaptcha-container");
      } catch (err) {
        console.error("Failed to initialize reCAPTCHA:", err);
      }
    }
  }, [selectedMethod]);

  const loadEnrolledFactors = async () => {
    try {
      const factors = await authMFAService.getEnrolledFactors();
      setEnrolledFactors(factors);
    } catch (err) {
      console.error("Failed to load enrolled factors:", err);
    }
  };

  const handleMethodSelect = (method: MFAMethod) => {
    setSelectedMethod(method);
    setError(null);

    if (method === "phone") {
      setStep("phone-verify");
    } else {
      enrollTOTP();
    }
  };

  const enrollPhone = async () => {
    if (!phoneNumber) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authMFAService.enrollPhoneMFA({
        phoneNumber,
        displayName: phoneDisplayName || undefined,
      });

      setVerificationId(result.verificationId);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send verification code";
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async () => {
    if (!phoneCode || phoneCode.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authMFAService.verifyPhoneMFA({
        verificationId,
        verificationCode: phoneCode,
      });

      await loadEnrolledFactors();
      resetForm();
      onEnrollmentComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to verify code";
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const enrollTOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authMFAService.enrollTotpMFA(totpDisplayName || undefined);

      setTotpSecret(result.totpSecret);
      setQrCodeUrl(result.qrCodeUrl);
      setSecretKey(result.secretKey);
      setStep("totp-setup");
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate TOTP secret";
      setError(errorMessage);
      onError?.(err as Error);
      setStep("select");
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError("Please enter a 6-digit code from your authenticator app");
      return;
    }

    if (!totpSecret) {
      setError("TOTP secret not found. Please start over.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authMFAService.verifyTotpMFA(totpSecret, {
        verificationCode: totpCode,
        displayName: totpDisplayName || undefined,
      });

      await loadEnrolledFactors();
      resetForm();
      onEnrollmentComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to verify code";
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const unenrollFactor = async (factorUid: string) => {
    if (!confirm("Are you sure you want to remove this MFA method?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authMFAService.unenrollMFA({ factorUid });
      await loadEnrolledFactors();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove MFA method";
      setError(errorMessage);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const resetForm = () => {
    setStep("select");
    setSelectedMethod(null);
    setPhoneNumber("");
    setPhoneDisplayName("");
    setVerificationId("");
    setPhoneCode("");
    setTotpSecret(null);
    setQrCodeUrl("");
    setSecretKey("");
    setTotpDisplayName("");
    setTotpCode("");
    setSecretCopied(false);
    setError(null);
  };

  return (
    <div className={cn("max-w-2xl", className)}>
      {/* Enrolled Factors */}
      {enrolledFactors.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Enrolled MFA Methods
          </h3>
          <div className="space-y-2">
            {enrolledFactors.map((factor) => (
              <div
                key={factor.uid}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {factor.factorId === "phone" ? (
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {factor.displayName || (factor.factorId === "phone" ? "Phone" : "Authenticator")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {factor.phoneNumber || `Enrolled ${new Date(factor.enrollmentTime).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => unenrollFactor(factor.uid)}
                  disabled={loading}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Remove this MFA method"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Method Selection */}
      {step === "select" && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Add New MFA Method
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Choose how you'd like to secure your account with multi-factor authentication
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Phone MFA */}
            <button
              onClick={() => handleMethodSelect("phone")}
              disabled={loading}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                SMS / Phone
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive verification codes via SMS to your mobile phone
              </p>
            </button>

            {/* TOTP MFA */}
            <button
              onClick={() => handleMethodSelect("totp")}
              disabled={loading}
              className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Key className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Authenticator App
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use Google Authenticator, Authy, or similar apps
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Phone Verification */}
      {step === "phone-verify" && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Setup Phone MFA
          </h2>

          {!verificationId ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Include country code (e.g., +1 for US)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={phoneDisplayName}
                  onChange={(e) => setPhoneDisplayName(e.target.value)}
                  placeholder="My Phone"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={enrollPhone}
                  disabled={loading || !phoneNumber}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the 6-digit code sent to {phoneNumber}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={verifyPhone}
                  disabled={loading || phoneCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOTP Setup */}
      {step === "totp-setup" && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Setup Authenticator App
          </h2>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>Step 1:</strong> Install an authenticator app on your phone (Google Authenticator, Authy, Microsoft Authenticator, etc.)
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Step 2:</strong> Scan the QR code below or manually enter the secret key
              </p>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <QrCode className="w-6 h-6 text-gray-400" />
                <img
                  src={qrCodeUrl}
                  alt="QR Code for TOTP setup"
                  className="w-64 h-64 border-4 border-gray-200 dark:border-gray-700 rounded-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Scan this QR code with your authenticator app
                </p>
              </div>
            )}

            {/* Manual Entry */}
            {secretKey && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or enter this code manually:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={secretKey}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <button
                    onClick={copySecretKey}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    title="Copy secret key"
                  >
                    {secretCopied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name (Optional)
              </label>
              <input
                type="text"
                value={totpDisplayName}
                onChange={(e) => setTotpDisplayName(e.target.value)}
                placeholder="My Authenticator"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => setStep("totp-verify")}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Continue to Verification
            </button>

            <button
              onClick={resetForm}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TOTP Verification */}
      {step === "totp-verify" && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Verify Authenticator App
          </h2>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={verifyTOTP}
                disabled={loading || totpCode.length !== 6}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </button>
              <button
                onClick={() => setStep("totp-setup")}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default MFAEnrollment;
