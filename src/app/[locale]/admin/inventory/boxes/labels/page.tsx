import { BoxLabelPrintView } from "@mohasinac/appkit/features/print/components/BoxLabelPrintView";
import type { PrintableBox } from "@mohasinac/appkit/features/print/components/BoxLabelPrintView";
import { storageBoxesRepository } from "@mohasinac/appkit/features/inventory/repository/storage-boxes.repository";
import { inventoryPlacementsRepository } from "@mohasinac/appkit/features/inventory/repository/inventory-placements.repository";
import { safeRead } from "@mohasinac/appkit/server";

/**
 * Print box labels and contents sheets.
 *
 * 🛑 CONTENTS COME FROM THE REAL PLACEMENTS, NOT `box.rollup`. The rollup is
 * written by a scheduled job and is advisory; paper outlives its accuracy
 * anyway, so printing from a cache would compound a stale number with a stale
 * medium. The rollup's `computedAt` is still printed on the LABEL, because the
 * label carries only a total and saying when it was counted is what makes that
 * total honest.
 */
export default async function Page() {
  const boxesResult = await safeRead(
    () =>
      storageBoxesRepository.listForAdmin({ sorts: "ordinal", pageSize: 50 }),
    {
      route: "/admin/inventory/boxes/labels",
      key: "storageBoxes.listForAdmin",
      fallback: null,
    },
  );

  const rows = (boxesResult?.items ?? []).filter((b) => b.status !== "retired");

  /*
   * Placements for every listed box, in parallel and bounded by the same
   * 50-box page the list is capped at — so this is at most 50 reads, which
   * sits inside Rule #6's budget for a page a human opened deliberately to
   * print from. Loading them lazily per box would mean a contents sheet that
   * prints "This box is empty" about a full box, which is the one claim this
   * feature must never make.
   */
  const contents = await safeRead(
    () =>
      Promise.all(
        rows.map((b) => inventoryPlacementsRepository.listByBox(b.id)),
      ),
    {
      route: "/admin/inventory/boxes/labels",
      key: "inventory.listByBox.batch",
      fallback: null,
    },
  );

  const boxes: PrintableBox[] = rows.map((b, i) => ({
    id: b.id,
    code: b.code,
    boxType: b.boxType,
    location: b.location ?? null,
    distinctProducts: b.rollup?.distinctProducts ?? null,
    totalUnits: b.rollup?.totalUnits ?? null,
    countedAt: b.rollup?.computedAt ? String(b.rollup.computedAt) : null,
    /*
     * `undefined`, not `[]`, when the read failed. The view distinguishes the
     * two and refuses to print a sheet it cannot fill — an empty array would
     * print as "This box is empty", which is a statement about the box rather
     * than about our read.
     */
    contents: contents
      ? (contents[i] ?? []).map((p) => ({
          productTitle: p.productTitle,
          productSku: p.productSku ?? null,
          quantity: p.quantity,
          slot: p.slot ?? null,
        }))
      : undefined,
  }));

  return (
    <BoxLabelPrintView
      boxes={boxes}
      /*
       * Stamped HERE, on the server, once per request. Computing it inside the
       * view would differ between the server render and hydration — a React
       * mismatch — and would make the printed date mean "whenever that
       * component last rendered", which is a fact about nothing.
       */
      printedAt={new Date().toISOString()}
      boxesFailed={boxesResult === null}
    />
  );
}
