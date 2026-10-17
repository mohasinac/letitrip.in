import { notFound } from "next/navigation";
import { AdminShipmentLotItemsView } from "@mohasinac/appkit/features/shipments/components/AdminShipmentLotItemsView";
import { shipmentLotsRepository } from "@mohasinac/appkit/features/shipments/repository/shipment-lots.repository";
import { requireRecord } from "@mohasinac/appkit/next/routing/require-record";

export default async function Page({ params }: { params: Promise<{ id: string; lotId: string }> }) {
  const { id, lotId } = await params;
  /*
   * The LOT is checked, not the shipment. A lot carries `shipmentId`, so a lot
   * that exists proves its shipment does — and checking the shipment alone
   * would still open an item list for an invented `lotId`, which is the half of
   * the URL a human is more likely to mistype.
   */
  const lot = await requireRecord(() => shipmentLotsRepository.findById(lotId), {
    route: "/admin/shipments/[id]/lots/[lotId]/items",
    key: "shipmentLots.findById",
  });
  // A real lot filed under a different shipment is a wrong URL, not a missing
  // record — `lot` is null only when the read itself failed, which must not 404.
  if (lot && lot.shipmentId !== id) notFound();
  return <AdminShipmentLotItemsView shipmentId={id} lotId={lotId} />;
}
