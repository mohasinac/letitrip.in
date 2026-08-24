"use client";

import { API_ROUTES } from "@/constants/api";
import { deleteCartItem, updateCartItemQty, validateCart, persistCartSelection, persistCartAddons, addToWishlist } from "@/lib/api/cart-client";
import { usePricingPreview } from "@/lib/hooks/usePricingPreview";

const CLS_CHECKOUT_BTN = "w-full";

async function addToWishlistAndRemoveFromCart(item: CartItem, failedIds: string[]) {
  const res = await addToWishlist(item.productId);
  if (!res.ok) { failedIds.push(item.productId); return; }
  await deleteCartItem(item.id);
}

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import type { JsonValue, JsonArray } from "@mohasinac/appkit/client";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Alert, Button, CartItemRow, CartSummary, CartView, Checkbox, Div, Heading, Input, Text, useAuth, useCartQuery, useGuestCart, useGuestCartMerge, useGuestWishlist, useToast, ROUTES, useAuthGate, ACTION_ID, ACTIONS, LoginRequiredModal, useBottomActions, pluginFor, detectListingTypeFromSlug, getCartOps, CART_OPS_CHANGE_EVENT } from "@mohasinac/appkit/client";
import type { CartItem, CartOp, ListingType } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

import { Row, Stack, normalizeError, CouponHelpDetails } from "@mohasinac/appkit/client";
import {
  CART_LANE,
  CART_LANE_LABELS,
  CartPriceBreakdown,
  CountdownDisplay,
  StoreAddonsPicker,
  activeLane,
  laneBlockReason,
  laneOf,
  type CartLane,
  type StoreAddonsValue,
  type BuyerFacingFees,
} from "@mohasinac/appkit/client";
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServerCartItem {
  itemId?: string;
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  currency: string;
  quantity: number;
  /** Canonical store identifier (= store.id = store slug). Cart groups are keyed by storeId. */
  storeId?: string;
  /** Display name for the store header — purely UI. */
  storeName?: string;
  /** Canonical listing-kind snapshot from CartItemDocument (SB1-G Phase 4). */
  listingType?: ListingType;
  /** When true the item cannot be removed or have its quantity changed (won auction / accepted offer). */
  locked?: boolean;
  /** True when item was added from an accepted Make-an-Offer. */
  isOffer?: boolean;
  offerId?: string;
  /** True when the line was written by auction settlement for the winner. */
  isAuctionWin?: boolean;
  auctionId?: string;
  bidId?: string;
  /** Locked offer / winning-bid price — overrides the listing price at checkout. */
  lockedPrice?: number;
  /** When the claim on that locked price lapses. */
  checkoutDeadline?: string;
}

/** Local helper — derives the per-item `listingType` snapshot used by cart UI rendering. */
type CartItemWithListingType = CartItem & {
  itemId?: string;
  listingType?: ListingType;
  locked?: boolean;
  isOffer?: boolean;
  offerId?: string;
  isAuctionWin?: boolean;
  auctionId?: string;
  bidId?: string;
  lockedPrice?: number;
  checkoutDeadline?: string;
};


interface SellerGroup {
  sellerId: string;
  sellerName: string;
  sellerSlug?: string;
  items: CartItemWithListingType[];
}

interface ServerCartResponse {
  cart: {
    items: ServerCartItem[];
    appliedCoupons?: JsonArray;
    selectedItemIds?: string[] | null;
    /** Per-store paid add-on selections — the source of truth for what's charged. */
    storeAddons?: Record<string, StoreAddonsValue>;
  };
  subtotal: number;
  itemCount: number;
}

