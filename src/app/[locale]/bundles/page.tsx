/**
 * Public bundles listing page — SB3-G.
 */
import { BundlesListingView } from "@mohasinac/appkit";
import type { BundleDocument } from "@mohasinac/appkit";
import { bundlesRepository } from "@mohasinac/appkit/server";

export const revalidate = 60;

export default async function Page() {
  const bundles = (await bundlesRepository.findAll()).filter(
    (b: BundleDocument) =>
      b.status === "published" || b.status === "out_of_stock",
  );
  return <BundlesListingView bundles={bundles} total={bundles.length} />;
}
