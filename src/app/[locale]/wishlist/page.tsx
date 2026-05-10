"use client";
import { useState, useMemo } from "react";
import {
  useWishlistWithGuest,
  useSession,
  InteractiveProductCard,
  ROUTES,
  ListingLayout,
  Input,
  Select,
  Div,
  Heading,
  Text,
} from "@mohasinac/appkit/client";
import type { EnrichedWishlistItem } from "@mohasinac/appkit/client";

const SORT_OPTIONS = [
  { value: "-addedAt", label: "Newest first" },
  { value: "addedAt",  label: "Oldest first" },
  { value: "-price",   label: "Price: High → Low" },
  { value: "price",    label: "Price: Low → High" },
];

export default function WishlistPage() {
  const { user, loading: sessionLoading } = useSession();
  const wl = useWishlistWithGuest(sessionLoading ? undefined : user?.uid ?? null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-addedAt");

  const isLoading = sessionLoading || wl.isLoading;

  const filteredItems = useMemo(() => {
    let result = (wl.items as EnrichedWishlistItem[]).slice();

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => {
        const title = (item.product?.title ?? item.productTitle ?? "").toLowerCase();
        const slug  = (item.product?.slug  ?? item.productSlug  ?? "").toLowerCase();
        return title.includes(q) || slug.includes(q);
      });
    }

    result.sort((a, b) => {
      const desc  = sort.startsWith("-");
      const field = desc ? sort.slice(1) : sort;
      if (field === "price") {
        const ap = a.product?.price ?? a.productPrice ?? 0;
        const bp = b.product?.price ?? b.productPrice ?? 0;
        return desc ? bp - ap : ap - bp;
      }
      const at = new Date(a.addedAt ?? "").getTime();
      const bt = new Date(b.addedAt ?? "").getTime();
      return desc ? bt - at : at - bt;
    });

    return result;
  }, [wl.items, search, sort]);

  return (
    <ListingLayout
      headerSlot={
        <Div>
          <Heading level={1} className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            My Wishlist
          </Heading>
          {!isLoading && wl.total > 0 && (
            <Text variant="secondary" className="text-sm mt-0.5">
              {wl.total} saved item{wl.total !== 1 ? "s" : ""}
            </Text>
          )}
        </Div>
      }
      searchSlot={
        <Input
          placeholder="Search wishlist…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm"
        />
      }
      sortSlot={
        <Select
          options={SORT_OPTIONS}
          value={sort}
          onValueChange={setSort}
          className="h-9 text-sm min-w-[160px]"
        />
      }
    >
      {isLoading ? (
        <Div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Div
              key={i}
              className="animate-pulse rounded-xl border border-zinc-200 dark:border-slate-700 aspect-[3/4] bg-zinc-100 dark:bg-slate-800"
            />
          ))}
        </Div>
      ) : filteredItems.length === 0 ? (
        <Div className="py-24 text-center">
          <Text variant="secondary">
            {wl.items.length === 0
              ? "Your wishlist is empty."
              : "No items match your search."}
          </Text>
        </Div>
      ) : (
        <Div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredItems.map((item) => {
            const slug = item.product?.slug ?? item.productSlug ?? item.productId;
            return (
              <InteractiveProductCard
                key={item.id}
                href={String(ROUTES.PUBLIC.PRODUCT_DETAIL(slug))}
                isWishlisted
                product={{
                  id:        item.productId,
                  title:     item.product?.title     ?? item.productTitle ?? "",
                  price:     item.product?.price     ?? item.productPrice ?? 0,
                  currency:  item.product?.currency  ?? "INR",
                  mainImage: item.product?.images?.[0] ?? item.productImage,
                  status:    item.product?.status    ?? ("published" as const),
                  featured:  item.product?.isFeatured ?? false,
                  isAuction: item.product?.isAuction  ?? false,
                  slug,
                }}
              />
            );
          })}
        </Div>
      )}
    </ListingLayout>
  );
}
