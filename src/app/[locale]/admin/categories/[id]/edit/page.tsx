import { AdminCategoryEditorView } from "@mohasinac/appkit";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminCategoryEditorView categoryId={id} />;
}
