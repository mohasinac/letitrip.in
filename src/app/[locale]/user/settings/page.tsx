import { UserSettingsView } from "@mohasinac/appkit";
import { FontToggleClient } from "@/components/user/FontToggleClient";

export default function Page() {
  return (
    <UserSettingsView
      renderAppearance={() => <FontToggleClient />}
    />
  );
}
