"use client";
import { normalizeError, pluginFor } from "@mohasinac/appkit/client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  sortBy,
  useWishlistWithGuest,
  useSession,
  InteractiveProductCard,
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
  normalizeListingType,
  useAuthGate,
  ACTION_ID,
  ACTIONS,
  LoginRequiredModal,
  useBottomActions,
  Toggle,
  TextLink,
} from "@mohasinac/appkit/client";
import type { EnrichedWishlistItem } from "@mohasinac/appkit/client";
import { Span } from "@mohasinac/appkit/ui";
import { removeFromWishlistAction, addWishlistItemToCartAction } from "@/actions/wishlist.actions";
import { validateWishlist, syncWishlistItem } from "@/lib/api/user-client";
import { API_ROUTES } from "@/constants";

const __P = {
  p4: "p-[var(--appkit-space-4)]",
} as const;

const SORT_OPTIONS = [
  { value: sortBy("addedAt", "DESC"), label: "Newest first" },
  { value: "addedAt",  label: "Oldest first" },
  { value: sortBy("price", "DESC"),   label: "Price: High → Low" },
  { value: sortBy("price", "ASC"),    label: "Price: Low → High" },
];

const TYPE_OPTIONS = [
  { value: "all",      label: "All types" },
  { value: "standard", label: "Standard" },
  { value: "auction",  label: "Auction" },
  { value: "preorder", label: "Pre-Order" },
];

// "Standard" (and any other type) filter option buckets everything that
// isn't the two time-limited types with their own dedicated dropdown value.
const TIME_LIMITED_TYPES = new Set(["auction", "pre-order"]);

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

// Not folded into WishlistFilters/countActiveFilters — "hide sold out" is
// on by default (matching the "Show sold" precedent elsewhere in the
// codebase), so the unusual state is showing sold-out items, not hiding
// them; it shouldn't count toward the "N filters active" badge.

