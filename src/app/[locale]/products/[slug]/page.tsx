import type { Metadata } from "next";
import {
  ProductDetailPageView,
  productJsonLd,
  breadcrumbJsonLd,
  loadProductFeaturesForStore,
} from "@mohasinac/appkit";
import { getProductForDetail } from "@mohasinac/appkit";
import { getSiteSettingsGlobal, safeRead, storeRepository } from "@mohasinac/appkit/server";
import { MakeOfferButton, ProductDetailActions, PageViewTracker } from "@mohasinac/appkit/client";
import { submitProductOffer } from "@/actions/offer.actions";
import { generateProductMetadata } from "@/constants/seo.server";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // getProductForDetail is wrapped in React.cache() — shared with the page render.
  const product = await getProductForDetail(slug);
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
  const product = await getProductForDetail(slug);
  // Everything below is chrome around the product: feature chips, and the two
  // inputs to the COD/EMI badges. Each degrades to "not shown" rather than
  // taking the page down with it — but the failure is now recorded.
  const productFeatures = await safeRead(
    () => loadProductFeaturesForStore(product?.storeId ?? null),
    {
      route: "/products/[slug]",
      key: "productFeatures.loadProductFeaturesForStore",
      fallback: [],
    },
  );
  const siteSettings = await safeRead(() => getSiteSettingsGlobal(), {
    route: "/products/[slug]",
    key: "siteSettings.getSiteSettingsGlobal",
    fallback: null,
  });
  const store = product?.storeId
    ? await safeRead(() => storeRepository.findById(product.storeId), {
        route: "/products/[slug]",
        key: "stores.findById",
        fallback: null,
      })
    : null;
  const codEnabled = siteSettings?.payment?.codEnabled === true;
  // Fully-resolved per-product EMI eligibility: site-wide flag AND the
  // seller's own opt-in AND price above the minimum order value — mirrors
  // checkEmiEligibility()'s checkout-time rule exactly (strict `>`).
  const emiEnabled =
    siteSettings?.emi?.enabled === true &&
    store?.emiEnabled === true &&
    typeof product?.price === "number" &&
    product.price > (siteSettings?.emi?.minOrderValue ?? Infinity);

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
        // `avgRating` / `reviewCount` are denormalised onto the product document
        // and already fetched above — emitting the AggregateRating costs zero
        // extra reads and is what earns review stars in Google results.
        // `aggregateRatingJsonLd` is deliberately NOT used: it builds a second,
        // offer-less `Product` node, duplicating the entity on the same page.
        rating:
          typeof product.avgRating === "number" && typeof product.reviewCount === "number"
            ? { average: product.avgRating, count: product.reviewCount }
            : undefined,
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
      <PageViewTracker entityType="product" entityId={slug} url={`/products/${slug}`} />
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
        codEnabled={codEnabled}
        emiEnabled={emiEnabled}
        renderOfferAction={({ productId, price, bounds }) => (
          <MakeOfferButton
            productId={productId}
            listedPrice={price}
            bounds={bounds}
            onMakeOffer={submitProductOffer}
          />
        )}
        renderPrimaryActions={(ctx) => (
          <ProductDetailActions
            productId={ctx.productId}
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
