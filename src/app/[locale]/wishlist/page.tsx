import { Suspense } from "react";
import { WishlistPageClient } from "./WishlistPageClient";

/*
 * Server shell so this route can carry a segment config. The page body is a
 * client component reaching useSearchParams(), and `export const dynamic`
 * has NO effect inside a "use client" file — nor does a page-level
 * <Suspense> satisfy Next 16 static export on its own (verified). Moving the
 * body to a child and marking the SERVER shell dynamic is what works, and it
 * is the same lever that fixed every dashboard route at the layout level.
 */
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <WishlistPageClient />
    </Suspense>
  );
}
