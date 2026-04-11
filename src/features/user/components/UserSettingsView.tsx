"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth, useChangePassword, useResendVerification } from "@/hooks";
import { updateProfileAction } from "@/actions";
import { Alert, Spinner } from "@/components";
import { UserSettingsView as AppkitUserSettingsView } from "@mohasinac/appkit/features/account";
import {
  ROUTES,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/constants";
import { EmailVerificationCard } from "./EmailVerificationCard";
import { PhoneVerificationCard } from "./PhoneVerificationCard";
import { ProfileInfoForm } from "./ProfileInfoForm";
import type { ProfileInfoData } from "./ProfileInfoForm";
import { PasswordChangeForm } from "./PasswordChangeForm";
import { AccountInfoCard } from "./AccountInfoCard";
import { useToast } from "@/components";

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
      onSuccess: () =>
        showToast(SUCCESS_MESSAGES.USER.PASSWORD_CHANGED, "success"),
      onError: (error) =>
        setMessage({
          type: "error",
          text: error.message || ERROR_MESSAGES.PASSWORD.CHANGE_FAILED,
        }),
    });

  const { mutate: resendVerification, isPending: isSendingVerification } =
    useResendVerification({
      onSuccess: () =>
        showToast(SUCCESS_MESSAGES.EMAIL.VERIFICATION_SENT, "success"),
      onError: (error) =>
        setMessage({
          type: "error",
          text: error.message || ERROR_MESSAGES.EMAIL.SEND_FAILED,
        }),
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
    } catch {
      setMessage({
        type: "error",
        text: ERROR_MESSAGES.GENERIC.INTERNAL_ERROR,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`${THEME_CONSTANTS.flex.center} min-h-screen`}>
        <Spinner size="lg" />
      </div>
    );
  }
  if (!profile) return null;

  return (
    <AppkitUserSettingsView
      renderMessage={() =>
        message ? (
          <Alert variant={message.type === "success" ? "success" : "error"}>
            {message.text}
          </Alert>
        ) : null
      }
      renderEmailVerification={() => (
        <EmailVerificationCard
          email={profile.email ?? ""}
          isVerified={profile.emailVerified ?? false}
          onResendVerification={() =>
            resendVerification({ email: profile.email ?? "" })
          }
        />
      )}
      renderPhoneVerification={() => (
        <PhoneVerificationCard
          phone={profile.phoneNumber ?? ""}
          isVerified={false}
          onVerify={() => {}}
        />
      )}
      renderProfileForm={() => (
        <ProfileInfoForm
          userId={profile.uid}
          initialData={{
            displayName: profile.displayName ?? "",
            phone: profile.phoneNumber ?? "",
            photoURL: profile.photoURL ?? "",
          }}
          onSubmit={handleProfileUpdate}
        />
      )}
      renderPasswordForm={() => (
        <PasswordChangeForm
          onSubmit={(currentPassword, newPassword) =>
            changePassword({ currentPassword, newPassword })
          }
          isLoading={isChangingPassword}
        />
      )}
      renderAccountInfo={() => (
        <AccountInfoCard
          uid={profile.uid}
          email={profile.email ?? ""}
          createdAt={profile.createdAt ?? new Date()}
          lastLoginAt={profile.metadata?.lastSignInTime ?? null}
        />
      )}
    />
  );
}
