/**
 * Trigger: onCategoryWrite
 *
 * Fires on any create, update, or delete of a document in the `categories`
 * collection. Syncs the category to the Algolia categories index so that
 * category/brand search stays up-to-date in real time.
 *
 * Rules:
 *   - Only active categories are indexed.
 *   - Inactive / deleted categories are removed from the index.
 *   - Brand categories (isBrand: true) live in the same index with a flag.
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getAlgoliaClient, ALGOLIA_CATEGORIES_INDEX } from "../config/algolia";
import { logInfo, logError } from "../utils/logger";
import { REGION, COLLECTIONS } from "../config/constants";

const TRIGGER = "onCategoryWrite";

/**
 * Convert a Firestore timestamp, Date, or number to epoch ms.
 * Returns undefined when the input is falsy.
 */
function toEpochMs(val: unknown): number | undefined {
  if (val == null) return undefined;
  if (typeof val === "number") return val;
  if (val instanceof Date) return val.getTime();
  if (typeof (val as { toMillis?: () => number }).toMillis === "function")
    return (val as { toMillis: () => number }).toMillis();
  if (typeof val === "string") return new Date(val).getTime();
  return undefined;
}

export const onCategoryWrite = onDocumentWritten(
  {
    document: `${COLLECTIONS.CATEGORIES}/{categoryId}`,
    region: REGION,
  },
  async (event) => {
    const categoryId = event.params.categoryId;

    const afterData = event.data?.after.exists
      ? (event.data.after.data() as Record<string, unknown>)
      : null;

    const isDelete = !afterData;
    const isActive = (afterData?.isActive as boolean) ?? false;

    // ── Remove from index on delete or deactivation ────────────────────
    if (isDelete || !isActive) {
      logInfo(TRIGGER, "Category removed/deactivated — removing from Algolia", {
        categoryId,
        reason: isDelete ? "deleted" : "inactive",
      });
      try {
        const client = getAlgoliaClient();
        await client.deleteObject({
          indexName: ALGOLIA_CATEGORIES_INDEX,
          objectID: categoryId,
        });
        logInfo(TRIGGER, "Removed from Algolia", { categoryId });
      } catch (err) {
        logError(TRIGGER, "Failed to remove from Algolia", err, {
          categoryId,
        });
      }
      return;
    }

    // ── Upsert active category into Algolia ────────────────────────────
    logInfo(TRIGGER, "Upserting category in Algolia", { categoryId });
    try {
      const client = getAlgoliaClient();
      const d = afterData;

      const metrics = (d.metrics ?? {}) as Record<string, unknown>;
      const display = (d.display ?? {}) as Record<string, unknown>;

      const record = {
        objectID: categoryId,
        name: (d.name as string) ?? "",
        slug: (d.slug as string) ?? "",
        description: (d.description as string) ?? undefined,
        tier: (d.tier as number) ?? 0,
        path: (d.path as string) ?? "",
        parentIds: (d.parentIds as string[]) ?? [],
        rootId: (d.rootId as string) ?? "",
        isLeaf: (d.isLeaf as boolean) ?? false,
        isBrand: (d.isBrand as boolean) ?? false,
        isFeatured: (d.isFeatured as boolean) ?? false,
        featuredPriority: (d.featuredPriority as number) ?? undefined,
        icon: (display.icon as string) ?? undefined,
        coverImage: (display.coverImage as string) ?? undefined,
        productCount: (metrics.productCount as number) ?? 0,
        totalProductCount: (metrics.totalProductCount as number) ?? 0,
        auctionCount: (metrics.auctionCount as number) ?? 0,
        totalItemCount: (metrics.totalItemCount as number) ?? 0,
        createdAt: toEpochMs(d.createdAt) ?? Date.now(),
        updatedAt: toEpochMs(d.updatedAt) ?? Date.now(),
      };

      await client.saveObject({
        indexName: ALGOLIA_CATEGORIES_INDEX,
        body: record,
      });
      logInfo(TRIGGER, "Upserted in Algolia", { categoryId });
    } catch (err) {
      logError(TRIGGER, "Failed to upsert category in Algolia", err, {
        categoryId,
      });
    }
  },
);
