import { isListingType } from "@mohasinac/appkit";
import { ProductNewClient } from "./product-new-client";

/**
 * Create a product of any listing type.
 *
 * ## `?listingType=` is the create path for the per-type admin listings
 *
 * Five admin pages (art, classified, digital-codes, live, stickers) plus prize
 * draws are views over `products` filtered by `listingType`, and they had no
 * create control at all. They link here with their own type, so the row an
 * admin creates appears on the list they created it from — landing on
 * `standard` instead would create a row that immediately vanishes.
 *
 * Narrowed with `isListingType`, not cast: the param is untrusted, and the
 * editor writes whatever type it is handed straight onto the document.
 *
 * Reading `searchParams` makes this route dynamic. That costs nothing here —
 * `admin/layout.tsx` already `await`s the session, so all 238 routes beneath it
 * are per-request by design (§ "a dynamic API in a DASHBOARD layout is the
 * correct lever").
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ listingType?: string }>;
}) {
  const { listingType } = await searchParams;
  return (
    <ProductNewClient
      initialListingType={isListingType(listingType) ? listingType : undefined}
    />
  );
}
