import type { Metadata } from "next";
import { loadProductFeaturesForStore } from "@mohasinac/appkit/features/products/repository/loadProductFeatures";
import { normalizeListingType } from "@mohasinac/appkit/features/products/utils/listing-type";
// Defining module, not the barrel — Root Cause #18, and the same deep path
// `CheckoutRouteClient` already uses for this constant.
import { COD_MAX_ORDER_VALUE_FALLBACK } from "@mohasinac/appkit/features/admin/schemas/firestore";
import { productJsonLd, breadcrumbJsonLd } from "@mohasinac/appkit/seo/json-ld";
import { productCrumbs, withTrailHead } from "@mohasinac/appkit/features/categories/utils/breadcrumb-chain";
import { ProductDetailPageView, pluginFor } from "@mohasinac/appkit";
import { productImageUrls } from "@mohasinac/appkit";
import {
  getProductForDetail,
  ModelCompositionPanel,
  LISTING_TYPE_HAS_COMPOSITION,
  ROUTES,
} from "@mohasinac/appkit";
import {
  getSiteSettingsGlobal,
  getCompositionsForCategory,
  safeRead,
  storeRepository,
} from "@mohasinac/appkit/server";
import { MakeOfferButton, ProductDetailActions, PageViewTracker } from "@mohasinac/appkit/client";
import { submitProductOffer } from "@/actions/offer.actions";
import { generateProductMetadata } from "@/constants/seo.server";
import { notFound, permanentRedirect } from "next/navigation";

export const revalidate = 3600;

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
    mainImage: product.mainImage || product.images?.[0]?.url,
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
  /*
   * D12 — the part composition for this listing's MODEL.
   *
   * 🛑 `categorySlugs[0]` is the LEAF. The chain is stored leaf-first
   * (measured: `categoryNames` reads `Basic Line > … > Spinning Tops`, i.e.
   * backwards for display), so index 0 is the most specific node and the only
   * one that can carry a composition. Reading an ancestor would hand every
   * Burst GT listing the parts of whichever model happened to join to the
   * line node.
   *
   * One indexed equality, and only when the product HAS a chain — so a
   * listing with no taxonomy costs nothing.
   */
  /*
   * 🛑 And only when a listing of this TYPE actually IS the assembly. An art
   * print and a sticker sheet file under the model's leaf deliberately
   * (section 4.4) and are not made of its parts — measured: the ONE live
   * product whose leaf has a composition is a poster, so without this gate
   * the only Parts tab in the catalogue would have been the wrong one.
   */
  const typeHasParts =
    LISTING_TYPE_HAS_COMPOSITION[
      (product?.listingType ?? "standard") as keyof typeof LISTING_TYPE_HAS_COMPOSITION
    ] === true;

  const compositions = typeHasParts && product?.categorySlugs?.[0]
    ? await safeRead(() => getCompositionsForCategory(product.categorySlugs![0]), {
        route: "/products/[slug]",
        key: "parts.compositionsForCategory",
        fallback: [],
      })
    : [];

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
  /*
   * COD availability, mirroring `createOrderForGroup`'s checkout-time rule
   * rather than restating half of it.
   *
   * 🛑 `payment.codEnabled` alone is NOT the whole switch. `codMaxOrderValue`
   * is a second, independent disable — its own schema comment says "`0`
   * disables COD outright at any value, which is a real configuration" — and
   * the badge ignored it, so a platform that had turned COD off that way still
   * advertised "Cash on Delivery" on every listing. Comparing the item's own
   * price against the cap falls out of the same expression: checkout rejects
   * when the CART total exceeds it (`>` not `>=`, a cart exactly at the cap is
   * allowed), so an item that is already over on its own can never be paid for
   * with COD in any cart that contains it. `0` then disables everything with
   * no special case, because no positive price is `<= 0`.
   */
  const codMaxOrderValue =
    typeof siteSettings?.payment?.codMaxOrderValue === "number"
      ? siteSettings.payment.codMaxOrderValue
      : COD_MAX_ORDER_VALUE_FALLBACK;
  const codEnabled =
    siteSettings?.payment?.codEnabled === true &&
    typeof product?.price === "number" &&
    product.price <= codMaxOrderValue;
  /*
   * Returns off site-wide must not render a "Returnable" badge.
   *
   * An ABSENT `windowDays` means "this settings document predates the field",
   * not "returns are off" — hiding the badge on that would be a silent
   * regression for every install that never set it. Only an explicit `0`
   * (or negative) disables.
   */
  const returnWindowDays = siteSettings?.returns?.windowDays;
  const returnsEnabled =
    typeof returnWindowDays === "number" ? returnWindowDays > 0 : true;
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
        images: productImageUrls(product.images),
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

  /*
   * D4b — the CATEGORY CHAIN, not a flat three crumbs.
   *
   * This emitted `Home > Products > {title}` and discarded the 4–5 level chain
   * already stored on the product, so the deepest taxonomy in the catalogue was
   * invisible to a crawler on the page where it matters most. worldhobbyshop's
   * 6-level `BreadcrumbList` is recorded as their single biggest SEO edge and
   * no Shopify competitor has one; we had the data and emitted three crumbs.
   *
   * `productCrumbs` reverses the stored leaf-first order (measured:
   * `categoryNames` is `Basic Line > … > Spinning Tops`, i.e. backwards for
   * display), pairs names to slugs only up to the shorter array so a row with a
   * missing name cannot be labelled with its neighbour's, and does NOT pad —
   * a LOT files at a non-leaf (G3a) so its chain is genuinely shorter, and
   * fabricating a leaf would claim it is one specific model.
   */
  const ldBreadcrumb = product
    ? breadcrumbJsonLd(
        withTrailHead(
          [
            ...productCrumbs({
              categorySlugs: product.categorySlugs,
              categoryNames: product.categoryNames,
              hrefFor: (s) => `/categories/${s}`,
            }),
            { name: product.title, url: `/products/${slug}` },
          ],
          [
            { name: "Home", url: "/" },
            { name: "Products", url: "/products" },
          ],
        ),
      )
    : null;

  return (
    <>
      <PageViewTracker entityType="product" entityId={slug} url={`/products/${slug}`} />
      {ldProduct && (
        /*
         * The paired `gatedPriceWebPageJsonLd` node was dropped on 2026-10-20
         * with `GUEST_PRICE_GATE_ENABLED` (appkit useCanSeePrices.ts). With the
         * price rendered for everyone, `isAccessibleForFree: false` over
         * `offers.price` is a false declaration — and an unnecessary one: the
         * marked-up amount is now exactly what the visitor sees, which is all
         * Google asked for. Restore both together or neither.
         */
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
        compositionContent={
          compositions.length > 0 ? (
            <ModelCompositionPanel
              compositions={compositions}
              hrefForPart={(slot, tail) => String(ROUTES.PUBLIC.PART_DETAIL(slot, tail))}
            />
          ) : undefined
        }
        codEnabled={codEnabled}
        returnsEnabled={returnsEnabled}
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
