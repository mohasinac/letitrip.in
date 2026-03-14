/**
 * Trigger: onStoreWrite
 *
 * Fires on any create, update, or delete of a document in the `stores`
 * collection. Syncs the store to the Algolia stores index so that
 * store search stays up-to-date in real time.
 *
 * Rules:
 *   - Only active + public stores are indexed.
 *   - Non-public, non-active, or deleted stores are removed from the index.
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getAlgoliaClient, ALGOLIA_STORES_INDEX } from "../config/algolia";
import { logInfo, logError } from "../utils/logger";
import { REGION, COLLECTIONS } from "../config/constants";

const TRIGGER = "onStoreWrite";

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

export const onStoreWrite = onDocumentWritten(
  {
    document: `${COLLECTIONS.STORES}/{storeId}`,
    region: REGION,
  },
  async (event) => {
    const storeId = event.params.storeId;

    const afterData = event.data?.after.exists
      ? (event.data.after.data() as Record<string, unknown>)
      : null;

    const isDelete = !afterData;
    const status = (afterData?.status as string) ?? "";
    const isPublic = (afterData?.isPublic as boolean) ?? false;
    const shouldIndex = !isDelete && status === "active" && isPublic;

    // ── Remove from index when not eligible ────────────────────────────
    if (!shouldIndex) {
      logInfo(TRIGGER, "Store removed/hidden — removing from Algolia", {
        storeId,
        reason: isDelete ? "deleted" : `status=${status}, isPublic=${isPublic}`,
      });
      try {
        const client = getAlgoliaClient();
        await client.deleteObject({
          indexName: ALGOLIA_STORES_INDEX,
          objectID: storeId,
        });
        logInfo(TRIGGER, "Removed from Algolia", { storeId });
      } catch (err) {
        logError(TRIGGER, "Failed to remove from Algolia", err, { storeId });
      }
      return;
    }

    // ── Upsert active+public store into Algolia ────────────────────────
    logInfo(TRIGGER, "Upserting store in Algolia", { storeId });
    try {
      const client = getAlgoliaClient();
      const d = afterData!;

      const stats = (d.stats ?? {}) as Record<string, unknown>;

      const record = {
        objectID: storeId,
        storeSlug: (d.storeSlug as string) ?? "",
        storeName: (d.storeName as string) ?? "",
        storeDescription: (d.storeDescription as string) ?? undefined,
        storeCategory: (d.storeCategory as string) ?? undefined,
        storeLogoURL: (d.storeLogoURL as string) ?? undefined,
        storeBannerURL: (d.storeBannerURL as string) ?? undefined,
        ownerId: (d.ownerId as string) ?? "",
        status,
        isPublic,
        isVacationMode: (d.isVacationMode as boolean) ?? false,
        location: (d.location as string) ?? undefined,
        totalProducts: (stats.totalProducts as number) ?? 0,
        itemsSold: (stats.itemsSold as number) ?? 0,
        totalReviews: (stats.totalReviews as number) ?? 0,
        averageRating: (stats.averageRating as number) ?? 0,
        createdAt: toEpochMs(d.createdAt) ?? Date.now(),
        updatedAt: toEpochMs(d.updatedAt) ?? Date.now(),
      };

      await client.saveObject({
        indexName: ALGOLIA_STORES_INDEX,
        body: record,
      });
      logInfo(TRIGGER, "Upserted in Algolia", { storeId });
    } catch (err) {
      logError(TRIGGER, "Failed to upsert store in Algolia", err, { storeId });
    }
  },
);
