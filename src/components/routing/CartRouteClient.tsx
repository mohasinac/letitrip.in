"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  useToast,
  ROUTES,
} from "@mohasinac/appkit/client";
import type { CartItem } from "@mohasinac/appkit/client";
import { useRouter } from "next/navigation";

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
  isAuction?: boolean;
  isPreOrder?: boolean;
}

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
  items: (CartItem & { itemId?: string; isAuction?: boolean; isPreOrder?: boolean })[];
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
  data: { stale: string[]; outOfStock: string[] };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive the product detail URL from productId slug prefix. */
function getProductHref(productId: string, isAuction?: boolean, isPreOrder?: boolean): string {
  if (isAuction ?? productId.startsWith("auction-")) {
    return String(ROUTES.PUBLIC.AUCTION_DETAIL(productId));
  }
  if (isPreOrder ?? productId.startsWith("preorder-")) {
    return String(ROUTES.PUBLIC.PRE_ORDER_DETAIL(productId));
  }
  return String(ROUTES.PUBLIC.PRODUCT_DETAIL(productId));
}

function groupBySeller(
  items: (CartItem & { itemId?: string; isAuction?: boolean; isPreOrder?: boolean })[],
): SellerGroup[] {
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
): (CartItem & { itemId?: string; isAuction?: boolean; isPreOrder?: boolean })[] {
  return items.map((item) => ({
    id: item.itemId ?? item.productId,
    itemId: item.itemId,
    productId: item.productId,
    quantity: item.quantity,
    isAuction: item.isAuction,
    isPreOrder: item.isPreOrder,
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
): (CartItem & { itemId?: string; isAuction?: boolean; isPreOrder?: boolean })[] {
  return items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    isAuction: item.productId.startsWith("auction-"),
    isPreOrder: item.productId.startsWith("preorder-"),
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

  const guest = useGuestCart();
  const { data: serverCart, isLoading: serverLoading, refetch } =
    useCartQuery<ServerCartResponse>({
      endpoint: "/api/cart",
      queryKey: ["cart", user?.uid],
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
  // W1: Stale validation — run once on cart load
  // ---------------------------------------------------------------------------
  const validatedRef = useRef(false);
  const [outOfStockIds, setOutOfStockIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (loading || (isAuthenticated && serverLoading)) return;
    if (cartItems.length === 0) return;
    if (validatedRef.current) return;
    validatedRef.current = true;

    const productIds = cartItems.map((i) => i.productId);

    void (async () => {
      try {
        const res = await fetch("/api/cart/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as ValidateResponse;
        const { stale, outOfStock } = data.data;

        // --- Remove stale items ---
        if (stale.length > 0) {
          if (isAuthenticated) {
            // Find itemIds for stale productIds and call DELETE for each
            const staleSet = new Set(stale);
            const staleItems = cartItems.filter((i) => staleSet.has(i.productId));
            await Promise.allSettled(
              staleItems.map((item) => {
                const id = item.itemId ?? item.id;
                return fetch(`/api/cart/${encodeURIComponent(id)}`, {
                  method: "DELETE",
                  credentials: "include",
                });
              }),
            );
            refetch?.();
          } else {
            // Guest cart — remove from localStorage
            const staleSet = new Set(stale);
            for (const productId of staleSet) {
              guest.remove(productId);
            }
          }
          showToast(
            `${stale.length} item${stale.length !== 1 ? "s" : ""} removed — no longer available.`,
            "info",
          );
        }

        // --- Mark out-of-stock items ---
        if (outOfStock.length > 0) {
          setOutOfStockIds(new Set(outOfStock));
        }
      } catch {
        // Validation is best-effort; don't surface errors
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, serverLoading, isAuthenticated]);

  // Reset validation flag when cart changes (user logs in/out)
  useEffect(() => {
    validatedRef.current = false;
  }, [user?.uid]);

  // ---------------------------------------------------------------------------
  // W3: Split items into in-stock and out-of-stock
  // ---------------------------------------------------------------------------
  const [inStockItems, oosItems] = useMemo(() => {
    const inStock: typeof cartItems = [];
    const oos: typeof cartItems = [];
    for (const item of cartItems) {
      if (outOfStockIds.has(item.productId)) oos.push(item);
      else inStock.push(item);
    }
    return [inStock, oos];
  }, [cartItems, outOfStockIds]);

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
        credentials: "include",
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
          credentials: "include",
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
    () => new Set(serverCart?.cart?.selectedItemIds ?? []),
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
          credentials: "include",
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
        credentials: "include",
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
          credentials: "include",
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
          credentials: "include",
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
  // Render helpers — W4 product link
  // ---------------------------------------------------------------------------
  const sellerGroupsInStock = useMemo(() => groupBySeller(inStockItems), [inStockItems]);
  const sellerGroupsOos = useMemo(() => groupBySeller(oosItems), [oosItems]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <CartView
      labels={{ title: "Cart" }}
      isEmpty={isEmpty}
      isLoading={isLoading}
      renderItems={(itemsLoading) => (
        <Div className="space-y-6">
          {/* Select-all toggle — only over in-stock items */}
          {!isEmpty && !itemsLoading && isAuthenticated && allItemIds.length > 1 && (
            <Div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cart-select-all"
                checked={isAllSelected}
                onChange={isAllSelected ? undefined : selectAll}
                onClick={!isAllSelected ? undefined : (e) => { e.preventDefault(); selectAll(); }}
                className="h-4 w-4 rounded border-zinc-300 dark:border-slate-600 accent-zinc-900 dark:accent-zinc-100"
              />
              <label
                htmlFor="cart-select-all"
                className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-300"
              >
                Select all ({allItemIds.length} item{allItemIds.length !== 1 ? "s" : ""})
              </label>
            </Div>
          )}

          {itemsLoading ? (
            <Div className="h-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-slate-800" />
          ) : (
            <>
              {/* --- In-stock seller groups --- */}
              {sellerGroupsInStock.map((group) => (
                <SellerGroupSection
                  key={group.sellerId}
                  group={group}
                  isAuthenticated={isAuthenticated}
                  effectiveSelected={effectiveSelected}
                  effectiveCoupons={effectiveCoupons}
                  outOfStockIds={outOfStockIds}
                  onToggleItem={toggleItem}
                  onQtyChange={handleQtyChange}
                  onRemove={handleRemove}
                  isOutOfStock={false}
                />
              ))}

              {/* --- Out-of-stock section (W3) --- */}
              {oosItems.length > 0 && (
                <Div>
                  <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                    Out of Stock ({oosItems.length})
                  </Text>
                  <Div className="space-y-3">
                    {sellerGroupsOos.map((group) => (
                      <SellerGroupSection
                        key={group.sellerId}
                        group={group}
                        isAuthenticated={isAuthenticated}
                        effectiveSelected={null}
                        effectiveCoupons={[]}
                        outOfStockIds={outOfStockIds}
                        onToggleItem={toggleItem}
                        onQtyChange={handleQtyChange}
                        onRemove={handleRemove}
                        isOutOfStock={true}
                      />
                    ))}
                  </Div>
                </Div>
              )}
            </>
          )}
        </Div>
      )}
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
                  <Text className="text-sm text-emerald-600 dark:text-emerald-400">
                    {c.code}{c.scope === "seller" ? " (seller)" : ""}
                  </Text>
                  <Text className="text-sm text-emerald-600 dark:text-emerald-400">
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
                      <Text className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
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
                      <Text className="text-xs text-red-600 dark:text-red-400">{couponError}</Text>
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
                  <Text className="text-sm text-emerald-600 dark:text-emerald-400">
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
          <Button
            type="button"
            onClick={() => router.push(String(ROUTES.USER.CHECKOUT))}
            disabled={isEmpty || selectedCount === 0 || hasOnlyOos}
            className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {!isAllSelected && selectedCount > 0
              ? `Checkout ${selectedCount} item${selectedCount !== 1 ? "s" : ""}`
              : "Checkout"}
          </Button>
          {hasOnlyOos && (
            <Text className="text-center text-xs text-red-600 dark:text-red-400">
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
  outOfStockIds: Set<string>;
  onToggleItem: (itemId: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
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
          const productHref = getProductHref(item.productId, item.isAuction, item.isPreOrder);

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
              </Div>
            </Div>
          );
        })}
      </Div>
    </Div>
  );
}
