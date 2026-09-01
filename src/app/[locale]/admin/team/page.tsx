import { AdminTeamView } from "@mohasinac/appkit";
import { AdminPageHeader } from "@mohasinac/appkit";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export const metadata = { title: "Team — Admin" };

export default function AdminTeamPage() {
  return (
    <>
      <AdminPageHeader
        title="Team"
        subtitle="Manage employee accounts and permissions"
        themeConfig={{
          titleClass: "text-[length:var(--appkit-text-2xl)] font-bold text-[var(--appkit-color-text)]",
          subtitleClass: "text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)]",
          spacingClass: "space-y-1",
        }}
      />
      <AdminTeamView />
    </>
  );
}
