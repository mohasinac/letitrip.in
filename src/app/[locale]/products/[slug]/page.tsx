import type { Metadata } from "next";
import { ProductDetailPageView, getProductById, productJsonLd, breadcrumbJsonLd } from "@mohasinac/appkit";
import { MakeOfferButton } from "@mohasinac/appkit/client";
import { submitProductOffer } from "./actions";
import { generateProductMetadata, LETITRIP_SEO } from "@/constants/seo.server";

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
  const product = await getProductById(slug).catch(() => null);

  const ldProduct = product
    ? productJsonLd({
        id: product.id,
        title: product.title,
        description: product.description ?? "",
        slug: product.slug ?? slug,
        price: product.price,
        currency: product.currency ?? "INR",
        mainImage: product.mainImage,
        images: product.images,
        category: product.category,
        status: product.status,
      })
    : null;

  const ldBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
    { name: product?.title ?? "Product", url: `/products/${slug}` },
  ]);

  return (
    <>
      {ldProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldProduct) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
      />
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
    </>
  );
}