export function WishlistPageClient() {
  const { user, loading: sessionLoading } = useSession();
  const { showToast } = useToast();
  const { requireAuth, modalOpen, modalMessage, closeModal } = useAuthGate();
  const wl = useWishlistWithGuest(sessionLoading ? undefined : user?.uid ?? null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-addedAt");
  const [hideSoldOut, setHideSoldOut] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkRemoving, setIsBulkRemoving] = useState(false);
  const [isBulkAddingToCart, setIsBulkAddingToCart] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

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
      } catch (_err) {
        void normalizeError(_err);
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
    } catch (_err) {
      void normalizeError(_err);
      showToast("Could not remove items. Please try again.", "error");
    } finally {
      setIsBulkRemoving(false);
    }
  }, [selectedIds, isBulkRemoving, user?.uid, wl, showToast]);

  const handleAddSelectedToCart = useCallback(async () => {
    if (selectedIds.size === 0 || isBulkAddingToCart) return;
    const ids = Array.from(selectedIds);
    setIsBulkAddingToCart(true);
    const results = await Promise.allSettled(ids.map((id) => addWishlistItemToCartAction(id)));
    const added = results.filter((r) => r.status === "fulfilled").length;
    const failed = ids.length - added;
    clearSelection();
    if (added > 0) showToast(`${added} item${added !== 1 ? "s" : ""} added to cart.`, "success");
    if (failed > 0) showToast(`${failed} item${failed !== 1 ? "s" : ""} could not be added.`, "error");
    setIsBulkAddingToCart(false);
  }, [selectedIds, isBulkAddingToCart, showToast]);

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
    } catch (_err) {
      void normalizeError(_err);
      showToast("Could not clear wishlist. Please try again.", "error");
    } finally {
      setIsBulkRemoving(false);
    }
  }, [wl, isBulkRemoving, user?.uid, showToast]);

  const handleSyncAll = useCallback(async () => {
    if (!user?.uid || isSyncingAll) return;
    setIsSyncingAll(true);
    try {
      const res = await validateWishlist(API_ROUTES.USER.WISHLIST_VALIDATE, {});
      if (!res.ok) throw new Error("Sync failed");
      const data = (await res.json()) as { data: { removedCount: number; syncedCount: number } };
      const { removedCount, syncedCount } = data.data;
      const parts: string[] = [];
      if (syncedCount > 0) parts.push(`${syncedCount} item${syncedCount !== 1 ? "s" : ""} synced`);
      if (removedCount > 0) parts.push(`${removedCount} sold-out/unavailable item${removedCount !== 1 ? "s" : ""} removed`);
      showToast(parts.length > 0 ? parts.join(", ") + "." : "Wishlist already up to date.", "success");
      void wl.refetch?.();
    } catch (_err) {
      void normalizeError(_err);
      showToast("Could not sync wishlist. Please try again.", "error");
    } finally {
      setIsSyncingAll(false);
    }
  }, [user?.uid, isSyncingAll, wl, showToast]);

  const handleSyncItem = useCallback(async (productId: string) => {
    if (!user?.uid || syncingIds.has(productId)) return;
    setSyncingIds((prev) => new Set(prev).add(productId));
    try {
      const res = await syncWishlistItem(API_ROUTES.USER.WISHLIST_ITEM_SYNC(productId));
      if (!res.ok) throw new Error("Sync failed");
      const data = (await res.json()) as { data: { removed: boolean } };
      showToast(data.data.removed ? "Item removed — no longer available." : "Item synced.", "success");
      void wl.refetch?.();
    } catch (_err) {
      void normalizeError(_err);
      showToast("Could not sync this item. Please try again.", "error");
    } finally {
      setSyncingIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
    }
  }, [user?.uid, syncingIds, wl, showToast]);

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
        const res = await validateWishlist(API_ROUTES.USER.WISHLIST_VALIDATE, {});
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
        // audit-silent-degrade-ok: an opportunistic sweep for wishlist entries
        // whose product has since been delisted. It runs on mount, changes
        // nothing the user asked for, and the list renders correctly either
        // way — a failure here must not produce a toast on page load.
      } catch (_err) {
        void normalizeError(_err);
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

    // Hide sold-out items by default — wishlist is capped at WISHLIST_MAX
    // (20) and already fully fetched in-memory (PL6-A exception above), so
    // this is a plain client-side filter, no query param needed.
    if (hideSoldOut) {
      result = result.filter((item) => !item.product?.isSold);
    }

    // Type filter — SB1-G canonical predicates handle both listingType and legacy booleans.
    if (applied.type !== "all") {
      result = result.filter((item) => {
        const p = item.product;
        if (applied.type === "auction") return isAuctionListing(p);
        if (applied.type === "preorder") return isPreOrderListing(p);
        return !TIME_LIMITED_TYPES.has(normalizeListingType(p));
      });
    }

    // Price range
    const minP = applied.minPrice ? Number(applied.minPrice) : null;
    const maxP = applied.maxPrice ? Number(applied.maxPrice) : null;
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
  }, [wl.items, search, sort, applied, hideSoldOut]);

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
                id: ACTIONS.USER["wishlist-bulk-move-to-cart"].id,
                label: isBulkAddingToCart ? "Adding…" : ACTIONS.USER["wishlist-bulk-move-to-cart"].label,
                variant: "primary",
                disabled: isBulkAddingToCart || isBulkRemoving,
                onClick: handleAddSelectedToCart,
              },
              {
                id: ACTION_ID.REMOVE_FROM_WISHLIST,
                label: isBulkRemoving ? "Removing…" : `Remove ${selectedIds.size}`,
                variant: "danger",
                disabled: isBulkRemoving || isBulkAddingToCart,
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
      headerSlot={renderWishlistHeader({ isLoading, wl, selectedIds, isBulkRemoving, isBulkAddingToCart, handleRemoveSelected, handleAddSelectedToCart, clearSelection, handleRemoveAll, user, isSyncingAll, handleSyncAll })}
      searchSlot={<Input placeholder="Search wishlist…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 text-[length:var(--appkit-text-sm)]" />}
      sortSlot={<Select options={SORT_OPTIONS} value={sort} onValueChange={setSort} className="h-9 text-[length:var(--appkit-text-sm)]" wrapperClassName="min-w-[160px]" />}
      filterContent={renderWishlistFilterContent({ pending, setPending, hideSoldOut, setHideSoldOut })}
      filterActiveCount={activeFilterCount}
      onFilterApply={handleApply}
      onFilterClear={handleClear}
    >
      {renderWishlistItems({ isLoading, filteredItems, wl, search, activeFilterCount, user, selectedIds, handleToggleWishlist, toggleSelect, handleClear, setSearch, handleSyncItem, syncingIds })}
    </ListingLayout>
    {/* Mobile bulk actions registered via useBottomActions() bulk mode above */}
    <LoginRequiredModal isOpen={modalOpen} onClose={closeModal} message={modalMessage} />
    </>
  );
}

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function renderWishlistHeader({
  isLoading, wl, selectedIds, isBulkRemoving, isBulkAddingToCart, handleRemoveSelected, handleAddSelectedToCart, clearSelection, handleRemoveAll, user, isSyncingAll, handleSyncAll,
}: {
  isLoading: boolean;
  wl: ReturnType<typeof useWishlistWithGuest>;
  selectedIds: Set<string>;
  isBulkRemoving: boolean;
  isBulkAddingToCart: boolean;
  handleRemoveSelected: () => void;
  handleAddSelectedToCart: () => void;
  clearSelection: () => void;
  handleRemoveAll: () => void;
  user: ReturnType<typeof useSession>["user"];
  isSyncingAll: boolean;
  handleSyncAll: () => void;
}) {
  const busy = isBulkRemoving || isBulkAddingToCart;
  return (
    <Div>
      <Row gap="sm" wrap>
        <Heading level={1} size="2xl" weight="semibold" color="primary">
          My Wishlist
        </Heading>
        <Row gap="sm" className="ml-auto" wrap>
          {selectedIds.size > 0 && (
            <>
              <Text size="sm" color="muted">{selectedIds.size} selected</Text>
              <Button variant="primary" size="sm" onClick={handleAddSelectedToCart} disabled={busy}>
                {isBulkAddingToCart ? "Adding…" : "Add to cart"}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRemoveSelected} disabled={busy} className="text-error hover:opacity-80 hover:bg-error-surface">
                {isBulkRemoving ? "Removing…" : "Remove selected"}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearSelection} disabled={busy}>Deselect</Button>
            </>
          )}
          {!isLoading && wl.total > 0 && selectedIds.size === 0 && user?.uid && (
            <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={isSyncingAll}>
              {isSyncingAll ? "Syncing…" : "Sync all"}
            </Button>
          )}
          {!isLoading && wl.total > 0 && selectedIds.size === 0 && (
            <Button variant="ghost" size="sm" onClick={handleRemoveAll} disabled={busy} className="text-error hover:opacity-80 hover:bg-error-surface">
              {isBulkRemoving ? "Clearing…" : "Remove all"}
            </Button>
          )}
        </Row>
      </Row>
      {!isLoading && wl.total > 0 && selectedIds.size === 0 && (
        <Text variant="secondary" className="mt-0.5" size="sm">
          {wl.total} saved item{wl.total !== 1 ? "s" : ""}
        </Text>
      )}
    </Div>
  );
}

