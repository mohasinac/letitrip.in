"use client";

import { useState, useEffect } from "react";
import { useAuth, useChangePassword, useResendVerification } from "@/hooks";
import { updateProfileAction } from "@/actions";
import { nowMs } from "@/utils";
import { Heading, Alert, Spinner, useToast } from "@/components";
import { EmailVerificationCard } from "./EmailVerificationCard";
import { PhoneVerificationCard } from "./PhoneVerificationCard";
import { ProfileInfoForm } from "./ProfileInfoForm";
import type { ProfileInfoData } from "./ProfileInfoForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { AccountInfoCard } from "./AccountInfoCard";
import { useRouter } from "@/i18n/navigation";
import { logger } from "@/classes";
import {
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  ROUTES,
} from "@/constants";
import { useTranslations } from "next-intl";

export function UserSettingsView() {
  const { user: profile, loading, refreshUser } = useAuth();
  const router = useRouter();
  const t = useTranslations("settings");
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !profile) {
      showToast(ERROR_MESSAGES.AUTH.UNAUTHORIZED, "error");
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [profile, loading, router, showToast]);

  const { mutate: changePassword, isPending: isChangingPassword } =
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

  const { mutate: resendVerification, isPending: isSendingVerification } =
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
      await updateProfileAction({
        displayName: data.displayName,
        phoneNumber: data.phone,
      });
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
      await updateProfileAction({ photoURL: url });
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
      <div className={`${THEME_CONSTANTS.flex.center} min-h-screen`}>
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
        <Heading level={3}>{t("title")}</Heading>

        {message && (
          <Alert
            variant={message.type}
            className="mb-4"
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <EmailVerificationCard
          email={profile.email || ""}
          isVerified={profile.emailVerified || false}
          onResendVerification={handleResendVerification}
          isLoading={isSendingVerification}
        />

        {profile.phoneNumber && (
          <PhoneVerificationCard
            phone={profile.phoneNumber}
            isVerified={profile.phoneVerified || false}
          />
        )}

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

        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          isLoading={isChangingPassword}
        />

        <AccountInfoCard
          uid={profile.uid}
          email={profile.email || ""}
          createdAt={profile.metadata?.creationTime || new Date(nowMs())}
          lastLoginAt={profile.metadata?.lastSignInTime}
        />
      </div>
    </div>
  );
}
