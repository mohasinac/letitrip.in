import { ProfilePageClient, ProfileActivityPanel } from "@/components";

export default function Page() {
  return (
    <div className="space-y-6">
      <ProfilePageClient />
      <ProfileActivityPanel />
    </div>
  );
}