function renderWishlistFilterContent({
  pending, setPending, hideSoldOut, setHideSoldOut,
}: {
  pending: WishlistFilters;
  setPending: React.Dispatch<React.SetStateAction<WishlistFilters>>;
  hideSoldOut: boolean;
  setHideSoldOut: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Stack gap="md" className={`${__P.p4}`}>
      <Div>
        <Toggle
          size="md"
          label="Hide sold out"
          checked={hideSoldOut}
          onChange={setHideSoldOut}
        />
      </Div>
      <Div border="default" className="border-t" padding="t-md">
        <Text className="mb-2 tracking-wide" color="muted" size="xs" weight="semibold" transform="uppercase">Type</Text>
        <Stack gap="xs">
          {TYPE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              onClick={() => setPending((p) => ({ ...p, type: opt.value }))}
              variant={pending.type === opt.value ? "primary" : "ghost"}
              className="w-full justify-start text-[length:var(--appkit-text-sm)]"
            >
              {opt.label}
            </Button>
          ))}
        </Stack>
      </Div>
      <Div border="default" className="border-t" padding="t-md">
        <Text className="mb-2 tracking-wide" color="muted" size="xs" weight="semibold" transform="uppercase">Price range (₹)</Text>
        <Row gap="sm">
          <Input type="number" placeholder="Min" min={0} value={pending.minPrice} onChange={(e) => setPending((p) => ({ ...p, minPrice: e.target.value }))} className="h-8 text-[length:var(--appkit-text-sm)]" />
          <Span layout="flex" color="faint">–</Span>
          <Input type="number" placeholder="Max" min={0} value={pending.maxPrice} onChange={(e) => setPending((p) => ({ ...p, maxPrice: e.target.value }))} className="h-8 text-[length:var(--appkit-text-sm)]" />
        </Row>
      </Div>
    </Stack>
  );
}

