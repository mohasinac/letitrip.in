"use client";

import { Suspense } from "react";

/**
 * Edit a team member's permissions. Same permanently-open drawer pattern as
 * the sibling `new` page.
 *
 * Unlike the list, this page has no row to seed `displayName` /
 * `currentPermissionGroup` / `currentPermissions` from, so the editor loads
 * them from `userId` itself. That is the correct direction anyway: seeding an
 * editor from a cached list row is what Root Cause #38 is about — the row's
 * fields can be a narrower projection than the document, and saving then
 * writes the missing ones back as their defaults.
 */
import { AdminEmployeeEditorView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";



function PageInner() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  return (
    <AdminEmployeeEditorView
      open
      mode="edit"
      userId={params?.id ?? ""}
      onClose={() => router.push(String(ROUTES.ADMIN.TEAM))}
    />
  );
}

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). The dashboard
 * layout wraps {children} in Suspense too, and empirically that is not enough
 * for a client PAGE component.
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
