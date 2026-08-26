import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productRepository,
  storeRepository,
  sellerUpdateProduct,
  sellerDeleteProduct,
  ProductStatusValues,
} from "@mohasinac/appkit";
import { ROLES_STORE_READ, ROLES_STORE_WRITE } from "@/constants";

/**
 * A single product owned by THIS seller.
 *
 * ## Why this file did not exist until 2026-08-26
 *
 * `SELLER_ENDPOINTS.PRODUCT_BY_ID` has been declared for a long time, and
 * `SellerProductsView`'s publish/unpublish toggle has been PATCHing it —
 * at nothing. Only the collection, `bulk-location` and `scan` routes existed.
 *
 * Worse than the bids case: that call is wrapped in `.catch(() => null)`, so
 * it fails **silently**. A seller clicks Publish, the row does not change, and
 * nothing anywhere reports why. Found by `audit-client-verb-match`'s NO_ROUTE
 * rule once it learned to scan raw `fetch`.
 *
 * ## The ownership check is NOT re-implemented here
 *
 * `sellerUpdateProduct` / `sellerDeleteProduct` already resolve the caller's
 * store and reject a foreign product — and they also enforce the prize-draw
 * locks (`assertPrizeDrawNotLocked`, `assertPrizeDrawWonItemsImmutable`) and
 * finalise staged media. Re-checking ownership in the handler would be a
 * second copy of a rule that can drift; skipping the action entirely would
 * silently drop all three of those protections, which is exactly the
 * create-vs-update asymmetry Root Cause #39 is about.
 *
 * Roles-only, no `permission:` — matching every sibling store route. The
 * `store:*` permission namespace does not exist, so an invented one would
 * match nothing while reading as a gate (Root Cause #33).
 */

/**
 * Narrow on purpose. The full product editor posts through
 * `createSellerProduct` / the products API; this route exists for the row-level
 * controls on the listing page, and a wide `.passthrough()` here would be a
 * second, unvalidated write door onto the same document.
 */
const patchSchema = z
  .object({
    status: z.enum(ProductStatusValues).optional(),
    isFeatured: z.boolean().optional(),
    isPromoted: z.boolean().optional(),
  })
  .strict();

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_READ],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const product = await productRepository.findById(id);
      if (!product) return errorResponse("Product not found", 404);

      const store = await storeRepository.findByOwnerId(user!.uid);
      // Not-found rather than forbidden: a seller has no business learning
      // that another store's product id exists.
      if (!store || product.storeId !== store.id) {
        return errorResponse("Product not found", 404);
      }
      return successResponse(product);
    },
  }),
);
export const GET = __GET__g;

const __PATCH__g = withProviders(
  createRouteHandler<(typeof patchSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: patchSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id: string }).id;
      const updated = await sellerUpdateProduct(
        user!.uid,
        user!.role ?? "seller",
        id,
        body as never,
      );
      return successResponse(updated, "Product updated");
    },
  }),
);
export const PATCH = __PATCH__g;

const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      await sellerDeleteProduct(user!.uid, user!.role ?? "seller", id);
      return successResponse({ id }, "Product deleted");
    },
  }),
);
export const DELETE = __DELETE__g;
