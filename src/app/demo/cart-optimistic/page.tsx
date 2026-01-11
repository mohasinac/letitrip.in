"use client";

import { useState } from "react";
import {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/hooks/queries/useCart";

/**
 * Demo page for cart optimistic updates
 * Demonstrates immediate UI updates with rollback on error
 */
export default function CartOptimisticDemo() {
  const [networkDelay, setNetworkDelay] = useState(1500);
  const [simulateError, setSimulateError] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const { data: cart, isLoading } = useCart();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  // Sample product for adding to cart
  const sampleProduct = {
    productId: "demo-product-1",
    quantity: 1,
  };

  const handleAddToCart = async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, networkDelay));

    if (simulateError) {
      throw new Error("Simulated add to cart error");
    }

    addToCart.mutate(sampleProduct, {
      onSuccess: () => {
        console.log("✅ Item added to cart");
      },
      onError: (error) => {
        console.error("❌ Failed to add item:", error);
      },
    });
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, networkDelay));

    if (simulateError) {
      throw new Error("Simulated update quantity error");
    }

    updateCartItem.mutate(
      { itemId, quantity: newQuantity },
      {
        onSuccess: () => {
          console.log("✅ Quantity updated");
        },
        onError: (error) => {
          console.error("❌ Failed to update quantity:", error);
        },
      }
    );
  };

  const handleRemoveItem = async (itemId: string) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, networkDelay));

    if (simulateError) {
      throw new Error("Simulated remove item error");
    }

    removeFromCart.mutate(itemId, {
      onSuccess: () => {
        console.log("✅ Item removed");
      },
      onError: (error) => {
        console.error("❌ Failed to remove item:", error);
      },
    });
  };

  const handleClearCart = async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, networkDelay));

    if (simulateError) {
      throw new Error("Simulated clear cart error");
    }

    clearCart.mutate(undefined, {
      onSuccess: () => {
        console.log("✅ Cart cleared");
      },
      onError: (error) => {
        console.error("❌ Failed to clear cart:", error);
      },
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, networkDelay));

    if (simulateError) {
      throw new Error("Simulated apply coupon error");
    }

    applyCoupon.mutate(couponCode, {
      onSuccess: () => {
        console.log("✅ Coupon applied");
        setCouponCode("");
      },
      onError: (error) => {
        console.error("❌ Failed to apply coupon:", error);
      },
    });
  };

  const handleRemoveCoupon = async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, networkDelay));

    if (simulateError) {
      throw new Error("Simulated remove coupon error");
    }

    removeCoupon.mutate(undefined, {
      onSuccess: () => {
        console.log("✅ Coupon removed");
      },
      onError: (error) => {
        console.error("❌ Failed to remove coupon:", error);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  const isAnyMutating =
    addToCart.isPending ||
    updateCartItem.isPending ||
    removeFromCart.isPending ||
    clearCart.isPending ||
    applyCoupon.isPending ||
    removeCoupon.isPending;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cart Optimistic Updates Demo
          </h1>
          <p className="text-gray-600">
            Demonstrates immediate UI updates with rollback on error
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>

          {/* Network Delay Slider */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Network Delay: {networkDelay}ms
            </label>
            <input
              type="range"
              min="0"
              max="3000"
              step="100"
              value={networkDelay}
              onChange={(e) => setNetworkDelay(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Error Simulation */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="simulateError"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="simulateError" className="text-sm text-gray-700">
              Simulate Errors (to test rollback)
            </label>
          </div>

          {simulateError && (
            <p className="mt-2 text-sm text-red-600">
              ⚠️ Error simulation enabled - all operations will fail and
              rollback
            </p>
          )}
        </div>

        {/* Cart Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Cart Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Items:</span>{" "}
              <span className="font-medium">{cart?.itemCount || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Subtotal:</span>{" "}
              <span className="font-medium">
                {cart?.formattedSubtotal || "₹0"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Discount:</span>{" "}
              <span className="font-medium">
                {cart?.formattedDiscount || "₹0"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>{" "}
              <span className="font-medium">
                {cart?.formattedTotal || "₹0"}
              </span>
            </div>
          </div>
          {cart?.couponCode && (
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Coupon:</span>{" "}
              <span className="font-medium text-green-600">
                {cart.couponCode}
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add to Cart</h2>
          <button
            onClick={handleAddToCart}
            disabled={isAnyMutating}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {addToCart.isPending ? "Adding..." : "Add Sample Product"}
          </button>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Cart Items</h2>
            {cart && cart.items.length > 0 && (
              <button
                onClick={handleClearCart}
                disabled={isAnyMutating}
                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {clearCart.isPending ? "Clearing..." : "Clear Cart"}
              </button>
            )}
          </div>

          {!cart || cart.items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className={`border border-gray-200 rounded-lg p-4 ${
                    item.productName === "Loading..." ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.formattedPrice}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isAnyMutating}
                      className="text-red-600 hover:text-red-700 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {removeFromCart.isPending &&
                      removeFromCart.variables === item.id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={isAnyMutating || !item.canDecrement}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="text-gray-900 font-medium w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={isAnyMutating || !item.canIncrement}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coupon */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Coupon Code</h2>

          {cart?.couponCode ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applied:</p>
                <p className="font-medium text-green-600">{cart.couponCode}</p>
              </div>
              <button
                onClick={handleRemoveCoupon}
                disabled={isAnyMutating}
                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {removeCoupon.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                disabled={isAnyMutating}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={isAnyMutating || !couponCode.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {applyCoupon.isPending ? "Applying..." : "Apply"}
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            How to Test Optimistic Updates:
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Add items to cart - notice immediate UI update</li>
            <li>Increase network delay to see optimistic updates more clearly</li>
            <li>Update quantities - cart totals update immediately</li>
            <li>
              Enable error simulation and try any operation - watch it rollback
            </li>
            <li>Apply/remove coupons - discount updates instantly</li>
            <li>Check browser console for success/error logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
