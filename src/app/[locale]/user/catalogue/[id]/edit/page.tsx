import { notFound } from "next/navigation";
import { CatalogueItemEditorView, catalogueRepository } from "@mohasinac/appkit";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerSessionUser();
  // NOT swallowed: a failed read reached `notFound()` below, telling the owner
  // their own catalogue item no longer exists.
  const item = await catalogueRepository.findById(id);
  if (!item || !user || item.ownerId !== user.uid) notFound();
  return <CatalogueItemEditorView item={item} />;
}
