"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
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
  isAuctionListing,
  isPreOrderListing,
  useAuthGate,
  ACTION_ID,
  LoginRequiredModal,
  useBottomActions,
} from "@mohasinac/appkit/client";
import type { EnrichedWishlistItem } from "@mohasinac/appkit/client";
import { Span } from "@mohasinac/appkit/ui";
import { removeFromWishlistAction } from "@/actions/wishlist.actions";
// audit-auth-gates-ok

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
  const { requireAuth, modalOpen, modalMessage, closeModal } = useAuthGate();
  const wl = useWishlistWithGuest(sessionLoading ? undefined : user?.uid ?? null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-addedAt");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkRemoving, setIsBulkRemoving] = useState(false);

  const toggleSelect = (id: string, next: boolean) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(id); else s.delete(id);
      return s;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const handleToggleWishlist = useCallback(async (productId: string) => {
    requireAuth(ACTION_ID.REMOVE_FROM_WISHLIST, async () => {
      try {
        await removeFromWishlistAction(productId);
        void wl.refetch?.();
      } catch {
        showToast("Could not remove from wishlist. Please try again.", "error");
      }
    });
  }, [requireAuth, wl, showToast]);

  const handleRemoveSelected = useCallback(async () => {
    if (selectedIds.size === 0 || isBulkRemoving) return;
    const ids = Array.from(selectedIds);
    setIsBulkRemoving(true);
    try {
      if (user?.uid) {
        await Promise.allSettled(ids.map((id) => removeFromWishlistAction(id)));
      } else {
        const guestWl = (wl as { guestWishlist?: { remove: (id: string, type: string) => void } }).guestWishlist;
        ids.forEach((id) => guestWl?.remove(id, "product"));
      }
      clearSelection();
      void wl.refetch?.();
      showToast(`${ids.length} item${ids.length !== 1 ? "s" : ""} removed.`, "info");
    } catch {
      showToast("Could not remove items. Please try again.", "error");
    } finally {
      setIsBulkRemoving(false);
    }
  }, [selectedIds, isBulkRemoving, user?.uid, wl, showToast]);

  const handleRemoveAll = useCallback(async () => {
    if (wl.items.length === 0 || isBulkRemoving) return;
    const count = wl.items.length;
    setIsBulkRemoving(true);
    try {
      if (user?.uid) {
        await Promise.allSettled(wl.items.map((item) => removeFromWishlistAction(item.productId)));
      } else {
        const guestWl = (wl as { guestWishlist?: { clear: () => void } }).guestWishlist;
        guestWl?.clear();
      }
      clearSelection();
      void wl.refetch?.();
      showToast(`Wishlist cleared (${count} item${count !== 1 ? "s" : ""}).`, "info");
    } catch {
      showToast("Could not clear wishlist. Please try again.", "error");
    } finally {
      setIsBulkRemoving(false);
    }
  }, [wl, isBulkRemoving, user?.uid, showToast]);

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

  // In-memory filter is acceptable here: wishlist is a single-doc array capped at
  // WISHLIST_MAX (20) items. Firestore arrays cannot be range-filtered server-side, and
  // 20 items is trivially fast in memory. No pagination or ?type= param needed. (PL6-A exception.)
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

    // Type filter — SB1-G canonical predicates handle both listingType and legacy booleans.
    if (applied.type !== "all") {
      result = result.filter((item) => {
        const p = item.product;
        if (applied.type === "auction") return isAuctionListing(p);
        if (applied.type === "preorder") return isPreOrderListing(p);
        return !isAuctionListing(p) && !isPreOrderListing(p);
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

  const handleApply = () => setApplied({ ...pending });
  const handleClear = () => {
    setPending(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

  useBottomActions(
    selectedIds.size > 0
      ? {
          bulk: {
            selectedCount: selectedIds.size,
            onClearSelection: clearSelection,
            actions: [
              {
                id: ACTION_ID.REMOVE_FROM_WISHLIST,
                label: isBulkRemoving ? "Removing…" : `Remove ${selectedIds.size}`,
                variant: "danger",
                disabled: isBulkRemoving,
                onClick: handleRemoveSelected,
              },
            ],
          },
        }
      : {},
  );

  return (
    <>
    <ListingLayout
      headerSlot={renderWishlistHeader({ isLoading, wl, selectedIds, isBulkRemoving, handleRemoveSelected, clearSelection, handleRemoveAll })}
      searchSlot={<Input placeholder="Search wishlist…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 text-sm" />}
      sortSlot={<Select options={SORT_OPTIONS} value={sort} onValueChange={setSort} className="h-9 text-sm min-w-[160px]" />}
      filterContent={renderWishlistFilterContent({ pending, setPending })}
      filterActiveCount={activeFilterCount}
      onFilterApply={handleApply}
      onFilterClear={handleClear}
    >
      {renderWishlistItems({ isLoading, filteredItems, wl, search, activeFilterCount, user, selectedIds, handleToggleWishlist, toggleSelect, handleClear, setSearch })}
    </ListingLayout>
    {/* Mobile bulk actions registered via useBottomActions() bulk mode above */}
    <LoginRequiredModal isOpen={modalOpen} onClose={closeModal} message={modalMessage} />
    </>
  );
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function renderWishlistHeader({
  isLoading, wl, selectedIds, isBulkRemoving, handleRemoveSelected, clearSelection, handleRemoveAll,
}: {
  isLoading: boolean;
  wl: ReturnType<typeof useWishlistWithGuest>;
  selectedIds: Set<string>;
  isBulkRemoving: boolean;
  handleRemoveSelected: () => void;
  clearSelection: () => void;
  handleRemoveAll: () => void;
}) {
  return (
    <Div>
      <Row gap="sm" className="flex-wrap">
        <Heading level={1} className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          My Wishlist
        </Heading>
        <Row gap="sm" className="ml-auto flex-wrap">
          {selectedIds.size > 0 && (
            <>
              <Text className="text-sm text-zinc-600 dark:text-zinc-300">{selectedIds.size} selected</Text>
              <Button variant="ghost" size="sm" onClick={handleRemoveSelected} disabled={isBulkRemoving} className="text-error hover:opacity-80 hover:bg-error-surface">
                {isBulkRemoving ? "Removing…" : "Remove selected"}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection} disabled={isBulkRemoving}>Deselect</Button>
            </>
          )}
          {!isLoading && wl.total > 0 && selectedIds.size === 0 && (
            <Button variant="ghost" size="sm" onClick={handleRemoveAll} disabled={isBulkRemoving} className="text-error hover:opacity-80 hover:bg-error-surface">
              {isBulkRemoving ? "Clearing…" : "Remove all"}
            </Button>
          )}
        </Row>
      </Row>
      {!isLoading && wl.total > 0 && selectedIds.size === 0 && (
        <Text variant="secondary" className="text-sm mt-0.5">
          {wl.total} saved item{wl.total !== 1 ? "s" : ""}
        </Text>
      )}
    </Div>
  );
}

function renderWishlistFilterContent({
  pending, setPending,
}: {
  pending: WishlistFilters;
  setPending: React.Dispatch<React.SetStateAction<WishlistFilters>>;
}) {
  return (
    <Stack gap="md" className="p-4">
      <Div>
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Type</Text>
        <Stack gap="xs">
          {TYPE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              onClick={() => setPending((p) => ({ ...p, type: opt.value }))}
              variant={pending.type === opt.value ? "primary" : "ghost"}
              className="w-full justify-start text-sm"
            >
              {opt.label}
            </Button>
          ))}
        </Stack>
      </Div>
      <Div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Price range (₹)</Text>
        <Row gap="sm">
          <Input type="number" placeholder="Min" min={0} value={pending.minPrice} onChange={(e) => setPending((p) => ({ ...p, minPrice: e.target.value }))} className="h-8 text-sm" />
          <Span className="flex items-center text-zinc-400">–</Span>
          <Input type="number" placeholder="Max" min={0} value={pending.maxPrice} onChange={(e) => setPending((p) => ({ ...p, maxPrice: e.target.value }))} className="h-8 text-sm" />
        </Row>
      </Div>
    </Stack>
  );
}

function renderWishlistItems({
  isLoading, filteredItems, wl, search, activeFilterCount, user, selectedIds, handleToggleWishlist, toggleSelect, handleClear, setSearch,
}: {
  isLoading: boolean;
  filteredItems: EnrichedWishlistItem[];
  wl: ReturnType<typeof useWishlistWithGuest>;
  search: string;
  activeFilterCount: number;
  user: ReturnType<typeof useSession>["user"];
  selectedIds: Set<string>;
  handleToggleWishlist: (id: string) => Promise<void>;
  toggleSelect: (id: string, next: boolean) => void;
  handleClear: () => void;
  setSearch: (v: string) => void;
}) {
  if (isLoading) {
    return (
      <Div className="fluid-grid-card gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Div key={i} className="animate-pulse rounded-xl border border-zinc-200 dark:border-slate-700 aspect-[3/4] bg-zinc-100 dark:bg-slate-800" />
        ))}
      </Div>
    );
  }
  if (filteredItems.length === 0) {
    return (
      <Div className="py-24 text-center">
        <Text variant="secondary">
          {wl.items.length === 0 ? "Your wishlist is empty." : "No items match your search or filters."}
        </Text>
        {(search || activeFilterCount > 0) && (
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearch(""); handleClear(); }}>Clear all</Button>
        )}
      </Div>
    );
  }
  return (
    <Div className="fluid-grid-card gap-4">
      {filteredItems.map((item) => {
        const slug = item.product?.slug ?? item.productSlug ?? item.productId;
        return (
          <InteractiveProductCard
            key={item.id}
            href={String(ROUTES.PUBLIC.PRODUCT_DETAIL(slug))}
            isWishlisted
            onToggleWishlist={user?.uid ? handleToggleWishlist : undefined}
            // Always pass onSelect so the hover-fade checkbox is reachable;
            // selectable flips to "always visible" once the user picks anything.
            selectable={selectedIds.size > 0}
            isSelected={selectedIds.has(item.productId)}
            onSelect={toggleSelect}
            product={{
              id: item.productId,
              title: item.product?.title ?? item.productTitle ?? "",
              price: item.product?.price ?? item.productPrice ?? 0,
              currency: item.product?.currency ?? "INR",
              mainImage: item.product?.images?.[0] ?? item.productImage,
              status: item.product?.status ?? ("published" as const),
              featured: item.product?.isFeatured ?? false,
              listingType: item.product?.listingType,
              slug,
            }}
          />
        );
      })}
    </Div>
  );
}
