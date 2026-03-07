/**
 * Trigger: onProductWrite
 *
 * Fires on any create, update, or delete of a document in the `products`
 * collection. Keeps the Algolia search index in sync in real-time so the
 * manual `/api/admin/algolia/sync` endpoint is only needed for a one-time
 * bulk backfill.
 *
 * Behaviour:
 *   - CREATE / UPDATE and status === "published"  → upsert record in Algolia
 *   - CREATE / UPDATE and status !== "published"  → delete from Algolia (if present)
 *   - DELETE                                       → delete from Algolia (if present)
 *
 * The Algolia record shape mirrors AlgoliaProductRecord in src/lib/search/algolia.ts.
 */
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getAlgoliaClient, ALGOLIA_INDEX } from "../config/algolia";
import { logInfo, logError } from "../utils/logger";
import { REGION, COLLECTIONS } from "../config/constants";

const TRIGGER = "onProductWrite";

export const onProductWrite = onDocumentWritten(
  {
    document: `${COLLECTIONS.PRODUCTS}/{productId}`,
    region: REGION,
  },
  async (event) => {
    const productId = event.params.productId;

    // ── DELETE ────────────────────────────────────────────────────────────
    if (!event.data?.after.exists) {
      logInfo(TRIGGER, "Product deleted — removing from Algolia", {
        productId,
      });
      try {
        const client = getAlgoliaClient();
        await client.deleteObject({
          indexName: ALGOLIA_INDEX,
          objectID: productId,
        });
        logInfo(TRIGGER, "Removed from Algolia", { productId });
      } catch (err) {
        logError(TRIGGER, "Failed to remove from Algolia", err, { productId });
      }
      return;
    }

    const data = event.data.after.data() as Record<string, unknown>;
    const status = data?.status as string | undefined;

    // ── UNPUBLISHED / DRAFT / SOLD ────────────────────────────────────────
    // Remove from index so unpublished products don't appear in search results.
    if (status !== "published") {
      logInfo(TRIGGER, "Product not published — removing from Algolia", {
        productId,
        status,
      });
      try {
        const client = getAlgoliaClient();
        await client.deleteObject({
          indexName: ALGOLIA_INDEX,
          objectID: productId,
        });
      } catch (err) {
        // Non-fatal: the object may not exist in the index yet
        logError(
          TRIGGER,
          "Failed to remove unpublished product from Algolia",
          err,
          {
            productId,
          },
        );
      }
      return;
    }

    // ── UPSERT ────────────────────────────────────────────────────────────
    logInfo(TRIGGER, "Upserting product in Algolia", { productId });
    try {
      const client = getAlgoliaClient();

      const record = {
        objectID: productId,
        title: (data.title as string) ?? "",
        description: (data.description as string) ?? "",
        category: (data.category as string) ?? "",
        subcategory: (data.subcategory as string) ?? "",
        brand: (data.brand as string) ?? "",
        price: (data.price as number) ?? 0,
        currency: (data.currency as string) ?? "INR",
        mainImage: (data.mainImage as string) ?? "",
        tags: (data.tags as string[]) ?? [],
        sellerId: (data.sellerId as string) ?? "",
        sellerName: (data.sellerName as string) ?? "",
        status,
        isAuction: (data.isAuction as boolean) ?? false,
        currentBid: (data.currentBid as number) ?? null,
        startingBid: (data.startingBid as number) ?? null,
        featured: (data.featured as boolean) ?? false,
        isPromoted: (data.isPromoted as boolean) ?? false,
        createdAt:
          data.createdAt != null &&
          typeof (data.createdAt as { toMillis?: () => number }).toMillis ===
            "function"
            ? (data.createdAt as { toMillis: () => number }).toMillis()
            : Date.now(),
      };

      await client.saveObject({ indexName: ALGOLIA_INDEX, body: record });
      logInfo(TRIGGER, "Upserted in Algolia", { productId });
    } catch (err) {
      logError(TRIGGER, "Failed to upsert product in Algolia", err, {
        productId,
      });
    }
  },
);
