import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createApiHandler,
  successResponse,
  ApiErrors,
  productRepository,
  storeRepository,
  resolveStockResync,
  type ProductDocument,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

/**
 * PATCH /api/store/products/bulk-stock — set `stockQuantity` on up to 50 of
 * the caller's own products in one atomic write. C3's last item.
 *
 * ## 🛑 Why this cannot be a loop over `productRepository.update`
 *
 * Two independent reasons, and the second is the dangerous one.
 *
 * (1) 50 sequential `update` calls are 100+ Firestore round trips against a
 *     request Rule #6 budgets at ~3, and `bulk-location`'s own header records
 *     what the `Promise.all` shape it replaced actually did: left a PARTIAL
 *     result on any mid-flight failure and still returned
 *     `{ updated: productIds.length }` — a count it had not achieved.
 *
 * (2) `availableQuantity` is NOT `stockQuantity`. The difference between them
 *     is the outstanding reservation — units held by placed-but-unpaid orders —
 *     so the number written differs per product even when the seller typed one
 *     figure. That makes a single shared patch wrong, which is why this uses
 *     `batchUpdateEach` and applies `resolveStockResync` per row.
 *
 * 🛑 And it is why the rule is IMPORTED rather than re-derived here. Writing
 * `availableQuantity: stock` would hand reserved units back to the shelf and
 * oversell them; writing only `stockQuantity` would leave a sold-out product
 * unbuyable — which is the exact bug A4 closed, reintroduced through a new
 * door. A bulk editor that quietly breaks restock is worse than no bulk
 * editor.
 */

const BULK_MAX = 50;
/** A seller typing a five-digit stock figure has made a mistake, not a sale. */
const STOCK_MAX = 100_000;

/**
 * 🛑 A Zod schema, not a `body as {…}` cast. The cast has zero runtime effect —
 * `audit-unvalidated-request-body` is strict-zero on exactly that, and rightly:
 * it is what lets a string, an object or an absent field reach arithmetic.
 *
 * 🛑 `storeId` is deliberately ABSENT. Ownership comes from the session and is
 * re-checked per product below; accepting it from the body would let any seller
 * edit another's stock.
 *
 * 🛑 `.int().min(0)` — not `.positive()`. Zero is the single most useful value
 * here ("mark these out of stock"), and `.positive()` would reject it while
 * accepting every other number. Same trap as a truthiness test.
 */
const bulkStockSchema = z.object({
  productIds: z.array(z.string().min(1)).min(1).max(BULK_MAX),
  stockQuantity: z.number().int().min(0).max(STOCK_MAX),
});

export const PATCH = withProviders(
  createApiHandler<(typeof bulkStockSchema)["_output"]>({
    roles: [...ROLES_STORE_WRITE],
    schema: bulkStockSchema,
    handler: async ({ user, body }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store found for this account");

      const { productIds, stockQuantity } = body!;

      // Ownership is checked for the WHOLE batch before anything is written —
      // one mismatched id rejects the request rather than partially applying.
      const products = await Promise.all(productIds.map((id) => productRepository.findById(id)));
      for (const [i, p] of products.entries()) {
        if (!p || p.storeId !== store.id) {
          return ApiErrors.forbidden(`Product ${productIds[i]} does not belong to your store`);
        }
      }

      /*
       * The per-row patch. `resolveStockResync` returns `{}` when nothing
       * changes, and `batchUpdateEach` skips an empty patch — so a product
       * already at this figure costs no write rather than a no-op one.
       */
      const entries = (products as ProductDocument[]).map((doc) => {
        const patch = { stockQuantity } as Partial<ProductDocument>;
        return { doc, patch: { ...patch, ...resolveStockResync(doc, patch) } };
      });

      const updated = await productRepository.batchUpdateEach(entries);

      /*
       * 🛑 Reported separately, because they are different facts and a seller
       * reading "12 updated" over a 12-row selection learns nothing. `updated`
       * is rows WRITTEN; `reservedHeld` names the rows whose available figure
       * is below the new stock because units are still reserved — which is
       * exactly the case a seller would otherwise report as the bulk edit not
       * having worked.
       */
      const reservedHeld = entries.filter(
        (e) =>
          typeof e.patch.availableQuantity === "number" &&
          e.patch.availableQuantity < stockQuantity,
      ).length;

      return successResponse({
        updated,
        requested: productIds.length,
        unchanged: productIds.length - updated,
        reservedHeld,
      });
    },
  }),
);
