import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Heading, ROUTES, Text, Main, Nav, MediaImage, categoriesRepository, isAuctionListing, isPreOrderListing } from "@mohasinac/appkit";
import { Div } from "@mohasinac/appkit/client";
import { generateMetadata as _gm } from "@/constants";

function fmt(paise: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export const revalidate = 300;

const CLS_AUCTION_PILL = "rounded-full bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300";
const CLS_PREORDER_PILL = "rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoriesRepository
    .findBySlugAndType(slug, "sublisting")
    .catch(() => null);
  if (!category) return _gm({ title: "Sub-listing Category", path: `/sublisting-categories/${slug}` });
  const name = category.name + (category.itemCode ? ` (${category.itemCode})` : "");
  return _gm({
    title: `${name} — All Listings on LetItRip`,
    description:
      category.description ??
      `Browse all ${category.metrics?.productCount ?? 0} listings for ${name} across conditions and sellers on LetItRip.`,
    path: `/sublisting-categories/${slug}`,
    keywords: [name, "collectibles", "buy", "india"],
  });
}

export default async function SublistingCategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await categoriesRepository
    .findBySlugAndType(slug, "sublisting")
    .catch(() => null);

  if (!category) notFound();

  const listings = await categoriesRepository
    .getSublistingListings(category.id, 40)
    .catch((): Record<string, unknown>[] => []);

  const displayName = category.name + (category.itemCode ? ` (${category.itemCode})` : "");

  return (
    <Main className="min-h-screen bg-zinc-50 dark:bg-slate-950">
      <Div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <Nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
          <Link href={String(ROUTES.HOME)} className="hover:text-[var(--appkit-color-primary)] transition-colors">
            Home
          </Link>
          <Text as="span" aria-hidden>/</Text>
          <Text as="span" className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[260px]">
            {displayName}
          </Text>
        </Nav>

        {/* Category header */}
        <Div className="mb-8">
          {category.display?.coverImage && (
            <Div className="mb-4 h-36 w-full overflow-hidden rounded-2xl relative">
              <MediaImage src={category.display.coverImage} alt={displayName} priority />
            </Div>
          )}

          <Div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <>
              <Heading level={1} className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {displayName}
              </Heading>
              {category.description && (
                <Text className="mt-1.5 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {category.description}
                </Text>
              )}
            </>
            <Text as="span" className="mt-2 inline-flex h-fit shrink-0 items-center rounded-full bg-[var(--appkit-color-primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--appkit-color-primary)] sm:mt-0">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}
            </Text>
          </Div>
        </Div>

        {/* Listings grid */}
        {listings.length === 0 ? (
          <Div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700 py-20 text-center">
            <Text as="span" className="text-4xl mb-3">📦</Text>
            <Text className="text-base font-semibold text-zinc-700 dark:text-zinc-300">No listings yet</Text>
            <Text className="mt-1 text-sm text-zinc-400 dark:text-zinc-400">
              Check back soon — sellers are still adding items.
            </Text>
            <Link
              href={String(ROUTES.PUBLIC.PRODUCTS)}
              className="mt-5 rounded-lg bg-[var(--appkit-color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Browse all products
            </Link>
          </Div>
        ) : (
          <Div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {listings.map((listing) => {
              const l = listing as Record<string, unknown>;
              const id = String(l.id ?? "");
              const listingSlug = typeof l.slug === "string" ? l.slug : id;
              const title = String(l.title ?? l.name ?? "Listing");
              const price = typeof l.price === "number" ? l.price : 0;
              const currency = typeof l.currency === "string" ? l.currency : "INR";
              const image = Array.isArray(l.images)
                ? (l.images as string[])[0]
                : typeof l.mainImage === "string"
                  ? l.mainImage
                  : null;
              // SB1-G Phase 4 — canonical predicates over listingType only.
              const lAsLT = l as {
                listingType?: "standard" | "auction" | "pre-order" | "prize-draw";
              };
              const isAuction = isAuctionListing(lAsLT);
              const isPreOrder = isPreOrderListing(lAsLT);
              const href = isAuction
                ? String(ROUTES.PUBLIC.AUCTION_DETAIL(listingSlug))
                : isPreOrder
                  ? String(ROUTES.PUBLIC.PRE_ORDER_DETAIL(listingSlug))
                  : String(ROUTES.PUBLIC.PRODUCT_DETAIL(listingSlug));
              const condition = typeof l.condition === "string" ? l.condition : null;

              return (
                <Link
                  key={id}
                  href={href}
                  className="group flex flex-col overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-[var(--appkit-color-primary)]/50 hover:shadow-md transition-all"
                >
                  <Div className="aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                    <MediaImage
                      src={image || undefined}
                      alt={title}
                      className="group-hover:scale-105 transition-transform"
                      loading="lazy"
                      fallback="📦"
                    />
                  </Div>
                  <Div className="flex flex-col gap-1 p-2.5">
                    {(isAuction || isPreOrder || condition) && (
                      <Div className="flex flex-wrap gap-1">
                        {isAuction && (
                          <Text as="span" className={CLS_AUCTION_PILL}>
                            Auction
                          </Text>
                        )}
                        {isPreOrder && (
                          <Text as="span" className={CLS_PREORDER_PILL}>
                            Pre-Order
                          </Text>
                        )}
                        {condition && (
                          <Text as="span" className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] capitalize text-zinc-600 dark:text-zinc-400">
                            {condition}
                          </Text>
                        )}
                      </Div>
                    )}
                    <Text className="line-clamp-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                      {title}
                    </Text>
                    <Text className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                      {fmt(price, currency)}
                    </Text>
                  </Div>
                </Link>
              );
            })}
          </Div>
        )}
      </Div>
    </Main>
  );
}
