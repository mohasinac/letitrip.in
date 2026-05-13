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
          gradient: "bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-slate-900",
          titleClass: "text-2xl font-bold text-zinc-900 dark:text-zinc-100",
          subtitleClass: "text-sm text-zinc-600 dark:text-zinc-400",
          spacingClass: "space-y-1",
        }}
      />
      <AdminTeamView />
    </>
  );
}
