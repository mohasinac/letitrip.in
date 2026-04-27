"use client";

import { useCallback, useMemo, useState } from "react";
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
} from "@mohasinac/appkit/client";
import type { CartItem } from "@mohasinac/appkit/client";
import { useRouter } from "next/navigation";

interface ServerCartItem {
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  currency: string;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
}

interface SellerGroup {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
}

function groupBySeller(items: CartItem[]): SellerGroup[] {
  const map = new Map<string, SellerGroup>();
  for (const item of items) {
    const sid = item.meta.sellerId ?? "unknown";
    const sname = item.meta.attributes?.sellerName ?? "Marketplace Seller";
    if (!map.has(sid)) {
      map.set(sid, { sellerId: sid, sellerName: sname, items: [] });
    }
    map.get(sid)!.items.push(item);
  }
  return Array.from(map.values());
}

interface ServerCartResponse {
  cart: { items: ServerCartItem[] };
  subtotal: number;
  itemCount: number;
}

function serverItemsToCartItems(items: ServerCartItem[]): CartItem[] {
  return items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    meta: {
      productId: item.productId,
      title: item.productTitle,
      image: item.productImage,
      price: item.price,
      currency: item.currency ?? "INR",
      sellerId: item.sellerId,
      attributes: {
        sellerName: item.sellerName ?? "Marketplace Seller",
      },
    },
  }));
}

function guestItemsToCartItems(
  items: ReturnType<typeof useGuestCart>["items"],
): CartItem[] {
  return items.map((item) => ({
    id: item.productId,
    productId: item.productId,
    quantity: item.quantity,
    meta: {
      productId: item.productId,
      title: item.productTitle ?? item.productId,
      image: item.productImage,
      price: item.price ?? 0,
      currency: "INR",
    },
  }));
}

export function CartRouteClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const guest = useGuestCart();
  const { data: serverCart, isLoading: serverLoading } =
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
  const cartItems: CartItem[] = isAuthenticated
    ? serverItemsToCartItems(serverCart?.cart?.items ?? [])
    : guestItemsToCartItems(guest.items);

  const subtotal = isAuthenticated
    ? (serverCart?.subtotal ?? 0)
    : cartItems.reduce((sum, i) => sum + i.meta.price * i.quantity, 0);

  const isEmpty = cartItems.length === 0;
  const isLoading = loading || (isAuthenticated && serverLoading);
  const sellerGroups = useMemo(() => groupBySeller(cartItems), [cartItems]);
  const isMultiSeller = sellerGroups.length > 1;

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim() || !isAuthenticated) return;
    setIsCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
        credentials: "include",
      });
      const data = await res.json() as { data?: { code: string; discountAmount: number }; error?: string };
      if (!res.ok) {
        setCouponError(data.error ?? "Invalid coupon code");
      } else {
        setAppliedCoupon({ code: data.data!.code, discountAmount: data.data!.discountAmount });
        setCouponCode("");
      }
    } catch {
      setCouponError("Failed to apply coupon. Please try again.");
    } finally {
      setIsCouponLoading(false);
    }
  }, [couponCode, isAuthenticated]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponError("");
  }, []);

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleQtyChange = useCallback(
    (id: string, qty: number) => {
      if (!isAuthenticated) {
        if (qty <= 0) guest.remove(id);
        else guest.updateQuantity(id, qty);
      }
    },
    [isAuthenticated, guest],
  );

  const handleRemove = useCallback(
    (id: string) => {
      if (!isAuthenticated) guest.remove(id);
    },
    [isAuthenticated, guest],
  );

  return (
    <CartView
      labels={{ title: "Cart" }}
      isEmpty={isEmpty}
      isLoading={isLoading}
      renderItems={(itemsLoading) => (
        <Div className="space-y-4">
          {itemsLoading ? (
            <Div className="h-32 animate-pulse rounded-lg bg-zinc-100 dark:bg-slate-800" />
          ) : (
            sellerGroups.map((group) => (
              <Div key={group.sellerId}>
                {isMultiSeller && (
                  <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Sold by {group.sellerName}
                  </Text>
                )}
                <Div className="space-y-3">
                  {group.items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onQtyChange={handleQtyChange}
                      onRemove={handleRemove}
                    />
                  ))}
                </Div>
              </Div>
            ))
          )}
        </Div>
      )}
      renderSummary={() => (
        <CartSummary
          labels={{ title: "Summary" }}
          renderBreakdown={() => (
            <Div className="space-y-1">
              <Text className="text-sm text-zinc-600 dark:text-zinc-300">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </Text>
              <Div className="flex items-center justify-between">
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">Shipping</Text>
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">Calculated at checkout</Text>
              </Div>
              {appliedCoupon && (
                <Div className="flex items-center justify-between">
                  <Text className="text-sm text-green-600 dark:text-green-400">
                    Coupon ({appliedCoupon.code})
                  </Text>
                  <Text className="text-sm text-green-600 dark:text-green-400">
                    &minus;&#x20B9;{appliedCoupon.discountAmount.toFixed(2)}
                  </Text>
                </Div>
              )}
              {isAuthenticated && !isEmpty && (
                <Div className="mt-2">
                  {appliedCoupon ? (
                    <Div className="flex items-center justify-between rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2">
                      <Text className="text-xs text-green-700 dark:text-green-300 font-medium">
                        {appliedCoupon.code} applied
                      </Text>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-zinc-500 dark:text-zinc-400 underline hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        Remove
                      </button>
                    </Div>
                  ) : (
                    <Div className="space-y-1">
                      <Div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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
                  )}
                </Div>
              )}
            </Div>
          )}
          renderTotal={() => (
            <Div>
              {appliedCoupon && (
                <Div className="mb-1 flex items-center justify-between">
                  <Text className="text-sm text-zinc-500 dark:text-zinc-400">Subtotal</Text>
                  <Text className="text-sm text-zinc-500 dark:text-zinc-400 line-through">
                    &#x20B9;{subtotal.toFixed(2)}
                  </Text>
                </Div>
              )}
              <Text className="font-semibold text-zinc-900 dark:text-zinc-100">
                Total: &#x20B9;{finalTotal.toFixed(2)}
              </Text>
            </Div>
          )}
        />
      )}
      renderCheckoutButton={() => (
        <Button
          type="button"
          onClick={() => router.push("/checkout")}
          disabled={isEmpty}
          className="mt-3 w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Checkout
        </Button>
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
