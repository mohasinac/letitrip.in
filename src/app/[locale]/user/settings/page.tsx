"use client";
import { UserSettingsView } from "@mohasinac/appkit/client";
import { FontToggleClient } from "@/components/user/FontToggleClient";
import { ProfilePageClient } from "@/components/user/ProfilePageClient";

export default function Page() {
  return (
    <UserSettingsView
      renderProfileForm={() => <ProfilePageClient />}
      renderAppearance={() => <FontToggleClient />}
    />
  );
}
