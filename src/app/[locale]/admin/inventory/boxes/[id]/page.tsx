import { notFound } from "next/navigation";
import { Container, Heading, Section, Stack, Text } from "@mohasinac/appkit";
import { storageBoxesRepository } from "@mohasinac/appkit/features/inventory/repository/storage-boxes.repository";
import { inventoryPlacementsRepository } from "@mohasinac/appkit/features/inventory/repository/inventory-placements.repository";
import { inventoryMovementsRepository } from "@mohasinac/appkit/features/inventory/repository/inventory-movements.repository";
import { safeRead } from "@mohasinac/appkit/server";
import { BoxDetailClient } from "./box-detail-client";

/*
 * 🛑 THE EXISTENCE CHECK IS THE POINT OF THIS FILE.
 *
 * Without it an invented id renders a full box page — contents, a ledger, a
 * status control — for a box that does not exist. 27 of 40 admin detail pages
 * were like that, and `audit-admin-detail-notfound` exists because of it.
 * `notFound()` is the only accepted 404 here.
 *
 * 🛑 A DIRECT DOC READ, not a query: the id IS `storagebox-{code}`, so this
 * needs no index and no scan.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const box = await storageBoxesRepository.findById(id);
  if (!box) return notFound();

  /*
   * Contents and history in parallel, each through `safeRead`.
   *
   * 🛑 `safeRead` because Next still ATTEMPTS to prerender a page under a
   * session-reading layout — the HTML is discarded, but an unguarded throw
   * during the attempt is fatal to the production build (Root Cause #89's
   * third consequence). It is also the runtime guard: a box page that renders
   * its contents but not its ledger is more use than one that 500s.
   */
  const [placements, movements] = await Promise.all([
    safeRead(() => inventoryPlacementsRepository.listByBox(id), {
      route: "/admin/inventory/boxes/[id]",
      key: "inventory.listByBox",
      fallback: null,
    }),
    safeRead(() => inventoryMovementsRepository.listByBox(id, 50), {
      route: "/admin/inventory/boxes/[id]",
      key: "inventory.movementsByBox",
      fallback: null,
    }),
  ]);

  return (
    <Section>
      <Container size="xl">
        <Stack gap="comfortable">
          <Heading level={1}>{box.code}</Heading>
          <Text color="muted">
            {[box.boxType, box.location, box.capacityNote]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <BoxDetailClient
            boxId={box.id}
            boxCode={box.code}
            status={box.status}
            /*
             * The real placements, not `box.rollup`. The rollup is written by
             * a scheduled job and is ADVISORY — a box page is exactly where a
             * stale count would be noticed and would make the operator
             * distrust the rest of the screen.
             */
            placements={(placements ?? []).map((p) => ({
              productId: p.productId,
              productTitle: p.productTitle,
              productSku: p.productSku ?? null,
              quantity: p.quantity,
              slot: p.slot ?? null,
            }))}
            movements={(movements ?? []).map((m) => ({
              id: m.id,
              kind: m.kind,
              quantity: m.quantity,
              productTitle: m.productTitle ?? m.productId,
              fromBoxCode: m.fromBoxCode ?? null,
              toBoxCode: m.toBoxCode ?? null,
              occurredAt: String(m.occurredAt),
              reason: m.reason ?? null,
            }))}
            /*
             * Distinguishes "no contents" from "the read failed" — an empty
             * box and a broken page look identical otherwise, and this
             * feature's whole premise is that the record is trustworthy.
             */
            placementsFailed={placements === null}
            movementsFailed={movements === null}
          />
        </Stack>
      </Container>
    </Section>
  );
}
