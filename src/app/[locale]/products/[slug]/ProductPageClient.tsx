"use client";
// audit-unnecessary-use-client-ok: passes JSX render-prop callback to ProductDetailPageView (client component); functions cannot cross RSC→client boundary
import { ProductDetailPageView } from "@mohasinac/appkit";
import { MakeOfferButton } from "@mohasinac/appkit/client";
import { submitProductOffer } from "./actions";

export function ProductPageClient({ slug }: { slug: string }) {
  return (
    <ProductDetailPageView
      slug={slug}
      renderOfferAction={({ productId, price, minOfferPercent }) => (
        <MakeOfferButton
          productId={productId}
          listedPrice={price}
          minOfferPercent={minOfferPercent}
          onMakeOffer={submitProductOffer}
        />
      )}
    />
  );
}
