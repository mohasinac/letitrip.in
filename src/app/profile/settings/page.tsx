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
import Alert from "@/components/feedback/Alert";
import { Heading } from "@/components/typography/Typography";
import { useAuth, useMessage } from "@/hooks";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { ProfileGeneralSection } from "@/components/profile/ProfileGeneralSection";
import { ProfileSecuritySection } from "@/components/profile/ProfileSecuritySection";
import { ProfilePhoneSection } from "@/components/profile/ProfilePhoneSection";
import { ProfileAccountSection } from "@/components/profile/ProfileAccountSection";

type Tab = "general" | "security" | "account";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { message, showSuccess, showError } = useMessage();
  const { themed } = THEME_CONSTANTS;

  const [activeTab, setActiveTab] = useState<Tab>("general");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleDeleteSuccess = () => {
    setTimeout(() => router.push("/auth/login"), 2000);
  };

  if (authLoading) {
    return (
      <div
        className={`min-h-screen ${themed.bgPrimary} flex items-center justify-center`}
      >
        <Heading level={2} variant="primary">
          {UI_LABELS.LOADING.DEFAULT}
        </Heading>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen ${themed.bgPrimary} py-8 px-4`}>
      <div className="max-w-4xl mx-auto">
        <Heading level={1} variant="primary" className="mb-8">
          Profile Settings
        </Heading>

        {message && (
          <Alert variant={message.type} className="mb-6">
            {message.text}
          </Alert>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          {["general", "security", "account"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`pb-2 px-4 capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 font-semibold"
                  : themed.textSecondary
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "general" && (
            <ProfileGeneralSection
              user={user}
              onSuccess={showSuccess}
              onError={showError}
            />
          )}

          {activeTab === "security" && (
            <>
              <ProfileSecuritySection
                onSuccess={showSuccess}
                onError={showError}
              />
              <ProfilePhoneSection
                currentPhone={user.phoneNumber}
                phoneVerified={user.phoneVerified || false}
                onSuccess={showSuccess}
                onError={showError}
              />
            </>
          )}

          {activeTab === "account" && (
            <ProfileAccountSection
              onSuccess={showSuccess}
              onError={showError}
              onDeleteSuccess={handleDeleteSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}
