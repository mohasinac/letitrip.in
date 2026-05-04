/**
 * Job: positionsReconcile
 *
 * Scheduled: 03:30 UTC every day (30 min after countersReconcile).
 *
 * Rebuilds `position` and `subtreeSize` for every category document by
 * performing a deterministic DFS pre-order traversal of the full category tree.
 *
 * Why a nightly rebuild instead of purely real-time?
 *
 *   - The onCategoryWrite trigger handles CREATE and DELETE in real-time.
 *   - MOVE (parent change) is flagged `positionDirty` by the trigger; this job
 *     heals those cases.
 *   - Any trigger failures (cold-start timeouts, Firestore contention, deploy
 *     gaps) are self-correcting within one business day — same pattern as
 *     countersReconcile for metrics.
 *
 * Algorithm:
 *
 *   1. Load all category documents (single collection scan).
 *   2. Build an in-memory adjacency map keyed by parentId.
 *   3. DFS pre-order from each root, sorted by the existing `order` field
 *      within each sibling group (preserving the manually set display order).
 *   4. Assign sequential 1-indexed `position` values and back-calculate
 *      `subtreeSize` on the way back up.
 *   5. Batch-write only the documents where `position` or `subtreeSize` changed
 *      (or where `positionDirty` is true) — avoids spurious writes on clean days.
 *
 * Free-tier notes:
 *   - 256 MiB is sufficient; the full category tree fits comfortably in RAM.
 *   - maxInstances: 1 prevents overlapping runs.
 */
import { onSchedule } from "firebase-functions/v2/scheduler";
import { db } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { REGION, SCHEDULES, COLLECTIONS, BATCH_LIMIT } from "../config/constants";

const JOB = "positionsReconcile";

// ---------------------------------------------------------------------------
// Tree helpers
// ---------------------------------------------------------------------------

interface CategoryNode {
  id: string;
  parentId: string | null; // last entry of parentIds, or null for roots
  order: number;
  position: number;
  subtreeSize: number;
  positionDirty?: boolean;
}

/**
 * DFS pre-order traversal.
 * Assigns sequential `position` values and computes `subtreeSize` bottom-up.
 * Returns the next available position after this subtree.
 */
function dfsAssign(
  nodeId: string,
  childMap: Map<string, CategoryNode[]>,
  counter: number,
  result: Map<string, { position: number; subtreeSize: number }>,
): number {
  const position = counter;
  counter++;

  const children = (childMap.get(nodeId) ?? []).sort((a, b) => a.order - b.order);
  for (const child of children) {
    counter = dfsAssign(child.id, childMap, counter, result);
  }

  const subtreeSize = counter - position;
  result.set(nodeId, { position, subtreeSize });
  return counter;
}

// ---------------------------------------------------------------------------
// Main reconcile function (exported for reuse in tests / manual triggers)
// ---------------------------------------------------------------------------

export async function reconcileCategoryPositions(): Promise<{
  scanned: number;
  updated: number;
}> {
  // 1. Load all categories
  const snap = await db.collection(COLLECTIONS.CATEGORIES).get();

  const nodes: CategoryNode[] = snap.docs.map((doc) => {
    const d = doc.data();
    const parentIds = (d.parentIds as string[]) ?? [];
    return {
      id: doc.id,
      parentId: parentIds.length > 0 ? parentIds[parentIds.length - 1] : null,
      order: (d.order as number) ?? 0,
      position: (d.position as number) ?? 0,
      subtreeSize: (d.subtreeSize as number) ?? 1,
      positionDirty: (d.positionDirty as boolean) ?? false,
    };
  });

  if (nodes.length === 0) {
    logInfo(JOB, "No categories found — nothing to reconcile");
    return { scanned: 0, updated: 0 };
  }

  // 2. Build adjacency map: parentId → children[]
  const childMap = new Map<string, CategoryNode[]>();
  const roots: CategoryNode[] = [];

  for (const node of nodes) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const siblings = childMap.get(node.parentId) ?? [];
      siblings.push(node);
      childMap.set(node.parentId, siblings);
    }
  }

  // 3. DFS pre-order from each root (roots sorted by their own `order` field)
  const computed = new Map<string, { position: number; subtreeSize: number }>();
  let counter = 1;
  for (const root of roots.sort((a, b) => a.order - b.order)) {
    counter = dfsAssign(root.id, childMap, counter, computed);
  }

  // 4. Detect nodes not reachable from any root (orphans from bad data)
  const orphans = nodes.filter((n) => !computed.has(n.id));
  if (orphans.length > 0) {
    logInfo(JOB, `${orphans.length} orphan categories detected — assigning tail positions`, {
      orphanIds: orphans.map((o) => o.id),
    });
    for (const orphan of orphans) {
      counter = dfsAssign(orphan.id, childMap, counter, computed);
    }
  }

  // 5. Batch-write only changed documents
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const toUpdate: Array<{ id: string; position: number; subtreeSize: number }> = [];

  for (const [id, { position, subtreeSize }] of computed) {
    const current = nodeMap.get(id);
    if (
      !current ||
      current.position !== position ||
      current.subtreeSize !== subtreeSize ||
      current.positionDirty
    ) {
      toUpdate.push({ id, position, subtreeSize });
    }
  }

  if (toUpdate.length === 0) {
    logInfo(JOB, "All positions are already correct — no writes needed", {
      scanned: nodes.length,
    });
    return { scanned: nodes.length, updated: 0 };
  }

  for (let i = 0; i < toUpdate.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const { id, position, subtreeSize } of toUpdate.slice(i, i + BATCH_LIMIT)) {
      batch.update(db.collection(COLLECTIONS.CATEGORIES).doc(id), {
        position,
        subtreeSize,
        positionDirty: false,
        updatedAt: new Date(),
      });
    }
    await batch.commit();
  }

  logInfo(JOB, "Positions reconciled", {
    scanned: nodes.length,
    updated: toUpdate.length,
    orphans: orphans.length,
  });

  return { scanned: nodes.length, updated: toUpdate.length };
}

// ---------------------------------------------------------------------------
// Scheduled export
// ---------------------------------------------------------------------------

export const positionsReconcile = onSchedule(
  {
    schedule: SCHEDULES.DAILY_0330,
    timeZone: "UTC",
    region: REGION,
    memory: "256MiB",
    maxInstances: 1,
    timeoutSeconds: 120,
  },
  async () => {
    try {
      const { scanned, updated } = await reconcileCategoryPositions();
      logInfo(JOB, "Job complete", { scanned, updated });
    } catch (err) {
      logError(JOB, "Job failed", err);
    }
  },
);
