"use client";

/**
 * Create a store-scoped feature badge.
 *
 * ## What this replaced
 *
 * A page that did not create anything. It collected a single `label`, checked
 * it was non-empty, and then called `router.push(ROUTES.STORE.FEATURES)` — no
 * API call anywhere in the file. A seller filled the form, was returned to the
 * list, and their badge simply did not exist. Same shape as the coupon PATCH
 * that returned 200 and never wrote (Root Cause #40): the success path looked
 * indistinguishable from a real one.
 *
 * It also collected one field where the real feature has ten, so even a
 * working version of it would have produced a badge with no icon, category or
 * product-type scope.
 *
 * `AdminFeatureEditorView` is the real editor and already supports exactly
 * this: `fixedScope="store"` plus an `endpointOverride` pointing at the seller
 * routes — which is how `SellerFeaturesView`'s drawer has always used it.
 * Rendering it here makes the page and the drawer one implementation instead
 * of two that can disagree.
 */

import { AdminFeatureEditorView, SELLER_ENDPOINTS, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <AdminFeatureEditorView
      fixedScope="store"
      endpointOverride={{
        create: SELLER_ENDPOINTS.FEATURES,
        byId: SELLER_ENDPOINTS.FEATURE_BY_ID,
      }}
      onSaved={() => router.push(String(ROUTES.STORE.FEATURES))}
      onDeleted={() => router.push(String(ROUTES.STORE.FEATURES))}
    />
  );
}
