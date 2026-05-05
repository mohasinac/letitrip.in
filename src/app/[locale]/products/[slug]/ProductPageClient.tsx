"use client";
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
