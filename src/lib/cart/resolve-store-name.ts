import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { safeRead } from "@mohasinac/appkit/server";
/*
 * The DEFINING module, never the `@/constants` barrel: that barrel re-exports
 * `navigation.tsx`, which imports `@mohasinac/appkit/client`, and pulling the
 * "use client" entry into a server graph instantiates appkit a second time
 * with its own empty provider registry — every authenticated route then
 * answers 401 (CLAUDE.md, Known TS Patterns).
 */
import { CART_ENDPOINTS } from "@mohasinac/appkit/constants/api-endpoints";

/**
 * The seller name a cart line is stamped with.
 *
 * ## Why this is not just `product.storeName`
 *
 * `ProductDocument.storeName` is an OPTIONAL denormalised mirror of the store
 * document, kept in step by the `storeNameBackfill` job. Treating it as
 * authoritative — `product.storeName ?? ""` — writes an empty name whenever
 * that mirror has not caught up. Measured 2026-10-21: **1 of 14 live products
 * has it unset.**
 *
 * ## Why an empty name is worse than it looks
 *
 * The cart line is a SNAPSHOT, and checkout never re-resolves it: every
 * checkout surface reads `firstItem.storeName` straight off the line
 * (`_internal/server/features/checkout/actions.ts`), falling back to
 * `firstItem.storeId` or to `undefined`. So a blank written here is what makes
 * the checkout seller heading render a raw `store-…` slug — one missed
 * resolution at write time, surfacing two pages later with no way to recover.
 *
 * ## Third copy, so it got extracted
 *
 * appkit's `addItemToCart` has this logic as a module-private
 * `resolveStoreName`, and `POST /api/cart` had it inline. Rule of Three.
 *
 * Falls back to the storeId rather than an empty string: a slug is ugly but
 * identifies the seller, and a group header is better wrong-looking than
 * absent.
 */
export async function resolveStoreNameForCart(
  candidate: string | undefined,
  storeId: string | undefined,
): Promise<string> {
  if (candidate?.trim()) return candidate;
  if (!storeId) return "";
  const store = await safeRead(() => storeRepository.findById(storeId), {
    route: CART_ENDPOINTS.GET,
    key: "stores.findById",
    fallback: null,
  });
  return store?.storeName ?? storeId;
}
