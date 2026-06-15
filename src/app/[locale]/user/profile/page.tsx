import { Div } from "@mohasinac/appkit/client";
import { ProfilePageClient, ProfileActivityPanel } from "@/components";

import { Stack } from "@mohasinac/appkit";
export default function Page() {
  return (
    <Stack gap="lg">
      <ProfilePageClient />
      <ProfileActivityPanel />
    </Stack>
  );
}
