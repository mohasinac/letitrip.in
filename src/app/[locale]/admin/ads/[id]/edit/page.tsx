import { AdminAdEditorView } from "@mohasinac/appkit";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminAdEditorView adId={id} />;
}
