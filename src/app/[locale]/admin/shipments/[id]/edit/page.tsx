import { AdminShipmentEditorView } from "@mohasinac/appkit/features/shipments/components/AdminShipmentEditorView";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminShipmentEditorView shipmentId={id} />;
}
