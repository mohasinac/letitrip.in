import { AdminAdEditorView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <AdminAdEditorView adId={params.id} />;
}
