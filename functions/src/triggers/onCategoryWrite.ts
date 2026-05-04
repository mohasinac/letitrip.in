/**
 * Trigger: onCategoryWrite — DFS position maintenance
 *
 * Maintains two denormalized fields on every CategoryDocument:
 *
 *   position    — global DFS pre-order index (1-indexed) across the entire
 *                 category tree, ordered by the existing `order` field within
 *                 each sibling group.
 *
 *   subtreeSize — count of self + all descendants. The half-open range
 *                 [position, position + subtreeSize) covers the full subtree,
 *                 enabling O(1) subtree queries on `position`.
 *
 * Invariant maintained on every write:
 *
 *   CREATE  → append new node at end of parent's subtree; shift all later
 *             nodes up by 1; increment every ancestor's subtreeSize by 1.
 *
 *   DELETE  → shift all nodes after the deleted subtree down by subtreeSize;
 *             decrement every ancestor's subtreeSize accordingly.
 *
 *   MOVE    → parent change is complex (requires re-ordering a whole subtree).
 *             We mark a `positionDirty` flag and let the nightly
 *             positionsReconcile job rebuild from scratch.  This keeps the
 *             trigger simple and fast; moves are rare and a <24 h lag is
 *             acceptable for that case.
 *
 * Non-fatal: any error is logged and the nightly positionsReconcile job will
 * heal any drift, same pattern as countersReconcile for metrics.
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { logInfo, logError, logWarn } from "../utils/logger";
import { REGION, COLLECTIONS, BATCH_LIMIT } from "../config/constants";

const TRIGGER = "onCategoryWrite";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetch all categories whose `position` is >= threshold (no upper bound),
 * then batch-update each one by adding `delta` to their position.
 * Fetches all matching docs at once before writing to avoid pagination
 * inconsistency while positions are in flux.
 *
 * @param excludeId  Skip this document ID (used to exclude the just-created doc)
 */
async function shiftPositions(
  threshold: number,
  delta: number,
  excludeId?: string,
): Promise<number> {
  const snap = await db
    .collection(COLLECTIONS.CATEGORIES)
    .where("position", ">=", threshold)
    .get();

  const docs = snap.docs.filter(
    (d) => d.id !== excludeId && (d.data().position as number) >= threshold,
  );
  if (docs.length === 0) return 0;

  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const doc of docs.slice(i, i + BATCH_LIMIT)) {
      batch.update(doc.ref, {
        position: (doc.data().position as number) + delta,
        updatedAt: new Date(),
      });
    }
    await batch.commit();
  }

  return docs.length;
}

/**
 * Atomically increment the `subtreeSize` of every ancestor by `delta`.
 * Uses FieldValue.increment so concurrent writes to different branches
 * don't clobber each other.
 */
async function adjustAncestorSubtreeSize(
  ancestorIds: string[],
  delta: number,
): Promise<void> {
  if (ancestorIds.length === 0) return;

  for (let i = 0; i < ancestorIds.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const id of ancestorIds.slice(i, i + BATCH_LIMIT)) {
      batch.update(db.collection(COLLECTIONS.CATEGORIES).doc(id), {
        subtreeSize: FieldValue.increment(delta),
        updatedAt: new Date(),
      });
    }
    await batch.commit();
  }
}

/**
 * Return the highest `position` currently stored across all categories.
 * Returns 0 if the collection is empty or no document has a position yet.
 * Excludes `excludeId` (the just-created document which has no position yet).
 */
