"use client";
import { useState, useMemo, useEffect, useRef } from "react";
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
  Stack,
  Row,
  Button,
  useToast,
} from "@mohasinac/appkit/client";
import type { EnrichedWishlistItem } from "@mohasinac/appkit/client";

const SORT_OPTIONS = [
  { value: "-addedAt", label: "Newest first" },
  { value: "addedAt",  label: "Oldest first" },
  { value: "-price",   label: "Price: High → Low" },
  { value: "price",    label: "Price: Low → High" },
];

const TYPE_OPTIONS = [
  { value: "all",      label: "All types" },
  { value: "standard", label: "Standard" },
  { value: "auction",  label: "Auction" },
  { value: "preorder", label: "Pre-Order" },
];

interface WishlistFilters {
  type: string;
  minPrice: string;
  maxPrice: string;
}

const EMPTY_FILTERS: WishlistFilters = { type: "all", minPrice: "", maxPrice: "" };

function countActiveFilters(f: WishlistFilters): number {
  let n = 0;
  if (f.type !== "all") n++;
  if (f.minPrice) n++;
  if (f.maxPrice) n++;
  return n;
}

export default function WishlistPage() {
  const { user, loading: sessionLoading } = useSession();
  const { showToast } = useToast();
  const wl = useWishlistWithGuest(sessionLoading ? undefined : user?.uid ?? null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-addedAt");

  // Staged (pending) filter state — applied on "Apply filters" click
  const [pending, setPending] = useState<WishlistFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<WishlistFilters>(EMPTY_FILTERS);

  const isLoading = sessionLoading || wl.isLoading;

  // W2: Stale validation — run once after wishlist loads for auth users
  const validatedRef = useRef(false);
  useEffect(() => {
    if (!user?.uid || wl.isLoading) return;
    if (validatedRef.current) return;
    validatedRef.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/user/wishlist/validate", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { data: { removedCount: number } };
        const { removedCount } = data.data;
        if (removedCount > 0) {
          showToast(
            `${removedCount} wishlisted item${removedCount !== 1 ? "s" : ""} removed — product${removedCount !== 1 ? "s" : ""} no longer available.`,
            "info",
          );
          wl.refetch?.();
        }
      } catch {
        // Best-effort — don't surface errors
      }
    })();
  }, [user?.uid, wl.isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredItems = useMemo(() => {
    let result = (wl.items as EnrichedWishlistItem[]).slice();

    // Text search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => {
        const title = (item.product?.title ?? item.productTitle ?? "").toLowerCase();
        const slug  = (item.product?.slug  ?? item.productSlug  ?? "").toLowerCase();
        return title.includes(q) || slug.includes(q);
      });
    }

    // Type filter
    if (applied.type !== "all") {
      result = result.filter((item) => {
        if (applied.type === "auction")  return item.product?.isAuction  === true;
        if (applied.type === "preorder") return item.product?.isPreOrder === true;
        return item.product?.isAuction !== true && item.product?.isPreOrder !== true;
      });
    }

    // Price range
    const minP = applied.minPrice ? Number(applied.minPrice) * 100 : null;
    const maxP = applied.maxPrice ? Number(applied.maxPrice) * 100 : null;
    if (minP !== null || maxP !== null) {
      result = result.filter((item) => {
        const price = item.product?.price ?? item.productPrice ?? 0;
        if (minP !== null && price < minP) return false;
        if (maxP !== null && price > maxP) return false;
        return true;
      });
    }

    // Sort
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
  }, [wl.items, search, sort, applied]);

  const activeFilterCount = countActiveFilters(applied);
  const pendingFilterCount = countActiveFilters(pending);

  const handleApply = () => setApplied({ ...pending });
  const handleClear = () => {
    setPending(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

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
      filterContent={
        <Stack gap="md" className="p-4">
          {/* Type */}
          <Div>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Type
            </Text>
            <Stack gap="xs">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPending((p) => ({ ...p, type: opt.value }))}
                  className={[
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    pending.type === opt.value
                      ? "bg-primary-50 dark:bg-primary-900/20 font-medium text-primary-700 dark:text-primary-300"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </Stack>
          </Div>

          {/* Price range — values entered as ₹ (rupees), converted to paise internally */}
          <Div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Price range (₹)
            </Text>
            <Row gap="sm">
              <Input
                type="number"
                placeholder="Min"
                min={0}
                value={pending.minPrice}
                onChange={(e) => setPending((p) => ({ ...p, minPrice: e.target.value }))}
                className="h-8 text-sm"
              />
              <span className="flex items-center text-zinc-400">–</span>
              <Input
                type="number"
                placeholder="Max"
                min={0}
                value={pending.maxPrice}
                onChange={(e) => setPending((p) => ({ ...p, maxPrice: e.target.value }))}
                className="h-8 text-sm"
              />
            </Row>
          </Div>
        </Stack>
      }
      filterActiveCount={activeFilterCount}
      onFilterApply={handleApply}
      onFilterClear={handleClear}
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
              : "No items match your search or filters."}
          </Text>
          {(search || activeFilterCount > 0) && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => { setSearch(""); handleClear(); }}
            >
              Clear all
            </Button>
          )}
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
