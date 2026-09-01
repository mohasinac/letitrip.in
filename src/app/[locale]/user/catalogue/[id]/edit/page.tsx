import { notFound } from "next/navigation";
import { CatalogueItemEditorView, catalogueRepository } from "@mohasinac/appkit";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

/*
 * Auth-gated dashboard page behind RoleGuard — it needs the session on every
 * request, so there is nothing meaningful to prerender. Static export also
 * throws on any client tree reaching useSearchParams() without a Suspense
 * boundary (Root Cause #17), and static generation runs 15 parallel workers,
 * so WHICH page trips it varies between builds — a latent class rather than
 * one bad page. Dynamic is both the correct semantics and the fix.
 */
export const dynamic = "force-dynamic";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerSessionUser();
  // NOT swallowed: a failed read reached `notFound()` below, telling the owner
  // their own catalogue item no longer exists.
  const item = await catalogueRepository.findById(id);
  if (!item || !user || item.ownerId !== user.uid) notFound();
  return <CatalogueItemEditorView item={item} />;
}
