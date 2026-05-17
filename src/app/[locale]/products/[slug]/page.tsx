import type { Metadata } from "next";
import {
  ProductDetailPageView,
  productJsonLd,
  breadcrumbJsonLd,
  loadProductFeaturesForStore,
} from "@mohasinac/appkit";
import { getProductForDetail } from "@mohasinac/appkit";
import { MakeOfferButton, ProductDetailActions } from "@mohasinac/appkit/client";
import { submitProductOffer } from "./actions";
import { generateProductMetadata } from "@/constants";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // getProductForDetail is wrapped in React.cache() — shared with the page render.
  const product = await getProductForDetail(slug).catch(() => null);
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
  const product = await getProductForDetail(slug).catch(() => null);
  const productFeatures = await loadProductFeaturesForStore(
    product?.storeId ?? null,
  ).catch(() => []);

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

  const ldBreadcrumb = product
    ? breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: "Products", url: "/products" },
        { name: product.title, url: `/products/${slug}` },
      ])
    : null;

  return (
    <>
      {ldProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldProduct) }}
        />
      )}
      {ldBreadcrumb && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
        />
      )}
      <ProductDetailPageView
        slug={slug}
        initialProduct={product}
        productFeatures={productFeatures}
        renderOfferAction={({ productId, price, minOfferPercent }) => (
          <MakeOfferButton
            productId={productId}
            listedPrice={price}
            minOfferPercent={minOfferPercent}
            onMakeOffer={(pid, amount, note) =>
              submitProductOffer(pid, amount, note)
            }
          />
        )}
        renderPrimaryActions={(ctx) => (
          <ProductDetailActions
            productId={ctx.productId}
            productSlug={ctx.productSlug}
            productTitle={ctx.productTitle}
            productImage={ctx.productImage}
            price={ctx.price ?? undefined}
            currency={ctx.currency}
            inStock={ctx.inStock}
            variant={ctx.variant}
          />
        )}
      />
    </>
  );
}
