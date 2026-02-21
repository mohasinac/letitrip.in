"use client";

import { useState, useEffect } from "react";
import { useAuth, useChangePassword, useResendVerification } from "@/hooks";
import {
  Heading,
  Alert,
  Spinner,
  useToast,
  EmailVerificationCard,
  PhoneVerificationCard,
  ProfileInfoForm,
  PasswordChangeForm,
  AccountInfoCard,
} from "@/components";
import type { ProfileInfoData } from "@/components";
import { useRouter } from "next/navigation";
import { logger } from "@/classes";
import {
  THEME_CONSTANTS,
  UI_LABELS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  API_ENDPOINTS,
  ROUTES,
} from "@/constants";

export default function UserSettingsPage() {
  const { user: profile, loading, refreshUser } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Messages
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !profile) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [profile, loading, router]);

  // Change password mutation
  const { mutate: changePassword, isLoading: isChangingPassword } =
    useChangePassword({
      onSuccess: () => {
        showToast(SUCCESS_MESSAGES.USER.PASSWORD_CHANGED, "success");
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
        showToast(SUCCESS_MESSAGES.EMAIL.VERIFICATION_SENT, "success");
      },
      onError: (error) => {
        setMessage({
          type: "error",
          text: error.message || ERROR_MESSAGES.EMAIL.SEND_FAILED,
        });
      },
    });

  const handleProfileUpdate = async (data: ProfileInfoData) => {
    if (!profile?.uid) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(API_ENDPOINTS.USER.PROFILE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: data.displayName,
          phoneNumber: data.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || ERROR_MESSAGES.USER.UPDATE_FAILED);
      }

      showToast(SUCCESS_MESSAGES.USER.SETTINGS_SAVED, "success");
      await refreshUser();
    } catch (error) {
      logger.error("Profile update error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUploadSuccess = async (url: string) => {
    if (!profile?.uid) return;

    try {
      const response = await fetch(API_ENDPOINTS.USER.PROFILE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photoURL: url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || ERROR_MESSAGES.USER.UPDATE_FAILED);
      }

      showToast(SUCCESS_MESSAGES.USER.SETTINGS_SAVED, "success");
    } catch (error) {
      logger.error("Avatar upload error:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    }
  };

  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    setMessage(null);
    await changePassword({ currentPassword, newPassword });
  };

  const handleResendVerification = () => {
    setMessage(null);
    if (profile?.email) {
      resendVerification({ email: profile.email });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="w-full">
      <div className={THEME_CONSTANTS.spacing.stack}>
        <Heading level={3}>{UI_LABELS.SETTINGS.TITLE}</Heading>

        {/* Error messages (success messages are now toasts) */}
        {message && (
          <Alert
            variant={message.type}
            className="mb-4"
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Email Verification */}
        <EmailVerificationCard
          email={profile.email || ""}
          isVerified={profile.emailVerified || false}
          onResendVerification={handleResendVerification}
          isLoading={isSendingVerification}
        />

        {/* Phone Verification */}
        {profile.phoneNumber && (
          <PhoneVerificationCard
            phone={profile.phoneNumber}
            isVerified={profile.phoneVerified || false}
          />
        )}

        {/* Profile Information */}
        <ProfileInfoForm
          userId={profile.uid}
          initialData={{
            displayName: profile.displayName || "",
            phone: profile.phoneNumber || "",
            photoURL: profile.photoURL || "",
          }}
          onSubmit={handleProfileUpdate}
          onAvatarUploadSuccess={handleAvatarUploadSuccess}
          onRefresh={refreshUser}
          isLoading={isSaving}
        />

        {/* Password Change */}
        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          isLoading={isChangingPassword}
        />

        {/* Account Information */}
        <AccountInfoCard
          uid={profile.uid}
          email={profile.email || ""}
          createdAt={profile.metadata?.creationTime || new Date()}
          lastLoginAt={profile.metadata?.lastSignInTime}
        />
      </div>
    </div>
  );
}
