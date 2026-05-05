import type { Metadata } from "next";
import { ProductDetailPageView } from "@mohasinac/appkit";
import { MakeOfferButton } from "@mohasinac/appkit/client";
import { submitProductOffer } from "./actions";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { title };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
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