interface ValidateResponse {
  data: { stale: string[]; moveable: string[] };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CART_TABS = [
  { key: "cart"     as const, label: "Cart" },
  { key: "auctions" as const, label: "Won Auctions" },
  { key: "offers"   as const, label: "Accepted Offers" },
];

type CartTab = typeof CART_TABS[number]["key"];

const LISTING_TYPE_SEARCH_KEYWORDS: Record<string, string[]> = {
  auction:      ["auction"],
  "pre-order":  ["pre-order", "preorder", "pre order"],
  standard:     ["standard", "product"],
  "prize-draw": ["raffle", "prize-draw", "prize draw", "prize"],
};

const EMPTY_STATE_CLASS = "py-[var(--appkit-space-6)] text-center text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text-muted)]";
const ERROR_TEXT_CLASS = "text-[var(--appkit-color-error)]";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive the product detail URL from the canonical listingType (with slug-prefix fallback). */
function getProductHref(productId: string, listingType?: ListingType): string {
  return pluginFor(listingType ?? detectListingTypeFromSlug(productId)).detailRoute(productId);
}

/**
 * Server-side addItemToCart/mergeGuestCart now always resolve a real
 * storeName from the store document (appkit cart-actions.ts), so this path
 * should rarely fire — kept as defense-in-depth for cart items added before
 * that fix. Humanizes the slug (`store-pokemon-palace` -> `Pokemon Palace`)
 * instead of showing the raw, uppercased-by-CSS slug to the buyer.
 */
function humanizeStoreSlug(slug: string): string {
  return slug
    .replace(/^store-/, "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Cart groups are keyed by storeId (canonical store identifier = store slug);
// sellerName on SellerGroup is display-only.
function groupBySeller(items: CartItemWithListingType[]): SellerGroup[] {
  const map = new Map<string, SellerGroup>();
  for (const item of items) {
    const meta = item.meta as unknown as Record<string, JsonValue>;
    const sid = (meta.storeId as string | undefined) ?? "unknown";
    const sname =
      (item.meta.attributes?.storeName as string | undefined) ||
      (sid !== "unknown" ? humanizeStoreSlug(sid) : sid);
    // storeId IS the store slug (memory: project_store_identity) — link target.
    const sslug = sid !== "unknown" ? sid : undefined;
    if (!map.has(sid)) {
      map.set(sid, { sellerId: sid, sellerName: sname, sellerSlug: sslug, items: [] });
    }
    map.get(sid)!.items.push(item);
  }
  return Array.from(map.values());
}

function serverItemsToCartItems(
  items: ServerCartItem[],
): CartItemWithListingType[] {
  return items.map((item) => ({
    id: item.itemId ?? item.productId,
    itemId: item.itemId,
    productId: item.productId,
    quantity: item.quantity,
    listingType: item.listingType,
    locked: item.locked,
    isOffer: item.isOffer,
    offerId: item.offerId,
    // Without these the lane derivation can't see a won auction, and the whole
    // gate silently degrades to "everything is the standard lane".
    isAuctionWin: item.isAuctionWin,
    auctionId: item.auctionId,
    bidId: item.bidId,
    lockedPrice: item.lockedPrice,
    checkoutDeadline: item.checkoutDeadline,
    meta: {
      productId: item.productId,
      title: item.productTitle,
      image: item.productImage,
      price: item.lockedPrice ?? item.price,
      currency: item.currency ?? "INR",
      storeId: item.storeId,
      attributes: {
        storeName: item.storeName ?? "",
      },
    },
  }));
}

/**
 * Layers the local-first pending op queue on top of the server cart items —
 * mirrors useCartCount's `pendingDelta` (which does the same thing for the
 * badge NUMBER, not the item list). Root-caused 2026-08-20: the badge/toast
 * looked right the instant "Add to Cart" was clicked on any listing-grid
 * card (a local-only write, queued for later sync), but the Cart page
 * rendered `serverCart.cart.items` directly with no such layering, so a
 * still-unsynced item was invisible here even after the sync-flush gap
 * itself was fixed — this keeps the page correct even if a sync cycle
 * hasn't run yet (e.g. immediately after add, before the periodic/on-hide
 * flush fires).
 */
function mergePendingCartOps(
  serverItems: CartItemWithListingType[],
  ops: CartOp[],
): CartItemWithListingType[] {
  if (ops.length === 0) return serverItems;
  const removedIds = new Set(ops.filter((o) => o.op === "remove").map((o) => o.productId));
  const merged = serverItems.filter((item) => !removedIds.has(item.productId));
  const existingIds = new Set(merged.map((item) => item.productId));
  for (const op of ops) {
    if (op.op !== "add" || existingIds.has(op.productId)) continue;
    existingIds.add(op.productId);
    merged.push({
      id: op.productId,
      productId: op.productId,
      quantity: op.quantity ?? 1,
      listingType: detectListingTypeFromSlug(op.productId),
      meta: {
        productId: op.productId,
        title: op.productTitle ?? op.productId,
        image: op.productImage,
        price: op.price ?? 0,
        currency: "INR",
        storeId: op.storeId,
        attributes: { storeName: op.storeName ?? "" },
      },
    });
  }
  return merged;
}

function guestItemsToCartItems(
  items: ReturnType<typeof useGuestCart>["items"],
): CartItemWithListingType[] {
  return items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    // Guest carts don't carry a listingType snapshot — derive from slug prefix.
    listingType: detectListingTypeFromSlug(item.productId),
    meta: {
      productId: item.productId,
      title: item.productTitle ?? item.productId,
      image: item.productImage,
      price: item.price ?? 0,
      currency: "INR",
    },
  }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface CartRouteClientProps {
  /**
   * The buyer-facing subset of `siteSettings.commissions` — gates and prices
   * the per-store add-on checkboxes. Read on the server so the controls are
   * correct on first paint, and PROJECTED there via `toBuyerFacingFees`:
   * `StoreAddonsRates` alone can't keep the internal rates out, because a
   * wider object satisfies it structurally and still gets serialised whole.
   */
  commissions?: BuyerFacingFees | null;
}

export function CartRouteClient({ commissions = null }: CartRouteClientProps = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { requireAuth, modalOpen, modalMessage, closeModal } = useAuthGate();

  const guest = useGuestCart();
  const { data: serverCart, isLoading: serverLoading, isError: serverCartError, refetch } =
    useCartQuery<ServerCartResponse>({
      endpoint: API_ROUTES.CART.GET,
      queryKey: ["cart"],
      enabled: !!user?.uid,
    });

  useGuestCartMerge({
    userId: user?.uid,
    onNavigate: (url) => router.push(url),
  });

  // Re-render whenever the pending-ops queue changes (e.g. useSyncManager
  // just flushed and cleared it) so a merged-in item disappears once the
  // server cart actually contains it, instead of staying merged forever.
  const [, forcePendingOpsRerender] = useState(0);
  useEffect(() => {
    const onChange = () => forcePendingOpsRerender((n) => n + 1);
    window.addEventListener(CART_OPS_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CART_OPS_CHANGE_EVENT, onChange);
  }, []);

  const isAuthenticated = !!user?.uid;
  const cartItems = isAuthenticated
    ? mergePendingCartOps(serverItemsToCartItems(serverCart?.cart?.items ?? []), getCartOps())
    : guestItemsToCartItems(guest.items);

  // ---------------------------------------------------------------------------
  // Optimistic UI — qty overrides + pending remove with undo
  // ---------------------------------------------------------------------------
  const [optimisticQty, setOptimisticQty] = useState<Map<string, number>>(new Map());
  const [pendingRemoveIds, setPendingRemoveIds] = useState<Set<string>>(new Set());
  const undoTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Apply optimistic qty override when rendering
  const effectiveItems = useMemo(
    () => cartItems
      .filter((i) => !pendingRemoveIds.has(i.id))
      .map((i) => optimisticQty.has(i.id) ? { ...i, quantity: optimisticQty.get(i.id)! } : i),
    [cartItems, optimisticQty, pendingRemoveIds],
  );

  // The cart-wide subtotal (`serverCart.subtotal`) is deliberately not read
  // here: it spans all three lanes, and no surface on this page may show a
  // figure the buyer cannot pay in one checkout. Totals come from `laneSubtotal`
  // / `laneSelectedSubtotal` below instead.

  // ---------------------------------------------------------------------------
  // W1: Stale + unavailability validation — run once on cart load
  // ---------------------------------------------------------------------------
  const validatedRef = useRef(false);
  const guestWishlist = useGuestWishlist();
  /**
   * productIds that are temporarily unavailable (sold/OOS/no-stock) but NOT
   * deleted. These items are moved to wishlist on validation; if the move fails
   * they stay here so the per-item "Move to wishlist" button still shows.
   */
  const [moveableIds, setMoveableIds] = useState<Set<string>>(new Set());

  const runCartValidation = useCallback(async () => {
    const productIds = cartItems.map((i) => i.productId);
    try {
      const res = await validateCart(productIds);
      if (!res.ok) return;
      const data = (await res.json()) as ValidateResponse;
      const { stale, moveable } = data.data;

      // --- Remove truly unpublished items ---
      if (stale.length > 0) {
        if (isAuthenticated) {
          const staleSet = new Set(stale);
          const staleItems = cartItems.filter((i) => staleSet.has(i.productId));
          await Promise.allSettled(staleItems.map((item) => deleteCartItem(item.id)));
          refetch?.();
        } else {
          for (const productId of stale) guest.remove(productId);
        }
        showToast(
          `${stale.length} item${stale.length !== 1 ? "s" : ""} removed — no longer available.`,
          "info",
        );
      }

      // --- Move unavailable items (sold/OOS/no-stock) from cart to wishlist ---
      if (moveable.length > 0) {
        const moveSet = new Set(moveable);
        const moveItems = cartItems.filter((i) => moveSet.has(i.productId));
        const failedIds: string[] = [];
        const moveGuestItem = (item: CartItem) => {
          guestWishlist.add(item.productId, "product", { title: item.meta.title, image: item.meta.image });
          guest.remove(item.productId);
        };

        if (isAuthenticated) {
          await Promise.allSettled(moveItems.map((item) => addToWishlistAndRemoveFromCart(item, failedIds)));
          if (moveItems.length - failedIds.length > 0) refetch?.();
        } else {
          moveItems.forEach(moveGuestItem);
        }

        if (failedIds.length > 0) setMoveableIds(new Set(failedIds));

        const movedCount = moveItems.length - failedIds.length;
        if (movedCount > 0) {
          showToast(
            `${movedCount} unavailable item${movedCount !== 1 ? "s" : ""} saved to your wishlist.`,
            "info",
          );
        }
      }
    } catch (_err) {
      void normalizeError(_err);
      // Validation is best-effort; don't surface errors
    }
   
  }, [isAuthenticated, cartItems, refetch, guest, guestWishlist, showToast]);

  useEffect(() => {
    if (loading || (isAuthenticated && serverLoading)) return;
    if (cartItems.length === 0) return;
    if (validatedRef.current) return;
    validatedRef.current = true;
    void runCartValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, serverLoading, isAuthenticated]);

  // Reset validation flag when cart changes (user logs in/out)
  useEffect(() => {
    validatedRef.current = false;
  }, [user?.uid]);

  // ---------------------------------------------------------------------------
  // W3: Split items into in-stock and unavailable (moveable)
  // effectiveItems already excludes pending-remove items + applies optimistic qty
  // ---------------------------------------------------------------------------
  const [inStockItems, oosItems] = useMemo(() => {
    const inStock: typeof effectiveItems = [];
    const oos: typeof effectiveItems = [];
    for (const item of effectiveItems) {
      if (moveableIds.has(item.productId)) oos.push(item);
      else inStock.push(item);
    }
    return [inStock, oos];
  }, [effectiveItems, moveableIds]);

  const isEmpty = effectiveItems.length === 0;
  const hasOnlyOos = inStockItems.length === 0 && oosItems.length > 0;
  const isLoading = loading || (isAuthenticated && serverLoading);

  // Coupons are applied at checkout — ?coupon= deep-links redirect there
  const searchParams = useSearchParams();
  useEffect(() => {
    const incoming = searchParams.get("coupon");
    if (!incoming) return;
    router.replace(`${String(ROUTES.USER.CHECKOUT)}?coupon=${encodeURIComponent(incoming)}`);
  }, [searchParams, router]);

  // ---------------------------------------------------------------------------
  // Item selection for partial checkout
  // ---------------------------------------------------------------------------
  const serverSelectedSet = useMemo(
    () => new Set<string>(serverCart?.cart?.selectedItemIds ?? []),
    [serverCart],
  );
  const allItemIds = useMemo(() => inStockItems.map((i) => i.itemId ?? i.id), [inStockItems]);
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  const effectiveSelected =
    selectedIds ??
    (serverSelectedSet.size > 0 && serverSelectedSet.size < allItemIds.length
      ? serverSelectedSet
      : null);
  // NOTE: there is deliberately no cart-wide `selectedCount` / `isAllSelected` /
  // `selectedSubtotal` here any more. Every one of those was a cross-lane
  // figure, and each place that consumed one was showing the buyer a number
  // spanning lanes they cannot pay for together. The lane-scoped replacements
  // are derived further down, once `laneBucket` exists.
  const toggleItem = useCallback(
    async (itemId: string) => {
      const current = effectiveSelected ? new Set(effectiveSelected) : new Set(allItemIds);
      if (current.has(itemId)) current.delete(itemId);
      else current.add(itemId);
      const next = current.size >= allItemIds.length ? null : current;
      setSelectedIds(next);
      if (isAuthenticated) {
        await persistCartSelection(next ? Array.from(next) : null);
      }
    },
    [effectiveSelected, allItemIds, isAuthenticated],
  );

  // ---------------------------------------------------------------------------
  // Bulk remove actions
  // ---------------------------------------------------------------------------
  const [isRemoving, setIsRemoving] = useState(false);

  /**
   * Bulk removal is standard-lane only. A won auction and an accepted offer are
   * commitments, not cart lines the buyer may clear — the lane model defines
   * them as non-removable, so neither handler may touch them regardless of
   * which tab is open or what happens to be selected.
   */
  const removableItems = useMemo(
    () => inStockItems.filter((i) => laneOf(i) === CART_LANE.STANDARD),
    [inStockItems],
  );

  const handleRemoveSelectedItems = useCallback(async () => {
    if (!effectiveSelected || effectiveSelected.size === 0 || isRemoving) return;
    const toRemove = removableItems.filter((i) => effectiveSelected.has(i.itemId ?? i.id));
    if (toRemove.length === 0) return;
    setIsRemoving(true);
    try {
      if (isAuthenticated) {
        await Promise.allSettled(toRemove.map((item) => deleteCartItem(item.itemId ?? item.id)));
        refetch?.();
      } else {
        toRemove.forEach((item) => guest.remove(item.productId));
      }
      setSelectedIds(null);
      showToast(`${toRemove.length} item${toRemove.length !== 1 ? "s" : ""} removed.`, "info");
    } catch (_err) {
      void normalizeError(_err);
      showToast("Could not remove items. Please try again.", "error");
    } finally {
      setIsRemoving(false);
    }
  }, [effectiveSelected, removableItems, isAuthenticated, isRemoving, guest, showToast, refetch]);

  const handleRemoveAll = useCallback(async () => {
    const toRemove = [...removableItems, ...oosItems];
    if (toRemove.length === 0 || isRemoving) return;
    const count = toRemove.length;
    setIsRemoving(true);
    try {
      if (isAuthenticated) {
        await Promise.allSettled(toRemove.map((item) => deleteCartItem(item.itemId ?? item.id)));
        refetch?.();
      } else {
        toRemove.forEach((item) => guest.remove(item.productId));
      }
      setSelectedIds(null);
      showToast(`Cart cleared (${count} item${count !== 1 ? "s" : ""}).`, "info");
    } catch (_err) {
      void normalizeError(_err);
      showToast("Could not clear cart. Please try again.", "error");
    } finally {
      setIsRemoving(false);
    }
  }, [removableItems, oosItems, isAuthenticated, isRemoving, guest, showToast, refetch]);

  // ---------------------------------------------------------------------------
  // Move-to-wishlist — per item and called from auto-move on validation
  // ---------------------------------------------------------------------------
  const handleMoveToWishlist = useCallback(
    async (cartItemId: string, productId: string) => {
      if (!isAuthenticated) {
        const item = cartItems.find((i) => i.productId === productId);
        guestWishlist.add(productId, "product", {
          title: item?.meta.title,
          image: item?.meta.image,
        });
        guest.remove(productId);
        setMoveableIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
        showToast("Item saved to wishlist.", "info");
        return;
      }
      try {
        const wishlistRes = await addToWishlist(productId);
        if (!wishlistRes.ok) {
          const errData = (await wishlistRes.json().catch(() => ({}))) as { code?: string };
          if (errData.code === "WISHLIST_FULL") {
            showToast("Wishlist is full — remove an item to save this here.", "error");
          } else {
            showToast("Could not save to wishlist. Please try again.", "error");
          }
          return;
        }
        await deleteCartItem(cartItemId);
        setMoveableIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
        refetch?.();
        showToast("Item saved to wishlist.", "info");
      } catch (_err) {
        void normalizeError(_err);
        showToast("Could not save to wishlist. Please try again.", "error");
      }
    },
    [isAuthenticated, cartItems, guestWishlist, guest, showToast, refetch],
  );

  // ---------------------------------------------------------------------------
  // Item actions — W1 R1: proper toast on all mutations
  // ---------------------------------------------------------------------------
  const handleQtyChange = useCallback(
    async (id: string, qty: number) => {
      if (!isAuthenticated) {
        if (qty <= 0) guest.remove(id);
        else guest.updateQuantity(id, qty);
        return;
      }
      if (qty <= 0) return; // guard; remove handled by handleRemove
      // Optimistic: apply immediately, revert on failure
      setOptimisticQty((prev) => { const m = new Map(prev); m.set(id, qty); return m; });
      try {
        const res = await updateCartItemQty(id, qty);
        if (!res.ok) {
          setOptimisticQty((prev) => { const m = new Map(prev); m.delete(id); return m; });
          showToast("Could not update quantity. Please try again.", "error");
        } else {
          refetch?.();
          setOptimisticQty((prev) => { const m = new Map(prev); m.delete(id); return m; });
        }
      } catch (_err) {
        void normalizeError(_err);
        setOptimisticQty((prev) => { const m = new Map(prev); m.delete(id); return m; });
        showToast("Could not update quantity. Please try again.", "error");
      }
    },
    [isAuthenticated, guest, showToast, refetch],
  );

  const handleRemove = useCallback(
    (id: string) => {
      if (!isAuthenticated) {
        guest.remove(id);
        showToast("Item removed from cart.", "info");
        return;
      }
      // Optimistic hide + 5s undo window before actual DELETE
      setPendingRemoveIds((prev) => new Set([...prev, id]));
      const timer = setTimeout(async () => {
        undoTimers.current.delete(id);
        try {
          const res = await deleteCartItem(id);
          if (!res.ok) {
            setPendingRemoveIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
            showToast("Could not remove item. Please try again.", "error");
          } else {
            refetch?.();
            setPendingRemoveIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
          }
        } catch (_err) {
          void normalizeError(_err);
          setPendingRemoveIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
          showToast("Could not remove item. Please try again.", "error");
        }
      }, 5000);
      undoTimers.current.set(id, timer);
      showToast(
        "Item removed from cart.",
        "info",
        5500,
        {
          label: "Undo",
          onClick: () => {
            const t = undoTimers.current.get(id);
            if (t) { clearTimeout(t); undoTimers.current.delete(id); }
            setPendingRemoveIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
          },
        },
      );
    },
    [isAuthenticated, guest, showToast, refetch],
  );

  // ---------------------------------------------------------------------------
  // Client-side search filter — title · seller · price · listing type
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesSearch = useCallback(
    (item: CartItemWithListingType): boolean => {
      if (!normalizedQuery) return true;
      const q = normalizedQuery;
      if ((item.meta.title ?? "").toLowerCase().includes(q)) return true;
      const store = ((item.meta.attributes?.storeName as string | undefined) ?? "").toLowerCase();
      if (store.includes(q)) return true;
      const price = item.meta.price;
      if (String(Math.round(price)).includes(q) || price.toFixed(2).includes(q)) return true;
      const lt = item.listingType ?? "standard";
      if ((LISTING_TYPE_SEARCH_KEYWORDS[lt] ?? [lt]).some((kw) => kw.includes(q))) return true;
      return false;
    },
    [normalizedQuery],
  );

  // ---------------------------------------------------------------------------
  // Tab split — cart (standard + pre-order) · auctions · accepted offers
  // Raffles/bundles are immediate buy-nows; they skip the cart entirely.
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<CartTab>("cart");
  // Open on the lane the buyer can actually act on. A winner following the
  // "Pay now" link from their bid_won notification must land on their auction,
  // not on an empty Cart tab they then have to hunt around.
  const autoSelectedLaneRef = useRef(false);

  // Bucket via the shared lane model. The old local version required
  // `item.locked` on BOTH branches — but accepted offers never set `locked`
  // (declining to buy is the buyer's right), so the Offers tab was structurally
  // always empty, and auctions couldn't reach the cart at all. Both extra tabs
  // were dead UI. `laneOf` is the same function the server-side gate and the
  // order splitter use, so the tab a buyer sees and the lane the server will
  // let them check out cannot disagree.
  const [cartBucket, auctionBucket, offerBucket] = useMemo(() => {
    const cart: CartItemWithListingType[] = [];
    const auctions: CartItemWithListingType[] = [];
    const offers: CartItemWithListingType[] = [];
    for (const item of inStockItems) {
      const lane = laneOf(item);
      if (lane === CART_LANE.AUCTION) auctions.push(item);
      else if (lane === CART_LANE.OFFER) offers.push(item);
      else cart.push(item);
    }
    return [cart, auctions, offers];
  }, [inStockItems]);

  // Which lane may actually be checked out, computed over the WHOLE cart —
  // the server enforces exactly this in `assertCheckoutLane()`.
  const currentLane = useMemo(() => activeLane(inStockItems), [inStockItems]);
  const activeTabLane: CartLane =
    activeTab === "auctions"
      ? CART_LANE.AUCTION
      : activeTab === "offers"
        ? CART_LANE.OFFER
        : CART_LANE.STANDARD;
  const laneBlocked = currentLane !== null && currentLane !== activeTabLane;
  const laneReason = laneBlocked ? laneBlockReason(inStockItems, activeTabLane) : null;

  // Totals are per-lane. A single blended total across three lanes is
  // meaningless when only one of them is payable right now.
  const laneBucket =
    activeTabLane === CART_LANE.AUCTION
      ? auctionBucket
      : activeTabLane === CART_LANE.OFFER
        ? offerBucket
        : cartBucket;
  const laneSubtotal = useMemo(
    () =>
      laneBucket.reduce(
        (sum, i) => sum + i.meta.price * i.quantity,
        0,
      ),
    [laneBucket],
  );

  /**
   * Selection, scoped to the viewed lane.
   *
   * The underlying `selectedItemIds` stays cart-wide — it is what the server's
   * `previewCheckoutPricing` reads, and scoping the STORED set per lane would
   * clobber another lane's selection every time the buyer switched tabs. So the
   * lane filter is applied for display/derivation only.
   *
   * Without this, "Select all (N)" counted every lane, and the standard lane's
   * total silently included any selected auction/offer item.
   */
  const laneItemIds = useMemo(
    () => laneBucket.map((i) => i.itemId ?? i.id),
    [laneBucket],
  );
  const laneSelectedIds = useMemo(
    () => (effectiveSelected ? laneItemIds.filter((id) => effectiveSelected.has(id)) : laneItemIds),
    [laneItemIds, effectiveSelected],
  );
  const laneSelectedCount = laneSelectedIds.length;
  const laneIsAllSelected = laneItemIds.length > 0 && laneSelectedCount === laneItemIds.length;

  const laneSelectedSubtotal = useMemo(() => {
    if (!effectiveSelected) return laneSubtotal;
    return laneBucket
      .filter((i) => effectiveSelected.has(i.itemId ?? i.id))
      .reduce((s, i) => s + i.meta.price * i.quantity, 0);
  }, [laneBucket, laneSubtotal, effectiveSelected]);

  /** Select every item in the viewed lane, leaving other lanes' selections intact. */
  const selectAllInLane = useCallback(async () => {
    const next = new Set(effectiveSelected ?? allItemIds);
    for (const id of laneItemIds) next.add(id);
    // Collapse to `null` (= "everything") once the union covers the whole cart,
    // matching what toggleItem persists.
    const collapsed = next.size >= allItemIds.length ? null : next;
    setSelectedIds(collapsed);
    if (!isAuthenticated) return;
    try {
      await persistCartSelection(collapsed ? Array.from(collapsed) : null);
    } catch (err) {
      void normalizeError(err);
      showToast("Could not update your selection. Please try again.", "error");
    }
  }, [effectiveSelected, allItemIds, laneItemIds, isAuthenticated, showToast]);

  /**
   * What the summary shows. The standard lane still honours the buyer's
   * per-item selection; the two locked lanes are all-or-nothing (you can't
   * part-pay an auction you won), so they show the whole lane.
   */
  const laneDisplayTotal =
    activeTabLane === CART_LANE.STANDARD ? laneSelectedSubtotal : laneSubtotal;

  /** Nothing in this lane is payable — distinct from "the cart is empty". */
  const laneHasNothingPayable =
    activeTabLane === CART_LANE.STANDARD ? laneSelectedCount === 0 : laneBucket.length === 0;

  // ---------------------------------------------------------------------------
  // Per-store add-ons + server pricing preview
  // ---------------------------------------------------------------------------

  /**
   * Add-on selections live on the cart document, keyed per store — that is the
   * granularity they are billed at, and it is what the checkout server actions
   * read when the order is placed. Nothing here is passed in a request body.
   */
  const [localStoreAddons, setLocalStoreAddons] = useState<Record<string, StoreAddonsValue> | null>(null);
  const serverStoreAddons = (serverCart?.cart?.storeAddons ?? {}) as Record<string, StoreAddonsValue>;
  const storeAddons = localStoreAddons ?? serverStoreAddons;

  const addonSignal = useMemo(
    () =>
      Object.entries(storeAddons)
        .map(([sid, a]) => `${sid}:${a.whatsappNotifyAddon ? 1 : 0}${a.giftWrapAddon ? 1 : 0}${a.shipmentProtectionAddon ? 1 : 0}`)
        .sort()
        .join("|"),
    [storeAddons],
  );

  const handleStoreAddonsChange = useCallback(
    (storeId: string, next: StoreAddonsValue) => {
      setLocalStoreAddons((prev) => ({ ...(prev ?? serverStoreAddons), [storeId]: next }));
      persistCartAddons(storeId, next).catch((err: unknown) => {
        void normalizeError(err);
        showToast("Could not update add-ons. Please try again.", "error");
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addonSignal, showToast],
  );

  /**
   * Server-computed breakdown for the lane on screen. Prices only the SELECTED
   * items, so a deselected item contributes to no line and a store with nothing
   * selected forms no group at all. Guests get no preview (the route is
   * auth-gated) and fall back to client-side subtotals.
   */
  const { preview: pricingPreview, isLoadingPreview } = usePricingPreview({
    enabled: isAuthenticated && !isEmpty && !laneHasNothingPayable,
    paymentMethod: "cash",
    lane: activeTabLane,
    addonSignal,
    couponSignal: String(effectiveSelected?.size ?? "all"),
  });

  /** This store's slice of the preview, for its card footer. */
  const previewByStore = useMemo(
    () => new Map((pricingPreview?.stores ?? []).map((s) => [s.storeId, s])),
    [pricingPreview],
  );

  /** Stores in this lane that have at least one selected item. */
  const laneSelectedStoreIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of laneBucket) {
      const iid = item.itemId ?? item.id;
      if (effectiveSelected && !effectiveSelected.has(iid)) continue;
      const sid = (item.meta as unknown as Record<string, unknown>).storeId as string | undefined;
      if (sid) ids.add(sid);
    }
    return ids;
  }, [laneBucket, effectiveSelected]);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const breakdownId = useId();

  /**
   * Per-store detail below a seller card: that store's own fees, then its add-on
   * checkboxes. The aggregate preview panel deliberately doesn't repeat this —
   * it would be a second, competing place to read the same numbers.
   */
  const renderStoreFooter = useCallback(
    (storeId: string) => {
      const storePreview = previewByStore.get(storeId);
      const hasSelected = laneSelectedStoreIds.has(storeId);
      const money = (v: number) => `₹${v.toFixed(2)}`;
      return (
        <Stack gap="xs" className="min-w-0">
          {storePreview && (
            <>
              {storePreview.shippingFee > 0 && (
                <Row align="center" justify="between" gap="sm">
                  <Text size="xs" color="muted">Shipping</Text>
                  <Text size="xs" color="muted" className="tabular-nums">{money(storePreview.shippingFee)}</Text>
                </Row>
              )}
              {storePreview.whatsappNotifyFee > 0 && (
                <Row align="center" justify="between" gap="sm">
                  <Text size="xs" color="muted">WhatsApp updates</Text>
                  <Text size="xs" color="muted" className="tabular-nums">{money(storePreview.whatsappNotifyFee)}</Text>
                </Row>
              )}
              {storePreview.giftWrapFee > 0 && (
                <Row align="center" justify="between" gap="sm">
                  <Text size="xs" color="muted">Gift wrap</Text>
                  <Text size="xs" color="muted" className="tabular-nums">{money(storePreview.giftWrapFee)}</Text>
                </Row>
              )}
              {storePreview.shipmentProtectionFee > 0 && (
                <Row align="center" justify="between" gap="sm">
                  <Text size="xs" color="muted">Shipment protection</Text>
                  <Text size="xs" color="muted" className="tabular-nums">{money(storePreview.shipmentProtectionFee)}</Text>
                </Row>
              )}
            </>
          )}
          <StoreAddonsPicker
            storeId={storeId}
            storeSubtotal={storePreview?.subtotal ?? 0}
            value={storeAddons[storeId] ?? {}}
            onChange={handleStoreAddonsChange}
            rates={commissions}
            disabled={!isAuthenticated || !hasSelected}
            disabledReason={
              !isAuthenticated
                ? "Sign in to add extras for this seller."
                : !hasSelected
                  ? "Select an item from this seller to add extras."
                  : undefined
            }
          />
        </Stack>
      );
    },
    [previewByStore, laneSelectedStoreIds, storeAddons, handleStoreAddonsChange, commissions, isAuthenticated],
  );

  /** Carry the lane through so /checkout opens on the same tab. */
  const checkoutHref =
    activeTabLane === CART_LANE.STANDARD
      ? String(ROUTES.USER.CHECKOUT)
      : `${String(ROUTES.USER.CHECKOUT)}?lane=${activeTabLane}`;

  useEffect(() => {
    if (autoSelectedLaneRef.current) return;
    if (currentLane === null) return;
    autoSelectedLaneRef.current = true;
    if (currentLane === CART_LANE.AUCTION) setActiveTab("auctions");
    else if (currentLane === CART_LANE.OFFER) setActiveTab("offers");
  }, [currentLane]);

  const filteredCartItems = useMemo(
    () => (normalizedQuery ? cartBucket.filter(matchesSearch) : cartBucket),
    [cartBucket, normalizedQuery, matchesSearch],
  );
  const filteredAuctions = useMemo(
    () => (normalizedQuery ? auctionBucket.filter(matchesSearch) : auctionBucket),
    [auctionBucket, normalizedQuery, matchesSearch],
  );
  const filteredOffers = useMemo(
    () => (normalizedQuery ? offerBucket.filter(matchesSearch) : offerBucket),
    [offerBucket, normalizedQuery, matchesSearch],
  );
  const filteredOos = useMemo(
    () => (normalizedQuery ? oosItems.filter(matchesSearch) : oosItems),
    [oosItems, normalizedQuery, matchesSearch],
  );

  // ---------------------------------------------------------------------------
  // Render helpers — W4 product link
  // ---------------------------------------------------------------------------
  const sellerGroupsCart = useMemo(() => groupBySeller(filteredCartItems), [filteredCartItems]);
  const sellerGroupsOos = useMemo(() => groupBySeller(filteredOos), [filteredOos]);
  const sellerGroupsAuctions = useMemo(() => groupBySeller(filteredAuctions), [filteredAuctions]);
  const sellerGroupsOffers = useMemo(() => groupBySeller(filteredOffers), [filteredOffers]);

  // ---------------------------------------------------------------------------
  // Mobile bottom actions — checkout CTA registered via layout BottomActions
  // ---------------------------------------------------------------------------
  // This bar must mirror the desktop Summary exactly. It previously read the
  // cross-lane `finalTotal`, ignored `laneBlocked`, and pushed a lane-less
  // /checkout — so on a phone you could sit on the Offers tab, read a blended
  // total, and tap into a checkout the desktop button correctly refused.
  const checkoutDisabled =
    isEmpty || laneHasNothingPayable || hasOnlyOos || isLoading || laneBlocked;
  const checkoutLabel =
    activeTabLane === CART_LANE.STANDARD && !laneIsAllSelected && laneSelectedCount > 0
      ? `${ACTIONS.CART["checkout"].label} ${laneSelectedCount} item${laneSelectedCount !== 1 ? "s" : ""}`
      : ACTIONS.CART["checkout"].label;

  const goToCheckout = useCallback(() => {
    if (!isAuthenticated) {
      requireAuth(ACTION_ID.CHECKOUT, () => router.push(checkoutHref));
    } else {
      router.push(checkoutHref);
    }
  }, [isAuthenticated, requireAuth, router, checkoutHref]);

  useBottomActions(
    isEmpty || isLoading
      ? {}
      : {
          // Same sentence the desktop Summary uses, so the two surfaces can
          // never disagree about which lane the number covers.
          secondaryLabel: laneBlocked
            ? (laneReason ?? undefined)
            : `${CART_LANE_LABELS[activeTabLane]} only`,
          infoLabel: `Total: ₹${(pricingPreview?.total ?? laneDisplayTotal).toFixed(2)} · ${
            activeTabLane === CART_LANE.STANDARD ? laneSelectedCount : laneBucket.length
          } item${
            (activeTabLane === CART_LANE.STANDARD ? laneSelectedCount : laneBucket.length) !== 1 ? "s" : ""
          }`,
          // Tapping the total row opens this above the bar — the mobile
          // counterpart of the desktop summary's "Show details" expander.
          infoPanel: checkoutDisabled ? undefined : (
            <CartPriceBreakdown
              preview={pricingPreview}
              itemCount={activeTabLane === CART_LANE.STANDARD ? laneSelectedCount : laneBucket.length}
              fallbackSubtotal={laneDisplayTotal}
              isLoading={isLoadingPreview}
              unavailableNote={
                isAuthenticated ? "Calculating shipping & fees…" : "Sign in to see shipping & fees."
              }
            />
          ),
          actions: checkoutDisabled
            ? []
            : [
                {
                  id: ACTION_ID.CHECKOUT,
                  label: checkoutLabel,
                  variant: "primary",
                  onClick: goToCheckout,
                },
              ],
        },
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  async function handleSelectAllAndCheckout() {
    try {
      await selectAllInLane();
      router.push(checkoutHref);
    } catch (err) {
      void normalizeError(err);
      showToast(err instanceof Error ? err.message : "Failed to select all items", "error");
    }
  }

  // A failed /api/cart fetch previously fell straight through to cartItems
  // defaulting to [] → "Your cart is empty", which is indistinguishable from
  // an actually-empty cart. Surface the failure instead.
  if (isAuthenticated && serverCartError) {
    return (
      <Stack gap="md" className="w-full max-w-2xl">
        <Alert variant="error">
          We couldn't load your cart. Please check your connection and try again.
        </Alert>
        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </Stack>
    );
  }

  return (
    <>
    <CartView
      labels={{ title: "Cart" }}
      isEmpty={isEmpty}
      isLoading={isLoading}
      renderItems={(itemsLoading) => {
        if (itemsLoading) {
          return <Div className="h-32 animate-pulse" surface="subtle" rounded="lg" />;
        }
        const tabCounts: Record<CartTab, number> = {
          cart: cartBucket.length + oosItems.length,
          auctions: auctionBucket.length,
          offers: offerBucket.length,
        };
        return (
          <Stack gap="md">
            {/* ── Tab bar ── */}
            <Row textSize="sm" gap="xs" padding="2xs" surface="subtle" rounded="xl">
              {CART_TABS.map(({ key, label }) => {
                const count = tabCounts[key];
                return (
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  onClick={() => { setActiveTab(key); setSearchQuery(""); }}
                  className={["flex-1 rounded-lg px-[var(--appkit-space-3)] py-[var(--appkit-space-1-5)] font-medium transition-colors", activeTab === key ? "bg-[var(--appkit-color-surface)] text-[var(--appkit-color-text)] shadow-sm" : "text-[var(--appkit-color-text-muted)] hover:text-zinc-700 hover:text-[var(--appkit-color-text-muted)]"].join(" ")}
                >
                  {label}{count > 0 && <Text as="span" className="ml-1.5 opacity-60" size="xs">({count})</Text>}
                </Button>
                );
              })}
            </Row>

            {/* ── Search + clear ── */}
            {!isEmpty && cartItems.length > 1 && (
              <Div className="relative">
                <Input type="search" placeholder="Search by name, store, price or type (auction, raffle…)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-[length:var(--appkit-text-sm)] pr-8" />
                {searchQuery && (
                  <Button type="button" variant="ghost" aria-label="Clear search" onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text-muted)] text-[length:var(--appkit-text-base)] leading-none">×</Button>
                )}
              </Div>
            )}

            {/* ── Bulk actions (cart tab only) ── */}
            {activeTab === "cart" && !isEmpty && (
              <Row align="center" gap="3" wrap>
                {/* Counts are lane-scoped: a denominator spanning all three
                    lanes made "select all in this lane" read as partial. */}
                {isAuthenticated && laneItemIds.length > 1 && (
                  <Row align="center" gap="sm">
                    <Checkbox
                      checked={laneIsAllSelected}
                      onChange={laneIsAllSelected ? undefined : () => { void selectAllInLane(); }}
                      onClick={!laneIsAllSelected ? undefined : (e) => { e.preventDefault(); void selectAllInLane(); }}
                      label={`Select all (${laneItemIds.length} item${laneItemIds.length !== 1 ? "s" : ""})`}
                    />
                  </Row>
                )}
                {laneSelectedCount > 0 && !laneIsAllSelected && (
                  <Button type="button" variant="ghost" onClick={() => { void handleRemoveSelectedItems(); }} disabled={isRemoving} className={`text-[length:var(--appkit-text-sm)] ${ERROR_TEXT_CLASS} hover:underline underline-offset-2 disabled:opacity-50`}>
                    {isRemoving ? "Removing…" : `Remove selected (${laneSelectedCount})`}
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={() => { void handleRemoveAll(); }} disabled={isRemoving} className={`ml-auto text-[length:var(--appkit-text-sm)] ${ERROR_TEXT_CLASS} hover:underline underline-offset-2 disabled:opacity-50`}>
                  {isRemoving ? "Clearing…" : "Remove all"}
                </Button>
              </Row>
            )}

            {/* ── Tab content — delegated to extracted components ── */}
            {activeTab === "auctions" ? (
              <AuctionsTabItems
                auctionBucket={auctionBucket}
                filteredAuctions={filteredAuctions}
                sellerGroupsAuctions={sellerGroupsAuctions}
                normalizedQuery={normalizedQuery}
                searchQuery={searchQuery}
                isAuthenticated={isAuthenticated}
                onToggleItem={toggleItem}
                onQtyChange={handleQtyChange}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
              />
            ) : activeTab === "offers" ? (
              <OffersTabItems
                offerBucket={offerBucket}
                filteredOffers={filteredOffers}
                sellerGroupsOffers={sellerGroupsOffers}
                normalizedQuery={normalizedQuery}
                searchQuery={searchQuery}
                isAuthenticated={isAuthenticated}
              />
            ) : (
              <CartTabItems
                cartBucket={cartBucket}
                oosItems={oosItems}
                filteredCartItems={filteredCartItems}
                filteredOos={filteredOos}
                sellerGroupsCart={sellerGroupsCart}
                sellerGroupsOos={sellerGroupsOos}
                normalizedQuery={normalizedQuery}
                searchQuery={searchQuery}
                isAuthenticated={isAuthenticated}
                effectiveSelected={effectiveSelected}
                renderStoreFooter={renderStoreFooter}
                onToggleItem={toggleItem}
                onQtyChange={handleQtyChange}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
              />
            )}
          </Stack>
        );
      }}
      renderSummary={() => (
        <CartSummary
          labels={{ title: "Summary" }}
          renderBreakdown={() => (
            <Stack gap="xs" className="">
              {/* Says which lane this total covers, in the same words the mobile
                  bar uses — the number changes as you switch tabs, so it has to
                  be self-describing. */}
              <Text size="xs" color="muted">
                This total covers your{" "}
                <Text as="span" size="xs" weight="semibold" color="muted">
                  {CART_LANE_LABELS[activeTabLane].toLowerCase()}
                </Text>{" "}
                only
              </Text>
              {/* Per-lane, never blended across tabs — only one lane is payable
                  at a time, so a combined figure would be a number the buyer
                  can't actually pay. */}
              <Row align="center" justify="between">
                <Text size="sm" color="muted">
                  {activeTabLane === CART_LANE.STANDARD
                    ? laneIsAllSelected
                      ? `${laneItemIds.length} item${laneItemIds.length !== 1 ? "s" : ""}`
                      : `${laneSelectedCount} of ${laneItemIds.length} items selected`
                    : `${laneBucket.length} ${CART_LANE_LABELS[activeTabLane].toLowerCase()}`}
                </Text>
                <Text size="sm" color="muted">
                  ₹{laneDisplayTotal.toFixed(2)}
                </Text>
              </Row>
              {/* Expands BELOW on desktop; the mobile bar opens the same
                  breakdown upward. Not <CollapsibleSection>, which brings its
                  own card chrome and would nest a card inside this one. */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowBreakdown((o) => !o)}
                aria-expanded={showBreakdown}
                aria-controls={breakdownId}
                className="w-full justify-between px-[var(--appkit-space-0)] text-[length:var(--appkit-text-xs)] text-[var(--appkit-color-text-muted)] hover:text-[var(--appkit-color-text)] min-h-0"
              >
                <Text as="span" size="xs" color="muted">
                  {showBreakdown ? "Hide details" : "Show details"}
                </Text>
                {showBreakdown ? (
                  <ChevronUp className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                )}
              </Button>
              <Div
                id={breakdownId}
                className={[
                  "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
                  showBreakdown ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0",
                ].join(" ")}
                aria-hidden={!showBreakdown}
              >
                <CartPriceBreakdown
                  preview={pricingPreview}
                  itemCount={activeTabLane === CART_LANE.STANDARD ? laneSelectedCount : laneBucket.length}
                  fallbackSubtotal={laneDisplayTotal}
                  isLoading={isLoadingPreview}
                  unavailableNote={
                    isAuthenticated ? "Calculating shipping & fees…" : "Sign in to see shipping & fees."
                  }
                />
              </Div>

              <CouponHelpDetails />
            </Stack>
          )}
          renderTotal={() => (
            <Div border="top-subtle" paddingY="t-sm">
              <Row align="center" justify="between">
                <Text weight="semibold" color="primary">
                  {activeTabLane === CART_LANE.STANDARD
                    ? "Total"
                    : `${CART_LANE_LABELS[activeTabLane]} total`}
                </Text>
                <Text weight="semibold" color="primary">
                  ₹{(pricingPreview?.total ?? laneDisplayTotal).toFixed(2)}
                </Text>
              </Row>
            </Div>
          )}
        />
      )}
      renderCheckoutButton={() => (
        <Stack className="mt-3" gap="sm">
          {laneBlocked ? (
            // Disabled + explained, never hidden — the buyer keeps seeing their
            // items and is told exactly which lane is blocking and why.
            <>
              <Button disabled className={CLS_CHECKOUT_BTN}>
                {ACTIONS.CART["checkout"].label}
              </Button>
              <Text className="text-warning" size="xs" align="center">
                {laneReason}
              </Text>
              <Button
                variant="ghost"
                onClick={() =>
                  setActiveTab(currentLane === CART_LANE.AUCTION ? "auctions" : "offers")
                }
                className={CLS_CHECKOUT_BTN}
              >
                Go to {CART_LANE_LABELS[currentLane ?? CART_LANE.STANDARD]}
              </Button>
            </>
          ) : isEmpty || laneHasNothingPayable || hasOnlyOos ? (
            <Button
              disabled
              className={CLS_CHECKOUT_BTN}
            >
              {ACTIONS.CART["checkout"].label}
            </Button>
          ) : !isAuthenticated ? (
            <Button
              onClick={() => requireAuth(ACTION_ID.CHECKOUT, () => router.push(checkoutHref))}
              className={CLS_CHECKOUT_BTN}
            >
              {ACTIONS.CART["checkout"].label}
            </Button>
          ) : (
            <Button
              asChild
              className={CLS_CHECKOUT_BTN}
            >
              <Link href={checkoutHref}>{checkoutLabel}</Link>
            </Button>
          )}
          {hasOnlyOos && (
            <Text className="text-[var(--appkit-color-error)]" size="xs" align="center">
              All items are out of stock. Remove them to continue.
            </Text>
          )}
          {activeTabLane === CART_LANE.STANDARD && !laneIsAllSelected && laneSelectedCount > 0 && !hasOnlyOos && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleSelectAllAndCheckout}
              className="w-full text-[0.75rem] text-[var(--appkit-color-text-muted)] underline underline-offset-2 hover:text-[var(--appkit-color-text)]"
            >
              Or checkout all {laneItemIds.length} items
            </Button>
          )}
        </Stack>
      )}
      renderEmpty={() => (
        <Div surface="card" padding="lg">
          <Heading
            level={2}
            className="mb-2" color="primary" size="lg" weight="semibold"
          >
            Your cart is empty
          </Heading>
          <Text color="muted">
            Add products from the marketplace to continue.
          </Text>
        </Div>
      )}
    />
    <LoginRequiredModal isOpen={modalOpen} onClose={closeModal} message={modalMessage} />
    </>
  );
}

// ---------------------------------------------------------------------------
// AuctionsTabItems / CartTabItems — tab content extracted to avoid deep nesting
// ---------------------------------------------------------------------------

interface ItemCallbacks {
  onToggleItem: (itemId: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (cartItemId: string, productId: string) => void;
}

interface AuctionsTabItemsProps extends ItemCallbacks {
  auctionBucket: CartItemWithListingType[];
  filteredAuctions: CartItemWithListingType[];
  sellerGroupsAuctions: SellerGroup[];
  normalizedQuery: string;
  searchQuery: string;
  isAuthenticated: boolean;
}

function AuctionsTabItems({ auctionBucket, filteredAuctions, sellerGroupsAuctions, normalizedQuery, searchQuery, isAuthenticated, onToggleItem, onQtyChange, onRemove, onMoveToWishlist }: AuctionsTabItemsProps) {
  if (auctionBucket.length === 0) {
    return <Text className={EMPTY_STATE_CLASS}>No won auctions in your cart.</Text>;
  }
  if (normalizedQuery && filteredAuctions.length === 0) {
    return <Text className={EMPTY_STATE_CLASS}>No auctions match &ldquo;{searchQuery.trim()}&rdquo;</Text>;
  }
  return (
    <Stack gap="md">
      <Text paddingY="xs" paddingX="x-xs" rounded="default" className="text-warning bg-[var(--appkit-color-warning-surface)] border border-warning/20" size="xs">
        Won auction items must be paid before you can bid on new auctions or purchase new items.
      </Text>
      {sellerGroupsAuctions.map((group) => (
        <Div key={group.sellerId} surface="card" padding="sm" overflow="hidden" className="min-w-0">
          <SellerGroupSection group={group} isAuthenticated={isAuthenticated} effectiveSelected={null} onToggleItem={onToggleItem} onQtyChange={onQtyChange} onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} isOutOfStock={false} locked lockedBadge="Won auction — payment required" />
        </Div>
      ))}
    </Stack>
  );
}

interface CartTabItemsProps extends ItemCallbacks {
  cartBucket: CartItemWithListingType[];
  oosItems: CartItemWithListingType[];
  filteredCartItems: CartItemWithListingType[];
  filteredOos: CartItemWithListingType[];
  sellerGroupsCart: SellerGroup[];
  sellerGroupsOos: SellerGroup[];
  normalizedQuery: string;
  searchQuery: string;
  isAuthenticated: boolean;
  effectiveSelected: Set<string> | null;
  /** Per-store fees + add-on checkboxes, rendered inside each seller card. */
  renderStoreFooter: (storeId: string) => React.ReactNode;
}

function CartTabItems({ cartBucket, oosItems, filteredCartItems, filteredOos, sellerGroupsCart, sellerGroupsOos, normalizedQuery, searchQuery, isAuthenticated, effectiveSelected, renderStoreFooter, onToggleItem, onQtyChange, onRemove, onMoveToWishlist }: CartTabItemsProps) {
  if (normalizedQuery && filteredCartItems.length === 0 && filteredOos.length === 0) {
    return <Text className={EMPTY_STATE_CLASS}>No items match &ldquo;{searchQuery.trim()}&rdquo;</Text>;
  }
  return (
    <>
      {sellerGroupsCart.map((group) => (
        <Div key={group.sellerId} surface="card" padding="sm" overflow="hidden" className="min-w-0">
          <SellerGroupSection group={group} isAuthenticated={isAuthenticated} effectiveSelected={effectiveSelected} onToggleItem={onToggleItem} onQtyChange={onQtyChange} onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} isOutOfStock={false} renderFooter={renderStoreFooter} />
        </Div>
      ))}
      {cartBucket.length === 0 && oosItems.length === 0 && (
        <Text className={EMPTY_STATE_CLASS}>No standard products or pre-orders in your cart.</Text>
      )}
      {oosItems.length > 0 && (
        <Div>
          <Row className="mb-3" align="center" justify="between">
            <Text className="tracking-wide text-[var(--appkit-color-error)]" size="xs" weight="semibold" transform="uppercase">Unavailable ({oosItems.length})</Text>
            <Link href={String(ROUTES.USER.WISHLIST)} className="text-[length:var(--appkit-text-xs)] text-primary-600 dark:text-primary-400 hover:underline underline-offset-2">View wishlist →</Link>
          </Row>
          <Stack gap="3">
            {sellerGroupsOos.map((group) => (
              <Div key={group.sellerId} surface="card" padding="sm" overflow="hidden" className="min-w-0 opacity-60">
                <SellerGroupSection group={group} isAuthenticated={isAuthenticated} effectiveSelected={null} onToggleItem={onToggleItem} onQtyChange={onQtyChange} onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} isOutOfStock={true} />
              </Div>
            ))}
          </Stack>
        </Div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// OffersTabItems — accepted offers (locked, must be paid)
// ---------------------------------------------------------------------------

interface OffersTabItemsProps {
  offerBucket: CartItemWithListingType[];
  filteredOffers: CartItemWithListingType[];
  sellerGroupsOffers: SellerGroup[];
  normalizedQuery: string;
  searchQuery: string;
  isAuthenticated: boolean;
}

function OffersTabItems({ offerBucket, filteredOffers, sellerGroupsOffers, normalizedQuery, searchQuery, isAuthenticated }: OffersTabItemsProps) {
  if (offerBucket.length === 0) {
    return <Text className={EMPTY_STATE_CLASS}>No accepted offers in your cart.</Text>;
  }
  if (normalizedQuery && filteredOffers.length === 0) {
    return <Text className={EMPTY_STATE_CLASS}>No offers match &ldquo;{searchQuery.trim()}&rdquo;</Text>;
  }
  const noop = () => {};
  return (
    <Stack gap="md">
      <Text paddingY="xs" paddingX="x-xs" rounded="default" className="text-warning bg-[var(--appkit-color-warning-surface)] border border-warning/20" size="xs">
        Accepted offers must be paid. These items cannot be removed from your cart.
      </Text>
      {sellerGroupsOffers.map((group) => (
        <Div key={group.sellerId} surface="card" padding="sm" overflow="hidden" className="min-w-0">
          <SellerGroupSection group={group} isAuthenticated={isAuthenticated} effectiveSelected={null} onToggleItem={noop} onQtyChange={noop} onRemove={noop} onMoveToWishlist={noop} isOutOfStock={false} locked lockedBadge="Offer accepted — payment required" />
        </Div>
      ))}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// SellerGroupSection — extracted to avoid repetitive JSX inline
// ---------------------------------------------------------------------------

interface SellerGroupSectionProps {
  group: SellerGroup;
  isAuthenticated: boolean;
  effectiveSelected: Set<string> | null;
  onToggleItem: (itemId: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (cartItemId: string, productId: string) => void;
  isOutOfStock: boolean;
  /** When true, items cannot be removed or have qty changed (won auction / accepted offer). */
  locked?: boolean;
  /** Badge text shown next to each locked item. */
  lockedBadge?: string;
  /**
   * Rendered inside the seller card, below its item rows — this store's own fee
   * lines and add-on checkboxes. Kept a slot so the card stays a layout concern
   * and the pricing/add-on wiring lives with the state that drives it.
   */
  renderFooter?: (storeId: string) => React.ReactNode;
}

function SellerGroupSection({
  group,
  isAuthenticated,
  effectiveSelected,
  onToggleItem,
  onQtyChange,
  onRemove,
  onMoveToWishlist,
  isOutOfStock,
  locked,
  lockedBadge,
  renderFooter,
}: SellerGroupSectionProps) {
  return (
    <Div className="min-w-0">
      {/* Seller header strip — the group card's own title bar, separated from
          the item rows by the same divider that separates the rows. */}
      <Row
        gap="xs"
        className="min-w-0 border-b border-[var(--appkit-color-border-subtle)]"
        padding="b-xs"
        align="center"
        justify="between"
        wrap
      >
        <Row gap="xs" className="min-w-0" align="center" wrap>
          <Text className="tracking-wide" color="muted" size="xs" weight="semibold" transform="uppercase">
            Sold by
          </Text>
          {group.sellerSlug ? (
            <Link
              href={String(ROUTES.PUBLIC.STORE_DETAIL(group.sellerSlug))}
              className="truncate text-[length:var(--appkit-text-xs)] font-semibold uppercase tracking-wide text-[var(--appkit-color-text-muted)] hover:underline underline-offset-2"
            >
              {group.sellerName}
            </Link>
          ) : (
            <Text className="tracking-wide" color="primary" size="xs" weight="semibold" transform="uppercase" truncate={1}>
              {group.sellerName}
            </Text>
          )}
        </Row>
        {/* Per-group subtotal */}
        {!isOutOfStock && group.items.length > 0 && (
          <Text size="xs" color="muted" className="flex-shrink-0 tabular-nums">
            ₹{group.items.reduce((s, i) => s + i.meta.price * i.quantity, 0).toFixed(2)}
          </Text>
        )}
      </Row>

      {/* Items — divider-separated rows inside the seller card, not cards of
          their own. `divide-y` gives the separation the nested cards used to
          imply, without a second border/radius/shadow inside the first. */}
      <Div className="min-w-0 divide-y divide-[var(--appkit-color-border-subtle)]">
        {group.items.map((item) => {
          const iid = item.itemId ?? item.id;
          const isChecked = !effectiveSelected || effectiveSelected.has(iid);
          const productHref = getProductHref(item.productId, item.listingType);

          return (
            <Row key={item.id} align="start" gap="3" padding="y-sm" className="min-w-0">
              {isAuthenticated && !isOutOfStock && !locked && (
                <Checkbox
                  aria-label={`Select ${item.meta.title}`}
                  checked={isChecked}
                  onChange={() => onToggleItem(iid)}
                  // Sizing/positioning belongs on the wrapper — `className`
                  // reaches only the inner <input> (Root Cause #29).
                  wrapperClassName="mt-1 flex-shrink-0"
                />
              )}
              <Div className="flex-1 min-w-0">
                <CartItemRow
                  item={item}
                  href={productHref}
                  isOutOfStock={isOutOfStock}
                  onQtyChange={isOutOfStock || locked ? undefined : onQtyChange}
                  onRemove={locked ? undefined : onRemove}
                  variant="row"
                />
                {locked && lockedBadge && (
                  <Row gap="xs" align="center" wrap className="mt-1 min-w-0">
                    <Text className="text-warning" size="xs" weight="medium">
                      🔒 {lockedBadge}
                    </Text>
                    {/* A mandatory deadline the buyer can't see isn't a
                        deadline. The line already carried checkoutDeadline all
                        the way from settlement and nothing ever rendered it —
                        so a won auction could silently lapse and be forfeited
                        with no warning anywhere in the UI. */}
                    {item.checkoutDeadline && (
                      <Row gap="xs" align="center" className="min-w-0">
                        <Clock className="w-3 h-3 flex-shrink-0 text-warning" aria-hidden="true" />
                        <Text size="xs" weight="semibold" className="text-warning tabular-nums">
                          <CountdownDisplay
                            targetDate={new Date(item.checkoutDeadline)}
                            format="auto"
                            expiredLabel="Deadline passed"
                          />
                        </Text>
                        <Text size="xs" color="muted">left to pay</Text>
                      </Row>
                    )}
                  </Row>
                )}
                {isOutOfStock && !locked && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onMoveToWishlist(iid, item.productId)}
                    className="mt-1 text-[length:var(--appkit-text-xs)] text-primary-600 dark:text-primary-400 hover:underline underline-offset-2"
                  >
                    Save to wishlist
                  </Button>
                )}
              </Div>
            </Row>
          );
        })}
      </Div>

      {/* Footer — this store's own fees and add-on choices, right under the
          items they apply to. */}
      {renderFooter && (
        <Div className="min-w-0 border-t border-[var(--appkit-color-border-subtle)]" padding="t-sm">
          {renderFooter(group.sellerId)}
        </Div>
      )}
    </Div>
  );
}
