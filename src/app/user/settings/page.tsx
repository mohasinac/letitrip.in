"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useAuth,
  useChangePassword,
  useResendVerification,
  useUnsavedChanges,
} from "@/hooks";
import { Card, Heading, Button, Alert, AvatarUpload } from "@/components";
import type { ImageCropData } from "@/components";
import { FormField } from "@/components/FormField";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { Text } from "@/components/typography";
import { useToast } from "@/components/feedback";
import UserTabs from "@/components/user/UserTabs";
import { useRouter } from "next/navigation";
import { THEME_CONSTANTS } from "@/constants/theme";
import { ROUTES } from "@/constants/routes";
import {
  UI_LABELS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  UI_PLACEHOLDERS,
  UI_HELP_TEXT,
} from "@/constants";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export default function UserSettingsPage() {
  const { user: profile, loading, refreshUser } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
    null,
  );

  // Track whether the avatar has a pending (cropped but not yet uploaded) change
  const [hasAvatarPending, setHasAvatarPending] = useState(false);

  // Snapshot of the initial form values when the profile loads
  const initialFormRef = useRef<Record<string, string> | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Messages
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/auth/login");
    }
  }, [profile, loading, router]);

  useEffect(() => {
    if (profile) {
      const name = profile.displayName || "";
      const phone = profile.phoneNumber || "";
      setDisplayName(name);
      setPhoneNumber(phone);
      setPhotoURL(profile.photoURL || "");

      // Capture initial form values (only on first load)
      if (!initialFormRef.current) {
        initialFormRef.current = { displayName: name, phoneNumber: phone };
      }
    }
  }, [profile]);

  // Unsaved changes detection — guards browser close/refresh
  const { isDirty, markClean } = useUnsavedChanges({
    formValues: { displayName, phoneNumber },
    initialValues: initialFormRef.current,
    extraDirty: hasAvatarPending,
  });

  // Callback for AvatarUpload pending state changes
  const handleAvatarPendingChange = useCallback((hasPending: boolean) => {
    setHasAvatarPending(hasPending);
  }, []);

  // Change password mutation
  const { mutate: changePassword, isLoading: isChangingPassword } =
    useChangePassword({
      onSuccess: () => {
        showToast(SUCCESS_MESSAGES.USER.PASSWORD_CHANGED, "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
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
        showToast(SUCCESS_MESSAGES.EMAIL.VERIFICATION_SENT, "success");
      },
      onError: (error) => {
        setMessage({
          type: "error",
          text: error.message || ERROR_MESSAGES.EMAIL.SEND_FAILED,
        });
      },
    });

  const updateProfile = async (data: {
    displayName?: string;
    phoneNumber?: string;
    photoURL?: string;
    avatarMetadata?: ImageCropData;
  }) => {
    if (!profile?.uid) return;

    setIsSaving(true);
    setMessage(null);

    // Snapshot current values before attempting update so we can revert on error
    const snapshot = {
      displayName: profile.displayName || "",
      phoneNumber: profile.phoneNumber || "",
      photoURL: profile.photoURL || "",
    };

    try {
      // Use API endpoint to update profile
      const response = await fetch(API_ENDPOINTS.PROFILE.UPDATE, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();

      // Success — show toast and mark form as clean
      showToast(SUCCESS_MESSAGES.USER.SETTINGS_SAVED, "success");

      // Update the initial-values snapshot so the form is no longer "dirty"
      initialFormRef.current = { displayName, phoneNumber };
      markClean();

      // Refresh user data to get updated verification flags
      await refreshUser();
    } catch (error) {
      console.error("Profile update error:", error);

      // Revert form to the values that are actually in Firebase
      setDisplayName(snapshot.displayName);
      setPhoneNumber(snapshot.phoneNumber);
      setPhotoURL(snapshot.photoURL);

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

  const handleAvatarUploadSuccess = async (
    downloadURL: string,
    cropData: ImageCropData,
  ) => {
    setPhotoURL(downloadURL);
    setAvatarUploadError(null);
    await updateProfile({
      photoURL: downloadURL,
      avatarMetadata: cropData,
    });
  };

  const handleAvatarUploadError = (error: string) => {
    setAvatarUploadError(error);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    await updateProfile({
      displayName: displayName?.trim() || "",
      phoneNumber: (phoneNumber || "").trim(),
      photoURL: photoURL?.trim() || "",
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text>{UI_LABELS.LOADING.DEFAULT}</Text>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl">
      <UserTabs />

      <div className={THEME_CONSTANTS.spacing.stack}>
        <Heading level={3}>{UI_LABELS.SETTINGS.TITLE}</Heading>

        {/* Unsaved changes banner */}
        {isDirty && (
          <Alert variant="warning" className="mb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <strong>{UI_LABELS.SETTINGS.UNSAVED_BANNER}</strong>
                <span className="ml-2 text-sm opacity-80">
                  {UI_LABELS.SETTINGS.UNSAVED_DETAIL}
                </span>
              </div>
            </div>
          </Alert>
        )}

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

        {/* Email Verification Card */}
        <Card className="p-6">
          <Heading level={5} className="mb-4">
            {UI_LABELS.FORM.EMAIL_VERIFICATION}
          </Heading>

          <div
            className={`p-4 rounded-lg border-2 ${
              profile?.emailVerified
                ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {profile?.emailVerified ? (
                  <svg
                    className="w-6 h-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">
                  {profile?.emailVerified
                    ? UI_LABELS.STATUS.EMAIL_VERIFIED
                    : UI_LABELS.STATUS.EMAIL_NOT_VERIFIED}
                </div>
                <div className="text-sm mb-3 opacity-80">
                  {profile?.email || UI_LABELS.EMPTY.NO_EMAIL}
                </div>
                {profile?.emailVerified ? (
                  <Text className="text-sm">
                    {UI_LABELS.MESSAGES.EMAIL_VERIFIED_SUCCESS}
                  </Text>
                ) : (
                  <>
                    <Text className="text-sm mb-3">
                      {UI_LABELS.MESSAGES.EMAIL_VERIFICATION_REQUIRED}
                    </Text>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleSendVerification}
                      disabled={isSendingVerification}
                    >
                      {isSendingVerification
                        ? UI_LABELS.LOADING.SENDING
                        : UI_LABELS.ACTIONS.RESEND_VERIFICATION}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Phone Verification Card */}
        {profile?.phoneNumber && (
          <Card className="p-6">
            <Heading level={5} className="mb-4">
              {UI_LABELS.FORM.PHONE_VERIFICATION}
            </Heading>

            <div
              className={`p-4 rounded-lg border-2 ${
                profile?.phoneVerified
                  ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                  : `${THEME_CONSTANTS.themed.bgTertiary} border-gray-300 dark:border-gray-600`
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {profile?.phoneVerified ? (
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-400 dark:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">
                    {profile?.phoneVerified
                      ? UI_LABELS.STATUS.PHONE_VERIFIED
                      : UI_LABELS.STATUS.PHONE_NOT_VERIFIED}
                  </div>
                  <div className="text-sm mb-3 opacity-80">
                    {profile?.phoneNumber}
                  </div>
                  <Text className="text-sm">
                    {profile?.phoneVerified
                      ? UI_LABELS.MESSAGES.PHONE_VERIFIED_SUCCESS
                      : UI_LABELS.MESSAGES.PHONE_VERIFICATION_REQUIRED}
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Information */}
        <Card className="p-6">
          <Heading level={5} className="mb-4">
            {UI_LABELS.PROFILE.PROFILE_INFORMATION}
          </Heading>

          {/* Avatar Upload */}
          <div className="mb-6">
            <AvatarUpload
              currentPhotoURL={profile?.photoURL}
              currentCropData={profile?.avatarMetadata}
              userId={profile.uid}
              onUploadSuccess={handleAvatarUploadSuccess}
              onUploadError={handleAvatarUploadError}
              onSaveComplete={refreshUser}
              onPendingStateChange={handleAvatarPendingChange}
            />
          </div>

          <form
            onSubmit={handleUpdateProfile}
            className={THEME_CONSTANTS.spacing.stack}
          >
            <FormField
              name="displayName"
              label={UI_LABELS.FORM.DISPLAY_NAME}
              type="text"
              value={displayName}
              onChange={(value) => setDisplayName(value)}
              placeholder={UI_PLACEHOLDERS.NAME}
            />

            <FormField
              name="phoneNumber"
              label={UI_LABELS.FORM.PHONE}
              type="tel"
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value)}
              placeholder={UI_PLACEHOLDERS.PHONE}
              helpText={UI_HELP_TEXT.PHONE_10_DIGIT}
            />

            <div className="pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? UI_LABELS.SETTINGS.SAVING
                  : UI_LABELS.SETTINGS.SAVE_CHANGES}
              </Button>
            </div>
          </form>
        </Card>

        {/* Password Change */}
        <Card className="p-6">
          <Heading level={5} className="mb-4">
            {UI_LABELS.ACTIONS.CHANGE_PASSWORD}
          </Heading>

          {!showPasswordForm ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordForm(true)}
            >
              {UI_LABELS.ACTIONS.CHANGE_PASSWORD}
            </Button>
          ) : (
            <form
              onSubmit={handleChangePassword}
              className={THEME_CONSTANTS.spacing.stack}
            >
              <FormField
                name="currentPassword"
                label={UI_LABELS.FORM.CURRENT_PASSWORD}
                type="password"
                value={passwordData.currentPassword}
                onChange={(value) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    currentPassword: value,
                  }))
                }
                placeholder={UI_PLACEHOLDERS.PASSWORD}
                required
              />

              <FormField
                name="newPassword"
                label={UI_LABELS.FORM.NEW_PASSWORD}
                type="password"
                value={passwordData.newPassword}
                onChange={(value) =>
                  setPasswordData((prev) => ({ ...prev, newPassword: value }))
                }
                placeholder={UI_PLACEHOLDERS.PASSWORD}
                required
              />

              {passwordData.newPassword && (
                <PasswordStrengthIndicator
                  password={passwordData.newPassword}
                />
              )}

              <FormField
                name="confirmPassword"
                label={UI_LABELS.FORM.CONFIRM_PASSWORD}
                type="password"
                value={passwordData.confirmPassword}
                onChange={(value) =>
                  setPasswordData((prev) => ({
                    ...prev,
                    confirmPassword: value,
                  }))
                }
                placeholder={UI_PLACEHOLDERS.PASSWORD}
                required
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword
                    ? UI_LABELS.LOADING.CHANGING
                    : UI_LABELS.ACTIONS.UPDATE_PASSWORD}
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
                  }}
                >
                  {UI_LABELS.ACTIONS.CANCEL}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Account Information */}
        <Card className="p-6">
          <Heading level={5} className="mb-4">
            {UI_LABELS.PROFILE.ACCOUNT_INFORMATION}
          </Heading>

          <div className="space-y-3">
            <div>
              <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
                {UI_LABELS.FORM.EMAIL}
              </p>
              <p className="font-medium">{profile.email}</p>
            </div>

            <div>
              <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
                {UI_LABELS.PROFILE.USER_ID}
              </p>
              <p className="font-mono text-sm">{profile.uid}</p>
            </div>

            <div>
              <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
                {UI_LABELS.PROFILE.ROLE}
              </p>
              <p className="font-medium capitalize">{profile.role}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
