import type { Metadata } from "next";
import {
  ProductDetailPageView,
  productJsonLd,
  gatedPriceWebPageJsonLd,
  breadcrumbJsonLd,
  loadProductFeaturesForStore,
  // Runtime values in a Server Component, so the BARE entry — never
  // `@mohasinac/appkit/client`, whose bindings become client-reference proxies
  // that throw as an opaque React #441 when called (Root Cause #76).
  pluginFor,
  normalizeListingType,
} from "@mohasinac/appkit";
import { getProductForDetail } from "@mohasinac/appkit";
import { getSiteSettingsGlobal, safeRead, storeRepository } from "@mohasinac/appkit/server";
import { MakeOfferButton, ProductDetailActions, PageViewTracker } from "@mohasinac/appkit/client";
import { submitProductOffer } from "@/actions/offer.actions";
import { generateProductMetadata } from "@/constants/seo.server";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // getProductForDetail is wrapped in React.cache() — shared with the page render.
  const product = await getProductForDetail(slug);
  // A missing product still answers 200 (the view renders its own not-found
  // state rather than throwing), so without an explicit robots directive this
  // page inherits the root layout's `index: true` — and /products/<anything> is
  // an unbounded URL space, every member of which would be an indexable soft
  // 404. /auctions/<missing> and /stores/<missing> already serve noindex; this
  // brings the product route in line with them.
  if (!product) {
    return { title: "Product Not Found", robots: { index: false, follow: false } };
  }
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
  // A record that does not exist must render the 404 view - that is what gets it
  // marked noindex. The HTTP STATUS stays 200, and that is Next's documented
  // behaviour rather than a bug: the response is streamed, so headers are already
  // sent by the time notFound() runs and the status can no longer change. Next
  // injects <meta name="robots" content="noindex"> into the streamed HTML
  // instead, and that is what actually keeps the URL out of the index.
  // Before this, the page rendered its OWN "not found" body with no noindex at
  // all - a genuine soft 404 that stayed indexable forever.
  if (!product) notFound();

  /*
   * 🛑 A NON-STANDARD listing must not be served here — it gets its own route.
   *
   * This page fetched by slug and rendered the standard product view for
   * whatever came back, with no check on `listingType`. Measured live:
   * `/products/auction-beyblade-metal-lightning-l-drago` returned **200** with
   * a full standard page — "Buy Now", "Add to Cart", "Add to Wishlist" and
   * **no bid controls at all** — while the real auction lives at
   * `/auctions/{slug}`. It also declared ITSELF canonical, so one item had two
   * indexable URLs each claiming to be the original.
   *
   * And a crawler was actively pointed at the wrong one: `productJsonLd` builds
   * `offers.url` from `/products/{slug}` unconditionally, so the auction page's
   * own structured data advertised the offer at this path. That is Root Cause
   * #48 (a listing "reverting to standard") surviving in the one place nobody
   * clicks — a machine-readable URL.
   *
   * `pluginFor().detailRoute()` is the single owner of where a type lives, so
   * the comparison stays correct as types are added. `standard`, `art` and
   * `stickers` resolve to this very path (deliberately — art and stickers use
   * the standard checkout flow and have no dedicated route), so they fall
   * through and nothing changes for them.
   *
   * PERMANENT, not temporary: a 307 explicitly tells a search engine to KEEP
   * the old address indexed, which is the whole failure mode the apex→www
   * redirect exists to avoid. Same reasoning, one path down.
   */
  const canonicalRoute = pluginFor(normalizeListingType(product)).detailRoute(slug);
  if (canonicalRoute !== `/products/${slug}`) permanentRedirect(canonicalRoute);

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
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ldProduct) }}
          />
          {/* Paired with the offer above, never emitted alone: the price is
              gated for signed-out visitors, and Googlebot crawls signed out, so
              this declares the gap rather than leaving it as an undeclared
              structured-data mismatch. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(
                gatedPriceWebPageJsonLd(`/products/${product?.slug ?? slug}`),
              ),
            }}
          />
        </>
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
        renderOfferAction={({ productId, price, bounds, listingStoreId }) => (
          <MakeOfferButton
            productId={productId}
            listedPrice={price}
            bounds={bounds}
            listingStoreId={listingStoreId}
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
