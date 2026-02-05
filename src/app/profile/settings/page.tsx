/**
 * Profile Settings Page
 * Path: /profile/settings
 *
 * Comprehensive user profile management:
 * - General: Display name, photo, email status
 * - Security: Password change, phone verification
 * - Account: Delete account
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@/components";
import Alert from "@/components/feedback/Alert";
import { FormField } from "@/components/FormField";
import { Heading } from "@/components/typography/Typography";
import { useAuth } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants/theme";
import { ERROR_MESSAGES } from "@/constants/messages";
import { apiClient } from "@/lib/api-client";
import { uploadProfilePhoto } from "@/lib/firebase/storage";
import {
  initializeRecaptcha,
  clearRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  addPhoneToUser,
  formatPhoneNumber,
  isValidPhoneNumber,
} from "@/lib/firebase/phone-verification";
import type { ConfirmationResult } from "firebase/auth";

type Tab = "general" | "security" | "account";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { themed } = THEME_CONSTANTS;

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // General tab state
  const [displayName, setDisplayName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  // Account tab state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setPhotoPreview(user.photoURL || null);
      setPhoneNumber(user.phoneNumber || "");
    }
  }, [user]);

  // Initialize reCAPTCHA on mount
  useEffect(() => {
    if (activeTab === "security") {
      try {
        initializeRecaptcha("recaptcha-container");
      } catch (error) {
        console.error("reCAPTCHA initialization error:", error);
      }
    }

    return () => {
      clearRecaptcha();
    };
  }, [activeTab]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      let photoURL = user.photoURL;

      // Upload photo if changed
      if (photoFile) {
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      }

      // Update profile via API
      const response = await apiClient.post("/api/profile/update", {
        displayName,
        photoURL,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        throw new Error(response.error || "Failed to update profile");
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post("/api/profile/update-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(response.error || "Failed to change password");
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!isValidPhoneNumber(phoneNumber)) {
      setMessage({
        type: "error",
        text: "Invalid phone number. Include country code (e.g., +1234567890)",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Validate phone number via API
      const validation = await apiClient.post("/api/profile/add-phone", {
        phoneNumber,
      });

      if (!validation.success) {
        throw new Error(validation.error || "Phone validation failed");
      }

      // Send OTP via Firebase
      const recaptchaVerifier = initializeRecaptcha("recaptcha-container");
      const confirmation = await addPhoneToUser(
        user as any,
        phoneNumber,
        recaptchaVerifier,
      );

      setConfirmationResult(confirmation);
      setShowOtpInput(true);
      setMessage({
        type: "success",
        text: "OTP sent! Check your phone for the 6-digit code.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to send OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      // Verify OTP with Firebase
      await verifyPhoneOTP(confirmationResult, otpCode);

      // Confirm verification with API
      const response = await apiClient.post("/api/profile/verify-phone", {
        phoneNumber,
        verified: true,
      });

      if (response.success) {
        setMessage({
          type: "success",
          text: "Phone number verified successfully!",
        });
        setShowOtpInput(false);
        setOtpCode("");
      } else {
        throw new Error(response.error || "Verification failed");
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to verify OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (deleteConfirmation !== "DELETE") {
      setMessage({
        type: "error",
        text: "Please type DELETE to confirm account deletion",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Delete account API call - body needs to be in options.body
      const response = await apiClient.delete("/api/profile/delete-account", {
        body: JSON.stringify({
          password: deletePassword,
          confirmation: "DELETE",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.success) {
        setMessage({
          type: "success",
          text: "Account deleted successfully. Redirecting...",
        });

        // Sign out and redirect
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        throw new Error(response.error || "Failed to delete account");
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div
        className={`min-h-screen ${themed.bgPrimary} flex items-center justify-center`}
      >
        <Heading variant="primary">Loading...</Heading>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Heading level={1} variant="primary" className="mb-2">
            Profile Settings
          </Heading>
          <Heading variant="secondary" className={themed.textSecondary}>
            Manage your account settings and preferences
          </Heading>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          {(["general", "security", "account"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium capitalize ${
                activeTab === tab
                  ? `border-b-2 border-blue-500 ${themed.textPrimary}`
                  : themed.textSecondary
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6">
            <Alert variant={message.type as "success" | "error"}>
              {message.text}
            </Alert>
          </div>
        )}

        {/* General Tab */}
        {activeTab === "general" && (
          <Card>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <Heading level={2} variant="primary" className="mb-4">
                General Information
              </Heading>

              {/* Profile Photo */}
              <div>
                <label className={`block mb-2 ${themed.textPrimary}`}>
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className={themed.textSecondary}
                  />
                </div>
              </div>

              {/* Display Name */}
              <FormField
                name="displayName"
                label="Display Name"
                type="text"
                value={displayName}
                onChange={(value: string) => setDisplayName(value)}
                required
              />

              {/* Email (read-only) */}
              <FormField
                name="email"
                label="Email"
                type="email"
                value={user?.email || ""}
                onChange={() => {}}
                disabled
              />

              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <Heading level={2} variant="primary" className="mb-4">
                  Change Password
                </Heading>

                <FormField
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(value: string) => setCurrentPassword(value)}
                  required
                />

                <FormField
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(value: string) => setNewPassword(value)}
                  required
                />

                <FormField
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(value: string) => setConfirmPassword(value)}
                  required
                />

                <Button type="submit" variant="primary" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Card>

            {/* Phone Verification */}
            <Card>
              <div className="space-y-6">
                <Heading level={2} variant="primary" className="mb-4">
                  Phone Verification
                </Heading>

                {user.phoneNumber ? (
                  <div className={themed.textPrimary}>
                    <Heading variant="secondary" className="mb-2">
                      Current phone number:
                    </Heading>
                    <Heading variant="primary">
                      {formatPhoneNumber(user.phoneNumber)}
                    </Heading>
                  </div>
                ) : (
                  <form onSubmit={handleSendOTP} className="space-y-6">
                    <FormField
                      name="phoneNumber"
                      label="Phone Number"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(value: string) => setPhoneNumber(value)}
                      required
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  </form>
                )}

                {showOtpInput && (
                  <form onSubmit={handleVerifyOTP} className="space-y-6 mt-4">
                    <FormField
                      name="otpCode"
                      label="Enter 6-Digit OTP"
                      type="text"
                      placeholder="123456"
                      value={otpCode}
                      onChange={(value: string) => setOtpCode(value)}
                      required
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </form>
                )}

                {/* reCAPTCHA container */}
                <div id="recaptcha-container"></div>
              </div>
            </Card>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <Card>
            <form onSubmit={handleDeleteAccount} className="space-y-6">
              <Heading
                level={2}
                variant="primary"
                className="mb-4 text-red-600"
              >
                Delete Account
              </Heading>

              <Alert variant="error">
                Warning: This action is permanent and cannot be undone. All your
                data will be deleted.
              </Alert>

              <FormField
                name="deletePassword"
                label="Password"
                type="password"
                value={deletePassword}
                onChange={(value: string) => setDeletePassword(value)}
                required
              />

              <FormField
                name="searchField"
                label="Type DELETE to confirm"
                type="text"
                placeholder="DELETE"
                value={deleteConfirmation}
                onChange={(value: string) => setDeleteConfirmation(value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || deleteConfirmation !== "DELETE"}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLoading ? "Deleting..." : "Delete Account Permanently"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
