import { notFound } from "next/navigation";
import { CatalogueItemEditorView, catalogueRepository } from "@mohasinac/appkit";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerSessionUser();
  const item = await catalogueRepository.findById(id).catch(() => null);
  if (!item || !user || item.ownerId !== user.uid) notFound();
  return <CatalogueItemEditorView item={item} />;
}
