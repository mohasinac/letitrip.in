import { AdminTesterChecklistItemEditorView } from "@mohasinac/appkit/features/admin/components/AdminTesterChecklistItemEditorView";
import { testerChecklistItemRepository } from "@mohasinac/appkit/features/tester/repository/tester-checklist-item.repository";
import { requireRecord } from "@mohasinac/appkit/next/routing/require-record";

export const metadata = { title: "Edit Checklist Item — Admin" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRecord(() => testerChecklistItemRepository.findById(id), {
    route: "/admin/tester-checklist/[id]/edit",
    key: "testerChecklistItem.findById",
  });
  return <AdminTesterChecklistItemEditorView itemId={id} />;
}
