import { NavEditorPageClient } from "../NavEditorPageClient";

/*
 * Auth-gated editor behind RoleGuard, rendering per-record data — there is
 * nothing meaningful to prerender, and the client editor inside reaches
 * useSearchParams(), which throws during static export without a Suspense
 * boundary (Root Cause #17). Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export const metadata = { title: "New Nav Item — Admin" };

export default function Page() {
  return <NavEditorPageClient />;
}
