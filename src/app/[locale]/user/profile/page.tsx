import { ProfileActivityPanel } from "@/components/user/ProfileActivityPanel";
import { ProfilePageClient } from "@/components/user/ProfilePageClient";

import { Stack } from "@mohasinac/appkit/ui/components/Layout";

export default function Page() {
  return (
    <Stack gap="lg">
      <ProfilePageClient />
      <ProfileActivityPanel />
    </Stack>
  );
}
