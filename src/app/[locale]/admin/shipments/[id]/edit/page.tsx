import { AdminShipmentEditorView } from "@mohasinac/appkit/features/shipments/components/AdminShipmentEditorView";
import { shipmentsRepository } from "@mohasinac/appkit/features/shipments/repository/shipments.repository";
import { requireRecord } from "@mohasinac/appkit/next/routing/require-record";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRecord(() => shipmentsRepository.findById(id), {
    route: "/admin/shipments/[id]/edit",
    key: "shipments.findById",
  });
  return <AdminShipmentEditorView shipmentId={id} />;
}