function renderWishlistItems({
  isLoading, filteredItems, wl, search, activeFilterCount, user, selectedIds, handleToggleWishlist, toggleSelect, handleClear, setSearch, handleSyncItem, syncingIds,
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
  handleSyncItem: (productId: string) => Promise<void>;
  syncingIds: Set<string>;
}) {
  if (isLoading) {
    return (
      <Div gap="4" className="fluid-grid-card">
        {Array.from({ length: 8 }).map((_, i) => (
          <Div key={i} className="animate-pulse aspect-[3/4]" surface="subtle" rounded="xl" border="default" />
        ))}
      </Div>
    );
  }
  if (filteredItems.length === 0) {
    return (
      <Div padding="y-6xl" className="text-center">
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
    <Div gap="4" className="fluid-grid-card">
      {filteredItems.map((item) => {
        const slug = item.product?.slug ?? item.productSlug ?? item.productId;
        const href = pluginFor(item.product?.listingType ?? "standard").detailRoute(slug);
        const isSyncing = syncingIds.has(item.productId);
        return (
          <Stack key={item.id} gap="xs">
            <InteractiveProductCard
              href={href}
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
            <Row gap="xs">
              <TextLink href={href} variant="none" rounded="md" size="xs" weight="medium" className="flex-1 text-center border border-[var(--appkit-color-border)] px-[var(--appkit-space-2)] py-[var(--appkit-space-1)] hover:bg-[var(--appkit-color-surface-elevated)]">
                View
              </TextLink>
              {user?.uid && (
                <Button
                  action={ACTIONS.PRODUCT["sync-wishlist-item"]}
                  variant="outline"
                  size="sm"
                  textSize="xs"
                  className="flex-1"
                  isLoading={isSyncing}
                  onClick={() => handleSyncItem(item.productId)}
                >
                  Sync
                </Button>
              )}
              <Button
                action={ACTIONS.PRODUCT["remove-from-wishlist"]}
                variant="ghost"
                size="sm"
                textSize="xs"
                className="flex-1 text-error hover:bg-error-surface"
                onClick={user?.uid ? () => handleToggleWishlist(item.productId) : undefined}
              >
                Remove
              </Button>
            </Row>
          </Stack>
        );
      })}
    </Div>
  );
}
