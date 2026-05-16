import { AdminFeatureEditorView } from "@mohasinac/appkit";

export const metadata = { title: "Edit Feature — Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminFeatureEditorView featureId={id} />;
}
