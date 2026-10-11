import { AdminShipmentLotItemsView } from "@mohasinac/appkit/features/shipments/components/AdminShipmentLotItemsView";

export default async function Page({ params }: { params: Promise<{ id: string; lotId: string }> }) {
  const { id, lotId } = await params;
  return <AdminShipmentLotItemsView shipmentId={id} lotId={lotId} />;
}
