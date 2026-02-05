"use client";

/**
 * User Profile Page
 *
 * Refactored to use centralized API client, hooks, and reusable components
 */

import { useState, useEffect } from "react";
import { Card, Button, Alert } from "@/components";
import { FormField } from "@/components/FormField";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { Heading, Text } from "@/components/typography";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useChangePassword, useResendVerification } from "@/hooks/useAuth";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";

function ProfilePageContent() {
  // Fetch profile data
  const { data: profile, isLoading, refetch } = useProfile();

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState<
    Record<string, boolean>
  >({});

  // Messages
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setPhoneNumber(profile.phoneNumber || "");
      setPhotoURL(profile.photoURL || "");
    }
  }, [profile]);

  // Update profile mutation
  const { mutate: updateProfile, isLoading: isSaving } = useUpdateProfile({
    onSuccess: async () => {
      setMessage({
        type: "success",
        text: SUCCESS_MESSAGES.USER.PROFILE_UPDATED,
      });
      await refetch();
    },
    onError: (error) => {
      setMessage({
        type: "error",
        text: error.message || ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    },
  });

  // Change password mutation
  const { mutate: changePassword, isLoading: isChangingPassword } =
    useChangePassword({
      onSuccess: () => {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordTouched({});
        setShowPasswordForm(false);
      },
      onError: (error) => {
        setMessage({
          type: "error",
          text: error.message || ERROR_MESSAGES.PASSWORD.CHANGE_FAILED,
        });
      },
    });

  // Resend verification mutation
  const { mutate: resendVerification, isLoading: isSendingVerification } =
    useResendVerification({
      onSuccess: () => {
        setMessage({
          type: "success",
          text: SUCCESS_MESSAGES.EMAIL.VERIFICATION_SENT,
        });
      },
      onError: (error) => {
        setMessage({
          type: "error",
          text: error.message || ERROR_MESSAGES.EMAIL.SEND_FAILED,
        });
      },
    });

  // Handlers
  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePasswordBlur = (field: string) => () => {
    setPasswordTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    await updateProfile({
      displayName: displayName.trim(),
      phoneNumber: phoneNumber.trim(),
      photoURL: photoURL.trim(),
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const handleSendVerification = () => {
    setMessage(null);
    if (profile?.email) {
      resendVerification({ email: profile.email });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text>Loading profile...</Text>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Heading level={3} className="mb-6">
        Profile Settings
      </Heading>

      {message && (
        <Alert
          variant={message.type}
          className="mb-4"
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      {/* Profile Information Card */}
      <Card className="mb-6 p-6">
        <Heading level={5} className="mb-4">
          Profile Information
        </Heading>

        <form onSubmit={handleUpdateProfile}>
          <div className="space-y-4">
            <div>
              <FormField
                label="Email"
                name="email"
                type="email"
                value={profile?.email || ""}
                onChange={() => {}}
                disabled
                helpText={
                  profile?.emailVerified
                    ? "✓ Verified"
                    : "⚠ Not verified - Check your inbox or resend verification"
                }
              />
              {!profile?.emailVerified && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSendVerification}
                  disabled={isSendingVerification}
                  className="mt-2"
                >
                  {isSendingVerification
                    ? "Sending..."
                    : "Send Verification Email"}
                </Button>
              )}
            </div>

            <FormField
              label="Display Name"
              name="displayName"
              type="text"
              value={displayName}
              onChange={setDisplayName}
              onBlur={handleBlur("displayName")}
              touched={touched.displayName}
              disabled={isSaving}
              placeholder="Enter your name"
            />

            <FormField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={setPhoneNumber}
              onBlur={handleBlur("phoneNumber")}
              touched={touched.phoneNumber}
              disabled={isSaving}
              placeholder="+1234567890"
            />

            <FormField
              label="Photo URL"
              name="photoURL"
              type="text"
              value={photoURL}
              onChange={setPhotoURL}
              onBlur={handleBlur("photoURL")}
              touched={touched.photoURL}
              disabled={isSaving}
              placeholder="https://example.com/photo.jpg"
            />

            <FormField
              label="Role"
              name="role"
              type="text"
              value={profile?.role || "user"}
              onChange={() => {}}
              disabled
              helpText="Your account role (read-only)"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Heading level={5}>Change Password</Heading>
          {!showPasswordForm && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPasswordForm(true)}
            >
              Change Password
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4">
              <FormField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(value) =>
                  setPasswordData({ ...passwordData, currentPassword: value })
                }
                onBlur={handlePasswordBlur("currentPassword")}
                touched={passwordTouched.currentPassword}
                disabled={isChangingPassword}
                placeholder="Enter current password"
                required
              />

              <FormField
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(value) =>
                  setPasswordData({ ...passwordData, newPassword: value })
                }
                onBlur={handlePasswordBlur("newPassword")}
                touched={passwordTouched.newPassword}
                disabled={isChangingPassword}
                placeholder="Enter new password"
                required
              />

              {passwordData.newPassword && (
                <PasswordStrengthIndicator
                  password={passwordData.newPassword}
                />
              )}

              <FormField
                label="Confirm New Password"
                name="confirmNewPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(value) =>
                  setPasswordData({ ...passwordData, confirmPassword: value })
                }
                onBlur={handlePasswordBlur("confirmPassword")}
                touched={passwordTouched.confirmPassword}
                error={
                  passwordData.confirmPassword &&
                  passwordData.newPassword !== passwordData.confirmPassword
                    ? "Passwords do not match"
                    : undefined
                }
                disabled={isChangingPassword}
                placeholder="Confirm new password"
                required
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPasswordTouched({});
                    setMessage(null);
                  }}
                  disabled={isChangingPassword}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfilePageContent />
    </ProtectedRoute>
  );
}
