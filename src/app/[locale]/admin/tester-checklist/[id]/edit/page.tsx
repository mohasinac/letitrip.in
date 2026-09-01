import { AdminTesterChecklistItemEditorView } from "@mohasinac/appkit";

/*
 * Auth-gated editor behind RoleGuard, rendering per-record data — there is
 * nothing meaningful to prerender, and the client editor inside reaches
 * useSearchParams(), which throws during static export without a Suspense
 * boundary (Root Cause #17). Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export const metadata = { title: "Edit Checklist Item — Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminTesterChecklistItemEditorView itemId={id} />;
}
