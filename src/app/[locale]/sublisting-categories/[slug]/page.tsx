import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Heading, Main, MediaImage, Nav, ROUTES, Stack, Text, categoriesRepository, isAuctionListing, isPreOrderListing } from "@mohasinac/appkit";
import { Div } from "@mohasinac/appkit/client";
import { generateMetadata as _gm } from "@/constants";


const __O = {
  hidden: "overflow-hidden",
} as const;
function fmt(paise: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export const revalidate = 300;

// audit-semantic-color-ok: amber palette is the brand auction-pill colour, not semantic warning
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
      <Div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" padding="y-lg">

        {/* Breadcrumb */}
        <Nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
          <Link href={String(ROUTES.HOME)} className="hover:text-[var(--appkit-color-primary)] transition-colors">
            Home
          </Link>
          <Text as="span" aria-hidden>/</Text>
          <Text as="span" className="truncate max-w-[260px]" color="muted" weight="medium">
            {displayName}
          </Text>
        </Nav>

        {/* Category header */}
        <Div className="mb-8">
          {category.display?.coverImage && (
            <Div className={`mb-4 h-36 w-full ${__O.hidden} rounded-2xl relative`}>
              <MediaImage src={category.display.coverImage} alt={displayName} priority />
            </Div>
          )}

          <Stack className="sm:flex-row sm:items-start sm:justify-between" gap="xs">
            <>
              <Heading level={1} className="sm:text-3xl" color="primary" size="2xl" weight="bold">
                {displayName}
              </Heading>
              {category.description && (
                <Text className="mt-1.5 max-w-2xl leading-relaxed" color="muted" size="sm">
                  {category.description}
                </Text>
              )}
            </>
            <Text as="span" className="mt-2 inline-flex h-fit shrink-0 items-center rounded-full bg-[var(--appkit-color-primary)]/10 px-3 py-1 text-[var(--appkit-color-primary)] sm:mt-0" size="sm" weight="semibold">
              {listings.length} listing{listings.length !== 1 ? "s" : ""}
            </Text>
          </Stack>
        </Div>

        {/* Listings grid */}
        {listings.length === 0 ? (
          <Stack className="justify-center border-dashed py-20 text-center" align="center" rounded="2xl" border="default">
            <Text as="span" className="mb-3" size="4xl">📦</Text>
            <Text size="base" weight="semibold" color="muted">No listings yet</Text>
            <Text className="mt-1" color="faint" size="sm">
              Check back soon — sellers are still adding items.
            </Text>
            <Link
              href={String(ROUTES.PUBLIC.PRODUCTS)}
              className="mt-5 rounded-lg bg-[var(--appkit-color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Browse all products
            </Link>
          </Stack>
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
                  <Div className={`aspect-square w-full ${__O.hidden} bg-zinc-100 dark:bg-zinc-800 relative`}>
                    <MediaImage
                      src={image || undefined}
                      alt={title}
                      className="group-hover:scale-105 transition-transform"
                      loading="lazy"
                      fallback="📦"
                    />
                  </Div>
                  <Stack className="p-2.5" gap="xs">
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
                          <Text as="span" className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px]" color="muted" transform="capitalize">
                            {condition}
                          </Text>
                        )}
                      </Div>
                    )}
                    <Text className="line-clamp-2 leading-snug" color="primary" size="xs" weight="medium">
                      {title}
                    </Text>
                    <Text size="sm" weight="bold" color="primary">
                      {fmt(price, currency)}
                    </Text>
                  </Stack>
                </Link>
              );
            })}
          </Div>
        )}
      </Div>
    </Main>
  );
}
