"use client";
/* eslint-disable lir/no-raw-html-elements -- LR1-17: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-17) */

const JSON_HEADERS = { "Content-Type": "application/json" } as const;
const FETCH_CREDENTIALS = "include" as const;
const CLS_CHECKOUT_BTN = "w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200";

async function deleteCartItem(itemId: string) {
  return fetch(`/api/cart/${encodeURIComponent(itemId)}`, { method: "DELETE", credentials: FETCH_CREDENTIALS });
}

async function addToWishlistAndRemoveFromCart(item: CartItem, failedIds: string[]) {
  const res = await fetch("/api/wishlist", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ productId: item.productId }),
    credentials: FETCH_CREDENTIALS,
  });
  if (!res.ok) { failedIds.push(item.productId); return; }
  await deleteCartItem(item.id);
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Button,
  CartItemRow,
  CartSummary,
  CartView,
  Div,
  Heading,
  Input,
  Text,
  useAuth,
  useCartQuery,
  useGuestCart,
  useGuestCartMerge,
  useGuestWishlist,
  useToast,
  ROUTES,
  useAuthGate,
  ACTION_ID,
  LoginRequiredModal,
} from "@mohasinac/appkit/client";
import type { CartItem } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

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
  sellerId?: string;
  sellerName?: string;
  sellerSlug?: string;
  /** Canonical listing-kind snapshot from CartItemDocument (SB1-G Phase 4). */
  listingType?: "standard" | "auction" | "pre-order" | "prize-draw";
}

/** Local helper — derives the per-item `listingType` snapshot used by cart UI rendering. */
type CartItemWithListingType = CartItem & {
  itemId?: string;
  listingType?: "standard" | "auction" | "pre-order" | "prize-draw";
};

interface AppliedCoupon {
  code: string;
  discountAmount: number;
  couponId?: string;
  scope?: "admin" | "seller";
  sellerId?: string;
  applicableItemIds?: string[];
}

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  sellerSlug?: string;
  items: CartItemWithListingType[];
}

interface ServerCartResponse {
  cart: {
    items: ServerCartItem[];
    appliedCoupons?: AppliedCoupon[];
    selectedItemIds?: string[] | null;
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
];

type CartTab = typeof CART_TABS[number]["key"];

const LISTING_TYPE_SEARCH_KEYWORDS: Record<string, string[]> = {
  auction:      ["auction"],
  "pre-order":  ["pre-order", "preorder", "pre order"],
  standard:     ["standard", "product"],
  "prize-draw": ["raffle", "prize-draw", "prize draw", "prize"],
};

const EMPTY_STATE_CLASS = "py-6 text-center text-sm text-zinc-500 dark:text-zinc-400";
const STORE_CARD_CLASS = "rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4";
const ERROR_TEXT_CLASS = "text-[var(--appkit-color-error)]";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive the product detail URL from the canonical listingType (with slug-prefix fallback). */
function getProductHref(
  productId: string,
  listingType?: "standard" | "auction" | "pre-order" | "prize-draw",
): string {
  if (listingType === "auction" || productId.startsWith("auction-")) {
    return String(ROUTES.PUBLIC.AUCTION_DETAIL(productId));
  }
  if (listingType === "pre-order" || productId.startsWith("preorder-")) {
    return String(ROUTES.PUBLIC.PRE_ORDER_DETAIL(productId));
  }
  return String(ROUTES.PUBLIC.PRODUCT_DETAIL(productId));
}

function groupBySeller(items: CartItemWithListingType[]): SellerGroup[] {
  const map = new Map<string, SellerGroup>();
  for (const item of items) {
    const meta = item.meta as unknown as Record<string, unknown>;
    const sid = (meta.sellerId as string | undefined) ?? "unknown";
    const sname = (item.meta.attributes?.sellerName as string | undefined) ?? "Marketplace Seller";
    const sslug = meta.sellerSlug as string | undefined;
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
    meta: {
      productId: item.productId,
      title: item.productTitle,
      image: item.productImage,
      price: item.price,
      currency: item.currency ?? "INR",
      sellerId: item.sellerId,
      sellerSlug: item.sellerSlug,
      attributes: {
        sellerName: item.sellerName ?? "Marketplace Seller",
      },
    },
  }));
}

