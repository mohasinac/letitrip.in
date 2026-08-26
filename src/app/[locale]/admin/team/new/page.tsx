"use client";

/**
 * Invite a team member — the shareable URL for the drawer `AdminTeamView`
 * opens inline.
 *
 * `AdminEmployeeEditorView` hard-renders `<SideDrawer>` internally with no
 * headless mode, so this follows the pattern already used by the orders,
 * scammers and support-ticket full pages: mount it permanently `open`, and
 * make `onClose` navigate back to the list instead of toggling local state.
 *
 * A drawer cannot be linked to, bookmarked or reloaded into. That is the whole
 * reason this page exists — the invite flow itself is unchanged.
 */
import { AdminEmployeeEditorView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <AdminEmployeeEditorView
      open
      mode="invite"
      onClose={() => router.push(String(ROUTES.ADMIN.TEAM))}
    />
  );
}
