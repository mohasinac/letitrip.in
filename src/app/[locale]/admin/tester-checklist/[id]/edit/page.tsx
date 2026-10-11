import { AdminTesterChecklistItemEditorView } from "@mohasinac/appkit/features/admin/components/AdminTesterChecklistItemEditorView";

export const metadata = { title: "Edit Checklist Item — Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminTesterChecklistItemEditorView itemId={id} />;
}
