import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoriesIndexPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const metadata: Metadata = _gm({
  title: "Browse Collectibles Categories — LetItRip",
  description:
    "Explore action figures, trading cards, diecast vehicles, model kits, spinning tops and vintage collectibles on LetItRip.",
  path: "/categories",
  keywords: ["action figures", "trading cards", "diecast vehicles", "gundam", "beyblade", "collectibles categories"],
});

export const revalidate = 3600;

/*
 * 🛑 This page deliberately does NOT read `searchParams`, and that is what makes
 * it static.
 *
 * `CategoriesIndexPageView` performs no Firestore read — the 200-document read
 * it used to do fed an `initialData` prop that `CategoriesIndexListing`
 * destructured as `_` and discarded. Filtering, sorting and paging are entirely
 * client-side through `useCategoriesFiltered`, so there is nothing on this route
 * that varies by query string on the server.
 *
 * Dropping the read turns `revalidate = 300` from inert into real: awaiting
 * `searchParams` forces dynamic rendering and silently overrides the declaration
 * (Root Cause #94). This route now actually caches.
 *
 * 🛑 Do NOT copy this to the other listing pages. `/products` and friends render
 * their grid INTO the SSR HTML from `initialData`; making those static would
 * bail `useSearchParams()` to CSR and ship a crawler an empty page — and the
 * build would still pass (Root Cause #17b). This page is safe only because its
 * grid was already client-rendered.
 */
export default async function Page() {
  return (
    <>
      <PageViewTracker entityType="listing" entityId="categories" url="/categories" />
      <Suspense>
        <CategoriesIndexPageView />
      </Suspense>
    </>
  );
}
