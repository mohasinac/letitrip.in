"use client";

import { Suspense } from "react";

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



function PageInner() {
  const router = useRouter();
  return (
    <AdminEmployeeEditorView
      open
      mode="invite"
      onClose={() => router.push(String(ROUTES.ADMIN.TEAM))}
    />
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
