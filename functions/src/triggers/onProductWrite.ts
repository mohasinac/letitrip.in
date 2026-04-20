/**
 * Trigger: onProductWrite
 *
 * Fires on any create, update, or delete of a document in the `products`
 * collection. Responsible for:
 *   1. Category metrics updates (productCount / auctionCount + ancestors)
 *   2. Store stats updates (totalProducts)
 *
 * Counter rules:
 *   - Only "published" products count towards category and store totals.
 *   - On status transition non-published → published: increment counters.
 *   - On status transition published → non-published: decrement counters.
 *   - On published product category change: decrement old, increment new.
 *   - On hard delete of a published product: decrement counters.
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { categoriesRepository as categoryRepository } from "@mohasinac/appkit";
import { ProductStatusValues } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";
import { db } from "../config/firebase-admin";
import { logInfo, logError } from "../utils/logger";
import { REGION, COLLECTIONS } from "../config/constants";

const TRIGGER = "onProductWrite";

/**
 * Resolve a category's materialized parentIds from Firestore.
 * Returns [] if the doc doesn't exist.
 */
async function getParentIds(categoryId: string): Promise<string[]> {
  if (!categoryId) return [];
  return (await categoryRepository.findById(categoryId))?.parentIds ?? [];
}

export const onProductWrite = onDocumentWritten(
  {
    document: `${COLLECTIONS.PRODUCTS}/{productId}`,
    region: REGION,
  },
  async (event) => {
    const productId = event.params.productId;

    // ── Determine before/after state ─────────────────────────────────────
    const beforeData = event.data?.before.exists
      ? (event.data.before.data() as Record<string, unknown>)
      : null;
    const afterData = event.data?.after.exists
      ? (event.data.after.data() as Record<string, unknown>)
      : null;

    const beforeStatus = (beforeData?.status as string | undefined) ?? null;
    const afterStatus = (afterData?.status as string | undefined) ?? null;
    const beforeCategory = (beforeData?.category as string | undefined) ?? null;
    const afterCategory = (afterData?.category as string | undefined) ?? null;
    const beforeStoreId =
      ((beforeData?.storeId as string | undefined) ||
        (beforeData?.sellerId as string | undefined)) ??
      null;
    const afterStoreId =
      ((afterData?.storeId as string | undefined) ||
        (afterData?.sellerId as string | undefined)) ??
      null;
    const isAuction = (afterData?.isAuction as boolean) ?? false;
    const beforeIsAuction = (beforeData?.isAuction as boolean) ?? false;

    const wasPublished = beforeStatus === ProductStatusValues.PUBLISHED;
    const isPublished = afterStatus === ProductStatusValues.PUBLISHED;
    const isDelete = !afterData;

    // ── Category & store counter logic ────────────────────────────────────
    try {
      if (isDelete && wasPublished && beforeCategory) {
        // Hard delete of a published product — decrement counters
        const parentIds = await getParentIds(beforeCategory);
        const batch = db.batch();
        categoryRepository.updateMetricsInBatch(
          batch,
          beforeCategory,
          parentIds,
          beforeIsAuction ? 0 : -1,
          beforeIsAuction ? -1 : 0,
          productId,
        );
        await batch.commit();

        if (beforeStoreId) {
          await storeRepository.incrementTotalProducts(beforeStoreId, -1);
        }

        logInfo(TRIGGER, "Decremented counters on hard-delete", {
          productId,
          category: beforeCategory,
          storeId: beforeStoreId,
        });
      } else if (!wasPublished && isPublished && afterCategory) {
        // Non-published → published: increment counters
        const parentIds = await getParentIds(afterCategory);
        const batch = db.batch();
        categoryRepository.updateMetricsInBatch(
          batch,
          afterCategory,
          parentIds,
          isAuction ? 0 : 1,
          isAuction ? 1 : 0,
          productId,
        );
        await batch.commit();

        if (afterStoreId) {
          await storeRepository.incrementTotalProducts(afterStoreId, 1);
        }

        logInfo(TRIGGER, "Incremented counters on publish", {
          productId,
          category: afterCategory,
          storeId: afterStoreId,
        });
      } else if (wasPublished && !isPublished && beforeCategory) {
        // Published → non-published (discontinued, sold, draft, etc.)
        const parentIds = await getParentIds(beforeCategory);
        const batch = db.batch();
        categoryRepository.updateMetricsInBatch(
          batch,
          beforeCategory,
          parentIds,
          beforeIsAuction ? 0 : -1,
          beforeIsAuction ? -1 : 0,
          productId,
        );
        await batch.commit();

        if (beforeStoreId) {
          await storeRepository.incrementTotalProducts(beforeStoreId, -1);
        }

        logInfo(TRIGGER, "Decremented counters on unpublish", {
          productId,
          category: beforeCategory,
          storeId: beforeStoreId,
        });
      } else if (
        wasPublished &&
        isPublished &&
        beforeCategory &&
        afterCategory &&
        beforeCategory !== afterCategory
      ) {
        // Category changed while product remains published
        const [beforeParentIds, afterParentIds] = await Promise.all([
          getParentIds(beforeCategory),
          getParentIds(afterCategory),
        ]);
        const batch = db.batch();

        // Decrement old category
        categoryRepository.updateMetricsInBatch(
          batch,
          beforeCategory,
          beforeParentIds,
          beforeIsAuction ? 0 : -1,
          beforeIsAuction ? -1 : 0,
          productId,
        );
        // Increment new category
        categoryRepository.updateMetricsInBatch(
          batch,
          afterCategory,
          afterParentIds,
          isAuction ? 0 : 1,
          isAuction ? 1 : 0,
          productId,
        );
        await batch.commit();

        logInfo(TRIGGER, "Moved product between categories", {
          productId,
          from: beforeCategory,
          to: afterCategory,
        });
      }
    } catch (err) {
      // Non-fatal: counters will be corrected by the nightly reconcile job
      logError(TRIGGER, "Counter update failed (non-fatal)", err, {
        productId,
      });
    }

    if (isDelete || !isPublished) {
      logInfo(TRIGGER, "Search indexing skipped (provider removed)", {
        productId,
        isDelete,
        status: afterStatus,
      });
    }
  },
);
