import { AdminTeamView } from "@mohasinac/appkit";
import { AdminPageHeader } from "@mohasinac/appkit";

export const metadata = { title: "Team — Admin" };

export default function AdminTeamPage() {
  return (
    <>
      <AdminPageHeader
        title="Team"
        subtitle="Manage employee accounts and permissions"
        themeConfig={{
          titleClass: "text-2xl font-bold text-[var(--appkit-color-text)]",
          subtitleClass: "text-sm text-[var(--appkit-color-text-muted)]",
          spacingClass: "space-y-1",
        }}
      />
      <AdminTeamView />
    </>
  );
}
