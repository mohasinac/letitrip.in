import type { Metadata } from "next";
import { ProductDetailPageView, getProductById } from "@mohasinac/appkit";
import { MakeOfferButton } from "@mohasinac/appkit/client";
import { submitProductOffer } from "./actions";
import { generateProductMetadata } from "@/constants/seo.server";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductById(slug).catch(() => null);
  if (!product) return { title: "Product Not Found" };
  return generateProductMetadata({
    title: product.title,
    description: product.description ?? "",
    slug: product.slug ?? slug,
    mainImage: product.mainImage || product.images?.[0],
    category: product.category,
  });
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