async function getMaxPosition(excludeId?: string): Promise<number> {
  const snap = await db
    .collection(COLLECTIONS.CATEGORIES)
    .orderBy("position", "desc")
    .limit(excludeId ? 2 : 1)
    .get();

  for (const doc of snap.docs) {
    if (doc.id === excludeId) continue;
    return (doc.data().position as number) ?? 0;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Trigger
// ---------------------------------------------------------------------------

export const onCategoryWrite = onDocumentWritten(
  {
    document: `${COLLECTIONS.CATEGORIES}/{categoryId}`,
    region: REGION,
  },
  async (event) => {
    const categoryId = event.params.categoryId;

    const beforeData = event.data?.before.exists
      ? (event.data.before.data() as Record<string, unknown>)
      : null;
    const afterData = event.data?.after.exists
      ? (event.data.after.data() as Record<string, unknown>)
      : null;

    const isCreate = !beforeData && !!afterData;
    const isDelete = !!beforeData && !afterData;
    const isUpdate = !!beforeData && !!afterData;

    try {
      // ── CREATE ───────────────────────────────────────────────────────────
      if (isCreate) {
        const parentIds = (afterData!.parentIds as string[]) ?? [];
        const parentId = parentIds.length > 0
          ? parentIds[parentIds.length - 1]
          : null;

        let insertPosition: number;

        if (parentId) {
          const parentSnap = await db
            .collection(COLLECTIONS.CATEGORIES)
            .doc(parentId)
            .get();

          if (!parentSnap.exists) {
            logWarn(TRIGGER, "Parent not found, appending at end", { categoryId, parentId });
            insertPosition = (await getMaxPosition(categoryId)) + 1;
          } else {
            const p = parentSnap.data()!;
            const parentPos = (p.position as number) ?? 0;
            const parentSize = (p.subtreeSize as number) ?? 1;
            // Insert right after the last descendant of the parent
            insertPosition = parentPos + parentSize;
          }
        } else {
          // Root category — append after everything
          insertPosition = (await getMaxPosition(categoryId)) + 1;
        }

        // Shift every existing category at or beyond insertPosition up by 1.
        // Exclude the new doc itself (it has no position field yet).
        const shifted = await shiftPositions(insertPosition, +1, categoryId);

        // Write position and subtreeSize onto the new document
        await db.collection(COLLECTIONS.CATEGORIES).doc(categoryId).update({
          position: insertPosition,
          subtreeSize: 1,
          updatedAt: new Date(),
        });

        // Grow every ancestor's subtreeSize by 1
        await adjustAncestorSubtreeSize(parentIds, +1);

        logInfo(TRIGGER, "Category created — position assigned", {
          categoryId,
          position: insertPosition,
          parentId,
          shifted,
        });

      // ── DELETE ───────────────────────────────────────────────────────────
      } else if (isDelete) {
        const deletedPos = (beforeData!.position as number) ?? 0;
        const deletedSize = (beforeData!.subtreeSize as number) ?? 1;
        const parentIds = (beforeData!.parentIds as string[]) ?? [];

        if (deletedPos === 0) {
          logWarn(TRIGGER, "Deleted category had no position — skipping shift", { categoryId });
          return;
        }

        // Shift every category that came after the deleted subtree down by subtreeSize
        const shifted = await shiftPositions(deletedPos + deletedSize, -deletedSize);

        // Shrink every ancestor's subtreeSize
        await adjustAncestorSubtreeSize(parentIds, -deletedSize);

        logInfo(TRIGGER, "Category deleted — positions shifted", {
          categoryId,
          position: deletedPos,
          subtreeSize: deletedSize,
          shifted,
        });

      // ── UPDATE (move detection) ───────────────────────────────────────────
      } else if (isUpdate) {
        const beforeParentIds = (beforeData!.parentIds as string[]) ?? [];
        const afterParentIds = (afterData!.parentIds as string[]) ?? [];

        const beforeParentId = beforeParentIds[beforeParentIds.length - 1] ?? null;
        const afterParentId = afterParentIds[afterParentIds.length - 1] ?? null;

        if (beforeParentId !== afterParentId) {
          // Parent changed — mark tree as dirty so the reconcile job rebuilds it.
          // We don't attempt a real-time move because it requires repositioning
          // the entire subtree (all descendants) plus two ancestor chains.
          await db
            .collection(COLLECTIONS.CATEGORIES)
            .doc(categoryId)
            .update({ positionDirty: true, updatedAt: new Date() });

          logWarn(TRIGGER, "Category moved — positionDirty flagged for nightly reconcile", {
            categoryId,
            fromParent: beforeParentId,
            toParent: afterParentId,
          });
        }
        // Non-move updates (name, slug, display, etc.) need no position change.
      }
    } catch (err) {
      logError(TRIGGER, "Position update failed (non-fatal — will heal on next reconcile)", err, {
        categoryId,
      });
    }
  },
);
