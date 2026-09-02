"use client";

import { Suspense } from "react";

/**
 * Edit a store-scoped feature badge.
 *
 * `ROUTES.STORE.FEATURES_EDIT` has existed in the route map pointing here for
 * a long time with **no page behind it and no caller anywhere** — a dead key,
 * the inverse of Root Cause #37's "page with no nav entry". Editing was
 * reachable only through `SellerFeaturesView`'s drawer, so the route constant
 * described a capability the app did not have.
 *
 * Same component as the drawer and as `new/`, so the three cannot drift.
 */

import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { AdminFeatureEditorView, SELLER_ENDPOINTS, ROUTES } from "@mohasinac/appkit/client";



function PageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  return (
    <AdminFeatureEditorView
      featureId={params.id}
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

/*
 * Page-level Suspense. `export const dynamic` is a SERVER route-segment
 * config and has NO effect in a "use client" file, so it cannot make this
 * page dynamic — the client tree below reaches useSearchParams(), which
 * throws during prerender without a boundary (Root Cause #17). This boundary
 * is the fix. (This comment used to add that the dashboard layout's own
 * <Suspense> was "empirically not enough" — that was wrong; the layout's
 * boundary was being defeated by a swallowed prerender bailout, not ignored.
 * See Root Cause #89. A segment config is never the answer here, and
 * `audit-no-force-dynamic` blocks it.)
 */
export default function Page() {
  return (
    <Suspense>
      <PageInner />
    </Suspense>
  );
}
