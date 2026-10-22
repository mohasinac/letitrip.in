import { Alert, Container, Section } from "@mohasinac/appkit";
import { ReceiveStationView } from "@mohasinac/appkit/features/inventory/components/ReceiveStationView";
import type {
  BoxOption,
  ReceivableItem,
  UnlinkedItem,
} from "@mohasinac/appkit/features/inventory/components/ReceiveStationView";
import { shipmentsRepository } from "@mohasinac/appkit/features/shipments/repository/shipments.repository";
import { shipmentItemsRepository } from "@mohasinac/appkit/features/shipments/repository/shipment-items.repository";
import { storageBoxesRepository } from "@mohasinac/appkit/features/inventory/repository/storage-boxes.repository";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { STORAGE_BOX_FIELDS } from "@mohasinac/appkit/features/inventory/schemas/firestore";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { requireRecord } from "@mohasinac/appkit/next/routing/require-record";
import { safeRead } from "@mohasinac/appkit/server";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  /*
   * The existence check `audit-admin-detail-notfound` requires. Without it an
   * invented shipment id renders a fully-functional scan station that would
   * write real placements tagged with a `shipmentId` nothing resolves.
   */
  const shipment = await requireRecord(() => shipmentsRepository.findById(id), {
    route: "/admin/shipments/[id]/receive",
    key: "shipments.findById",
  });

  /*
   * 🛑 NULL IS A FAILED READ, NEVER "no such shipment" — `requireRecord` has
   * already 404'd that case. Writing `if (!shipment) notFound()` here (which I
   * did first) converts a transient Firestore failure into "this shipment does
   * not exist", which is exactly the kind of confident wrong answer that sends
   * someone looking for a crate they are holding.
   *
   * The station is withheld rather than degraded: it has nothing to offer
   * without the item list, and a scan field over an unverifiable shipment
   * would stage rows tagged with a `shipmentId` nothing resolved.
   */
  if (!shipment) {
    return (
      <Section>
        <Container size="xl">
          <Alert variant="warning">
            Could not load this shipment, so there is nothing to receive
            against yet. It has not been deleted — the read failed and the
            failure is recorded. Reload in a moment.
          </Alert>
        </Container>
      </Section>
    );
  }

  /*
   * Both reads through `safeRead`, and the station is told WHICH one failed.
   *
   * An empty item list and a failed item read look identical on screen, and
   * "this shipment has nothing to receive" about a crate sitting on the floor
   * is the worst thing this page could claim — the operator would conclude
   * they opened the wrong shipment. Same reasoning as the box detail page.
   */
  const itemsResult = await safeRead(
    () => shipmentItemsRepository.listByShipment(id, { pageSize: 100 }),
    {
      route: "/admin/shipments/[id]/receive",
      key: "shipmentItems.listByShipment",
      fallback: null,
    },
  );
  const boxesResult = await safeRead(
    () => storageBoxesRepository.listForAdmin({ sorts: sortBy(STORAGE_BOX_FIELDS.ORDINAL, "ASC"), pageSize: 50 }),
    {
      route: "/admin/shipments/[id]/receive",
      key: "storageBoxes.listForAdmin",
      fallback: null,
    },
  );

  const rawItems = itemsResult?.items ?? [];

  /*
   * 🛑 LINKED AND UNLINKED ARE SPLIT HERE, not filtered.
   *
   * A placement keys on `productId`, so an item with no `linkedProductId`
   * genuinely cannot be received — but dropping it silently means the operator
   * counts the crate, finds the station one item short of reality, and cannot
   * tell whether they miscounted or the screen is wrong. The station names
   * them and links to where each gets linked.
   */
  const linked = rawItems.filter(
    (it): it is typeof it & { linkedProductId: string } =>
      typeof it.linkedProductId === "string" && it.linkedProductId.length > 0,
  );
  const unlinked: UnlinkedItem[] = rawItems
    .filter((it) => !it.linkedProductId)
    .map((it) => ({ itemId: it.id, lotId: it.lotId, title: it.title }));

  /*
   * The products behind the linked items, for their scan codes.
   *
   * `barcodeId` is what the printed symbol encodes and `sku` is the
   * human-readable line under it — the shipment item carries neither, only its
   * own draft `title`, so the station cannot match a scan without this hop.
   * Deduplicated because two shipment items can legitimately point at one
   * product (two of the same thing in different lots).
   */
  const productIds = [...new Set(linked.map((it) => it.linkedProductId))];
  const products = await safeRead(
    () => Promise.all(productIds.map((pid) => productRepository.findById(pid))),
    {
      route: "/admin/shipments/[id]/receive",
      key: "products.findById.batch",
      fallback: null,
    },
  );
  const productById = new Map(
    (products ?? []).filter(Boolean).map((p) => [p!.id, p!]),
  );

  const items: ReceivableItem[] = linked.map((it) => {
    const p = productById.get(it.linkedProductId);
    return {
      itemId: it.id,
      productId: it.linkedProductId,
      // The PRODUCT's title is authoritative — the shipment item's is a draft
      // typed during import, and the operator is matching against a label.
      productTitle: p?.title ?? it.title,
      barcodeId: p?.barcodeId ?? null,
      sku: p?.sku ?? null,
      expectedQuantity: it.quantity,
    };
  });

  const boxes: BoxOption[] = (boxesResult?.items ?? [])
    /*
     * Retired boxes are excluded: the receive route refuses them with a 409,
     * so offering one is a control that cannot work. `full` is deliberately
     * KEPT — that status is advisory, and an operator who decides to squeeze
     * one more thing in is describing reality, which is all a placement is.
     */
    .filter((b) => b.status !== "retired")
    .map((b) => ({ id: b.id, code: b.code, location: b.location ?? null }));

  return (
    <ReceiveStationView
      shipmentId={id}
      shipmentNumber={shipment.shipmentNumber}
      items={items}
      unlinked={unlinked}
      boxes={boxes}
      itemsFailed={itemsResult === null || products === null}
      boxesFailed={boxesResult === null}
    />
  );
}
