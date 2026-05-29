import { Div } from "@mohasinac/appkit/client";
import { ProfilePageClient, ProfileActivityPanel } from "@/components";

export default function Page() {
  return (
    <Div className="space-y-6">
      <ProfilePageClient />
      <ProfileActivityPanel />
    </Div>
  );
}