function guestItemsToCartItems(
  items: ReturnType<typeof useGuestCart>["items"],
): CartItemWithListingType[] {
  return items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    // Guest carts don't carry a listingType snapshot — derive from slug prefix.
    listingType: item.productId.startsWith("auction-")
      ? "auction"
      : item.productId.startsWith("preorder-")
        ? "pre-order"
        : "standard",
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

export function CartRouteClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { requireAuth, modalOpen, modalMessage, closeModal } = useAuthGate();

  const guest = useGuestCart();
  const { data: serverCart, isLoading: serverLoading, refetch } =
    useCartQuery<ServerCartResponse>({
      endpoint: "/api/cart",
      queryKey: ["cart"],
      enabled: !!user?.uid,
    });

  useGuestCartMerge({
    userId: user?.uid,
    onNavigate: (url) => router.push(url),
  });

  const isAuthenticated = !!user?.uid;
  const cartItems = isAuthenticated
    ? serverItemsToCartItems(serverCart?.cart?.items ?? [])
    : guestItemsToCartItems(guest.items);

  const subtotal = isAuthenticated
    ? (serverCart?.subtotal ?? 0)
    : cartItems.reduce((sum, i) => sum + i.meta.price * i.quantity, 0);

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
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });
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
    } catch {
      // Validation is best-effort; don't surface errors
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // ---------------------------------------------------------------------------
  const [inStockItems, oosItems] = useMemo(() => {
    const inStock: typeof cartItems = [];
    const oos: typeof cartItems = [];
    for (const item of cartItems) {
      if (moveableIds.has(item.productId)) oos.push(item);
      else inStock.push(item);
    }
    return [inStock, oos];
  }, [cartItems, moveableIds]);

  const isEmpty = cartItems.length === 0;
  const hasOnlyOos = inStockItems.length === 0 && oosItems.length > 0;
  const isLoading = loading || (isAuthenticated && serverLoading);

  // ---------------------------------------------------------------------------
  // Applied coupons
  // ---------------------------------------------------------------------------
  const serverAppliedCoupons: AppliedCoupon[] = serverCart?.cart?.appliedCoupons ?? [];
  const [localCoupons, setLocalCoupons] = useState<AppliedCoupon[] | null>(null);
  const effectiveCoupons = localCoupons ?? serverAppliedCoupons;

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [removingCode, setRemovingCode] = useState<string | null>(null);

  const handleApplyCoupon = useCallback(async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code || !isAuthenticated) return;
    if (effectiveCoupons.some((c) => c.code === code)) {
      setCouponError("This coupon is already applied.");
      return;
    }
    setIsCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        credentials: FETCH_CREDENTIALS,
      });
      const data = await res.json() as { data?: AppliedCoupon; error?: string };
      if (!res.ok) {
        const errMsg = data.error ?? "Invalid coupon code";
        setCouponError(errMsg);
        showToast(errMsg, "error");
      } else {
        const applied = data.data!;
        setLocalCoupons((prev) => [
          ...(prev ?? effectiveCoupons).filter((c) => c.code !== applied.code),
          applied,
        ]);
        setCouponCode("");
        showToast(
          `Coupon "${applied.code}" applied! You saved ₹${applied.discountAmount.toFixed(2)}.`,
          "success",
        );
        refetch?.();
      }
    } catch {
      const errMsg = "Failed to apply coupon. Please try again.";
      setCouponError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsCouponLoading(false);
    }
  }, [couponCode, isAuthenticated, effectiveCoupons, showToast, refetch]);

  const handleRemoveCoupon = useCallback(
    async (code: string) => {
      setRemovingCode(code);
      setLocalCoupons((prev) => (prev ?? effectiveCoupons).filter((c) => c.code !== code));
      if (isAuthenticated) {
        await fetch("/api/cart/coupon", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
          credentials: FETCH_CREDENTIALS,
        }).catch(() => {});
        refetch?.();
      }
      showToast("Coupon removed.", "info");
      setRemovingCode(null);
    },
    [isAuthenticated, effectiveCoupons, showToast, refetch],
  );

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
  const isAllSelected = effectiveSelected === null;
  const selectedCount = effectiveSelected ? effectiveSelected.size : allItemIds.length;

  const toggleItem = useCallback(
    async (itemId: string) => {
      const current = effectiveSelected ? new Set(effectiveSelected) : new Set(allItemIds);
      if (current.has(itemId)) current.delete(itemId);
      else current.add(itemId);
      const next = current.size >= allItemIds.length ? null : current;
      setSelectedIds(next);
      if (isAuthenticated) {
        await fetch("/api/cart/selection", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIds: next ? Array.from(next) : null }),
          credentials: FETCH_CREDENTIALS,
        }).catch(() => {});
      }
    },
    [effectiveSelected, allItemIds, isAuthenticated],
  );

  const selectAll = useCallback(async () => {
    setSelectedIds(null);
    if (isAuthenticated) {
      await fetch("/api/cart/selection", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: null }),
        credentials: FETCH_CREDENTIALS,
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  // ---------------------------------------------------------------------------
  // Totals
  // ---------------------------------------------------------------------------
  const selectedSubtotal = useMemo(() => {
    if (!effectiveSelected) return subtotal;
    return inStockItems
      .filter((i) => effectiveSelected.has(i.itemId ?? i.id))
      .reduce((s, i) => s + i.meta.price * i.quantity, 0);
  }, [inStockItems, effectiveSelected, subtotal]);

  const totalDiscount = effectiveCoupons.reduce((s, c) => s + c.discountAmount, 0);
  const finalTotal = Math.max(0, selectedSubtotal - totalDiscount);

  // ---------------------------------------------------------------------------
  // Bulk remove actions
  // ---------------------------------------------------------------------------
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveSelectedItems = useCallback(async () => {
    if (!effectiveSelected || effectiveSelected.size === 0 || isRemoving) return;
    const toRemove = inStockItems.filter((i) => effectiveSelected.has(i.itemId ?? i.id));
    if (toRemove.length === 0) return;
    setIsRemoving(true);
    try {
      if (isAuthenticated) {
        await Promise.allSettled(
          toRemove.map((item) => {
            const id = item.itemId ?? item.id;
            return fetch(`/api/cart/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
          }),
        );
        refetch?.();
      } else {
        toRemove.forEach((item) => guest.remove(item.productId));
      }
      setSelectedIds(null);
      showToast(`${toRemove.length} item${toRemove.length !== 1 ? "s" : ""} removed.`, "info");
    } catch {
      showToast("Could not remove items. Please try again.", "error");
    } finally {
      setIsRemoving(false);
    }
  }, [effectiveSelected, inStockItems, isAuthenticated, isRemoving, guest, showToast, refetch]);

  const handleRemoveAll = useCallback(async () => {
    const toRemove = [...inStockItems, ...oosItems];
    if (toRemove.length === 0 || isRemoving) return;
    const count = toRemove.length;
    setIsRemoving(true);
    try {
      if (isAuthenticated) {
        await Promise.allSettled(
          toRemove.map((item) => {
            const id = item.itemId ?? item.id;
            return fetch(`/api/cart/${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
          }),
        );
        refetch?.();
      } else {
        toRemove.forEach((item) => guest.remove(item.productId));
      }
      setSelectedIds(null);
      setLocalCoupons(null);
      showToast(`Cart cleared (${count} item${count !== 1 ? "s" : ""}).`, "info");
    } catch {
      showToast("Could not clear cart. Please try again.", "error");
    } finally {
      setIsRemoving(false);
    }
  }, [inStockItems, oosItems, isAuthenticated, isRemoving, guest, showToast, refetch]);

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
        const wishlistRes = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
          credentials: FETCH_CREDENTIALS,
        });
        if (!wishlistRes.ok) {
          const errData = (await wishlistRes.json().catch(() => ({}))) as { code?: string };
          if (errData.code === "WISHLIST_FULL") {
            showToast("Wishlist is full — remove an item to save this here.", "error");
          } else {
            showToast("Could not save to wishlist. Please try again.", "error");
          }
          return;
        }
        await fetch(`/api/cart/${encodeURIComponent(cartItemId)}`, {
          method: "DELETE",
          credentials: FETCH_CREDENTIALS,
        });
        setMoveableIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
        refetch?.();
        showToast("Item saved to wishlist.", "info");
      } catch {
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
      // Auth cart — PATCH item via API
      if (qty <= 0) return; // guard; remove handled by handleRemove
      try {
        const res = await fetch(`/api/cart/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: qty }),
          credentials: FETCH_CREDENTIALS,
        });
        if (!res.ok) {
          showToast("Could not update quantity. Please try again.", "error");
        } else {
          refetch?.();
        }
      } catch {
        showToast("Could not update quantity. Please try again.", "error");
      }
    },
    [isAuthenticated, guest, showToast, refetch],
  );

  const handleRemove = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        guest.remove(id);
        showToast("Item removed from cart.", "info");
        return;
      }
      // Auth cart — DELETE item via API
      try {
        const res = await fetch(`/api/cart/${encodeURIComponent(id)}`, {
          method: "DELETE",
          credentials: FETCH_CREDENTIALS,
        });
        if (!res.ok) {
          showToast("Could not remove item. Please try again.", "error");
        } else {
          showToast("Item removed from cart.", "info");
          refetch?.();
        }
      } catch {
        showToast("Could not remove item. Please try again.", "error");
      }
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
      const seller = ((item.meta.attributes?.sellerName as string | undefined) ?? "").toLowerCase();
      if (seller.includes(q)) return true;
      const price = item.meta.price;
      if (String(Math.round(price)).includes(q) || price.toFixed(2).includes(q)) return true;
      const lt = item.listingType ?? "standard";
      if ((LISTING_TYPE_SEARCH_KEYWORDS[lt] ?? [lt]).some((kw) => kw.includes(q))) return true;
      return false;
    },
    [normalizedQuery],
  );

  // ---------------------------------------------------------------------------
  // Tab split — cart (standard + pre-order) · auctions
  // Raffles/bundles are immediate buy-nows; they skip the cart entirely.
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<CartTab>("cart");

  const [cartBucket, auctionBucket] = useMemo(() => {
    const cart: CartItemWithListingType[] = [];
    const auctions: CartItemWithListingType[] = [];
    for (const item of inStockItems) {
      if ((item.listingType ?? "standard") === "auction") auctions.push(item);
      else cart.push(item);
    }
    return [cart, auctions];
  }, [inStockItems]);

  const filteredCartItems = useMemo(
    () => (normalizedQuery ? cartBucket.filter(matchesSearch) : cartBucket),
    [cartBucket, normalizedQuery, matchesSearch],
  );
  const filteredAuctions = useMemo(
    () => (normalizedQuery ? auctionBucket.filter(matchesSearch) : auctionBucket),
    [auctionBucket, normalizedQuery, matchesSearch],
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
    <CartView
      labels={{ title: "Cart" }}
      isEmpty={isEmpty}
      isLoading={isLoading}
      renderItems={(itemsLoading) => {
        if (itemsLoading) {
          return <Div className="h-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-slate-800" />;
        }
        const tabCounts: Record<CartTab, number> = {
          cart: cartBucket.length + oosItems.length,
          auctions: auctionBucket.length,
        };
        return (
          <Div className="space-y-4">
            {/* ── Tab bar ── */}
            <Div className="flex gap-1 rounded-xl bg-zinc-100 dark:bg-slate-800 p-1 text-sm">
              {CART_TABS.map(({ key, label }) => {
                const count = tabCounts[key];
                return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setActiveTab(key); setSearchQuery(""); }}
                  className={["flex-1 rounded-lg px-3 py-1.5 font-medium transition-colors", activeTab === key ? "bg-white dark:bg-slate-700 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"].join(" ")}
                >
                  {label}{count > 0 && <span className="ml-1.5 text-xs opacity-60">({count})</span>}
                </button>
                );
              })}
            </Div>

            {/* ── Search + clear ── */}
            {!isEmpty && cartItems.length > 1 && (
              <Div className="relative">
                <Input type="search" placeholder="Search by name, store, price or type (auction, raffle…)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-sm pr-8" />
                {searchQuery && (
                  <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-base leading-none">×</button>
                )}
              </Div>
            )}

            {/* ── Bulk actions (cart tab only) ── */}
            {activeTab === "cart" && !isEmpty && (
              <Div className="flex flex-wrap items-center gap-3">
                {isAuthenticated && allItemIds.length > 1 && (
                  <Div className="flex items-center gap-2">
                    <input type="checkbox" id="cart-select-all" checked={isAllSelected} onChange={isAllSelected ? undefined : selectAll} onClick={!isAllSelected ? undefined : (e) => { e.preventDefault(); selectAll(); }} className="h-4 w-4 rounded border-zinc-300 dark:border-slate-600 accent-zinc-900 dark:accent-zinc-100" />
                    <label htmlFor="cart-select-all" className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-300">
                      Select all ({allItemIds.length} item{allItemIds.length !== 1 ? "s" : ""})
                    </label>
                  </Div>
                )}
                {effectiveSelected && effectiveSelected.size > 0 && (
                  <button type="button" onClick={() => { void handleRemoveSelectedItems(); }} disabled={isRemoving} className={`text-sm ${ERROR_TEXT_CLASS} hover:underline underline-offset-2 disabled:opacity-50`}>
                    {isRemoving ? "Removing…" : `Remove selected (${effectiveSelected.size})`}
                  </button>
                )}
                <button type="button" onClick={() => { void handleRemoveAll(); }} disabled={isRemoving} className={`ml-auto text-sm ${ERROR_TEXT_CLASS} hover:underline underline-offset-2 disabled:opacity-50`}>
                  {isRemoving ? "Clearing…" : "Remove all"}
                </button>
              </Div>
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
                effectiveCoupons={effectiveCoupons}
                onToggleItem={toggleItem}
                onQtyChange={handleQtyChange}
                onRemove={handleRemove}
                onMoveToWishlist={handleMoveToWishlist}
              />
            )}
          </Div>
        );
      }}
      renderSummary={() => (
        <CartSummary
          labels={{ title: "Summary" }}
          renderBreakdown={() => (
            <Div className="space-y-1.5">
              <Div className="flex items-center justify-between">
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                  {selectedCount === allItemIds.length
                    ? `${allItemIds.length} item${allItemIds.length !== 1 ? "s" : ""}`
                    : `${selectedCount} of ${allItemIds.length} items selected`}
                </Text>
                <Text className="text-sm text-zinc-700 dark:text-zinc-300">
                  ₹{selectedSubtotal.toFixed(2)}
                </Text>
              </Div>
              <Div className="flex items-center justify-between">
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">Shipping</Text>
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">At checkout</Text>
              </Div>

              {/* Per-coupon discount rows */}
              {effectiveCoupons.map((c) => (
                <Div key={c.code} className="flex items-center justify-between">
                  <Text className="text-sm text-[var(--appkit-color-success)]">
                    {c.code}{c.scope === "seller" ? " (seller)" : ""}
                  </Text>
                  <Text className="text-sm text-[var(--appkit-color-success)]">
                    &minus;₹{c.discountAmount.toFixed(2)}
                  </Text>
                </Div>
              ))}

              {/* Coupon management (auth only) */}
              {isAuthenticated && !isEmpty && (
                <Div className="mt-3 space-y-2">
                  {effectiveCoupons.map((c) => (
                    <Div
                      key={c.code}
                      className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2"
                    >
                      <Text className="text-xs font-medium text-[var(--appkit-color-success)]">
                        {c.code}{c.scope === "seller" ? " — this seller" : ""}
                      </Text>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoupon(c.code)}
                        disabled={removingCode === c.code}
                        className="text-xs text-zinc-500 dark:text-zinc-400 underline hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-50"
                      >
                        {removingCode === c.code ? "…" : "Remove"}
                      </button>
                    </Div>
                  ))}

                  {/* Add coupon input */}
                  <Div className="space-y-1">
                    <Div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={effectiveCoupons.length ? "Add another coupon" : "Coupon code"}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        className="flex-1 text-sm"
                        maxLength={50}
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isCouponLoading || !couponCode.trim()}
                        className="text-sm bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        {isCouponLoading ? "…" : "Apply"}
                      </Button>
                    </Div>
                    {couponError && (
                      <Text className={`text-xs ${ERROR_TEXT_CLASS}`}>{couponError}</Text>
                    )}
                  </Div>
                </Div>
              )}
            </Div>
          )}
          renderTotal={() => (
            <Div className="border-t border-zinc-100 dark:border-slate-700 pt-3 space-y-1">
              {totalDiscount > 0 && (
                <Div className="flex items-center justify-between">
                  <Text className="text-sm text-zinc-500 dark:text-zinc-400">
                    Total discount ({effectiveCoupons.length} coupon{effectiveCoupons.length !== 1 ? "s" : ""})
                  </Text>
                  <Text className="text-sm text-[var(--appkit-color-success)]">
                    &minus;₹{totalDiscount.toFixed(2)}
                  </Text>
                </Div>
              )}
              <Div className="flex items-center justify-between">
                <Text className="font-semibold text-zinc-900 dark:text-zinc-100">Total</Text>
                <Text className="font-semibold text-zinc-900 dark:text-zinc-100">
                  ₹{finalTotal.toFixed(2)}
                </Text>
              </Div>
            </Div>
          )}
        />
      )}
      renderCheckoutButton={() => (
        <Div className="mt-3 space-y-2">
          {isEmpty || selectedCount === 0 || hasOnlyOos ? (
            <Button
              disabled
              className={CLS_CHECKOUT_BTN}
            >
              Checkout
            </Button>
          ) : !isAuthenticated ? (
            <Button
              onClick={() => requireAuth(ACTION_ID.CHECKOUT, () => {})}
              className={CLS_CHECKOUT_BTN}
            >
              Checkout
            </Button>
          ) : (
            <Button
              asChild
              className={CLS_CHECKOUT_BTN}
            >
              <Link href={String(ROUTES.USER.CHECKOUT)}>
                {!isAllSelected && selectedCount > 0
                  ? `Checkout ${selectedCount} item${selectedCount !== 1 ? "s" : ""}`
                  : "Checkout"}
              </Link>
            </Button>
          )}
          {hasOnlyOos && (
            <Text className="text-center text-xs text-[var(--appkit-color-error)]">
              All items are out of stock. Remove them to continue.
            </Text>
          )}
          {!isAllSelected && selectedCount > 0 && !hasOnlyOos && (
            <button
              type="button"
              onClick={async () => { await selectAll(); router.push(String(ROUTES.USER.CHECKOUT)); }}
              className="w-full text-xs text-zinc-500 dark:text-zinc-400 underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              Or checkout all {allItemIds.length} items
            </button>
          )}
        </Div>
      )}
      renderEmpty={() => (
        <Div className="rounded-xl border border-zinc-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
          <Heading
            level={2}
            className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Your cart is empty
          </Heading>
          <Text className="text-zinc-600 dark:text-zinc-300">
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
    <Div className="space-y-4">
      {sellerGroupsAuctions.map((group) => (
        <Div key={group.sellerId} className={STORE_CARD_CLASS}>
          <SellerGroupSection group={group} isAuthenticated={isAuthenticated} effectiveSelected={null} effectiveCoupons={[]} onToggleItem={onToggleItem} onQtyChange={onQtyChange} onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} isOutOfStock={false} />
        </Div>
      ))}
    </Div>
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
  effectiveCoupons: AppliedCoupon[];
}

function CartTabItems({ cartBucket, oosItems, filteredCartItems, filteredOos, sellerGroupsCart, sellerGroupsOos, normalizedQuery, searchQuery, isAuthenticated, effectiveSelected, effectiveCoupons, onToggleItem, onQtyChange, onRemove, onMoveToWishlist }: CartTabItemsProps) {
  if (normalizedQuery && filteredCartItems.length === 0 && filteredOos.length === 0) {
    return <Text className={EMPTY_STATE_CLASS}>No items match &ldquo;{searchQuery.trim()}&rdquo;</Text>;
  }
  return (
    <>
      {sellerGroupsCart.map((group) => (
        <Div key={group.sellerId} className={STORE_CARD_CLASS}>
          <SellerGroupSection group={group} isAuthenticated={isAuthenticated} effectiveSelected={effectiveSelected} effectiveCoupons={effectiveCoupons} onToggleItem={onToggleItem} onQtyChange={onQtyChange} onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} isOutOfStock={false} />
        </Div>
      ))}
      {cartBucket.length === 0 && oosItems.length === 0 && (
        <Text className={EMPTY_STATE_CLASS}>No standard products or pre-orders in your cart.</Text>
      )}
      {oosItems.length > 0 && (
        <Div>
          <Div className="mb-3 flex items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wide text-[var(--appkit-color-error)]">Unavailable ({oosItems.length})</Text>
            <Link href={String(ROUTES.USER.WISHLIST)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline underline-offset-2">View wishlist →</Link>
          </Div>
          <Div className="space-y-3">
            {sellerGroupsOos.map((group) => (
              <Div key={group.sellerId} className={`${STORE_CARD_CLASS} opacity-60`}>
                <SellerGroupSection group={group} isAuthenticated={isAuthenticated} effectiveSelected={null} effectiveCoupons={[]} onToggleItem={onToggleItem} onQtyChange={onQtyChange} onRemove={onRemove} onMoveToWishlist={onMoveToWishlist} isOutOfStock={true} />
              </Div>
            ))}
          </Div>
        </Div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// SellerGroupSection — extracted to avoid repetitive JSX inline
// ---------------------------------------------------------------------------

interface SellerGroupSectionProps {
  group: SellerGroup;
  isAuthenticated: boolean;
  effectiveSelected: Set<string> | null;
  effectiveCoupons: AppliedCoupon[];
  onToggleItem: (itemId: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onMoveToWishlist: (cartItemId: string, productId: string) => void;
  isOutOfStock: boolean;
}

function SellerGroupSection({
  group,
  isAuthenticated,
  effectiveSelected,
  effectiveCoupons,
  onToggleItem,
  onQtyChange,
  onRemove,
  onMoveToWishlist,
  isOutOfStock,
}: SellerGroupSectionProps) {
  return (
    <Div>
      {/* Seller header */}
      <Div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Sold by
        </Text>
        {group.sellerSlug ? (
          <Link
            href={String(ROUTES.PUBLIC.STORE_DETAIL(group.sellerSlug))}
            className="text-xs font-semibold uppercase tracking-wide text-zinc-800 dark:text-zinc-200 hover:underline underline-offset-2"
          >
            {group.sellerName}
          </Link>
        ) : (
          <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-800 dark:text-zinc-200">
            {group.sellerName}
          </Text>
        )}
        {/* Seller-scoped coupon badges */}
        {effectiveCoupons
          .filter((c) => c.scope === "seller" && c.sellerId === group.sellerId)
          .map((c) => (
            <span
              key={c.code}
              className="rounded bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"
            >
              {c.code}
            </span>
          ))}
      </Div>

      {/* Items */}
      <Div className="space-y-3">
        {group.items.map((item) => {
          const iid = item.itemId ?? item.id;
          const isChecked = !effectiveSelected || effectiveSelected.has(iid);
          const productHref = getProductHref(item.productId, item.listingType);

          return (
            <Div key={item.id} className="flex items-start gap-3">
              {isAuthenticated && !isOutOfStock && (
                <input
                  type="checkbox"
                  aria-label={`Select ${item.meta.title}`}
                  checked={isChecked}
                  onChange={() => onToggleItem(iid)}
                  className="mt-5 h-4 w-4 flex-shrink-0 rounded border-zinc-300 dark:border-slate-600 accent-zinc-900 dark:accent-zinc-100"
                />
              )}
              <Div className="flex-1">
                <CartItemRow
                  item={item}
                  href={productHref}
                  isOutOfStock={isOutOfStock}
                  onQtyChange={isOutOfStock ? undefined : onQtyChange}
                  onRemove={onRemove}
                />
                {isOutOfStock && (
                  <button
                    type="button"
                    onClick={() => onMoveToWishlist(iid, item.productId)}
                    className="mt-1 text-xs text-primary-600 dark:text-primary-400 hover:underline underline-offset-2"
                  >
                    Save to wishlist
                  </button>
                )}
              </Div>
            </Div>
          );
        })}
      </Div>
    </Div>
  );
}
