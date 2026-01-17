"use client";

import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useAuth } from "@/contexts/AuthContext";
import {
  useApplyCoupon,
  useCart,
  useClearCart,
  useRemoveCoupon,
  useRemoveFromCart,
  useUpdateCartItem,
} from "@/hooks/queries/useCart";
import { ConfirmDialog, EmptyState } from "@letitrip/react-library";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();

  // React Query hooks
  const { data: cart, isLoading: loading } = useCart();
  const updateCartItem = useUpdateCartItem({
    onSuccess: () => toast.success("Cart updated"),
    onError: () => toast.error("Failed to update cart"),
  });
  const removeFromCart = useRemoveFromCart({
    onSuccess: () => toast.success("Item removed from cart"),
    onError: () => toast.error("Failed to remove item"),
  });
  const clearCartMutation = useClearCart({
    onSuccess: () => {
      toast.success("Cart cleared");
      setShowClearDialog(false);
    },
    onError: () => toast.error("Failed to clear cart"),
  });
  const applyCouponMutation = useApplyCoupon({
    onSuccess: () => toast.success("Coupon applied"),
    onError: (error) => toast.error(error.message || "Failed to apply coupon"),
  });
  const removeCouponMutation = useRemoveCoupon({
    onSuccess: () => toast.success("Coupon removed"),
    onError: () => toast.error("Failed to remove coupon"),
  });

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleClearCart = () => {
    clearCartMutation.mutate();
  };

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/checkout`);
      return;
    }

    router.push("/checkout");
  };

  const handleApplyCoupon = async (code: string) => {
    applyCouponMutation.mutate(code);
  };

  const handleRemoveCoupon = async () => {
    removeCouponMutation.mutate();
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    updateCartItem.mutate({ itemId, quantity });
  };

  const handleRemoveItem = async (itemId: string) => {
    removeFromCart.mutate(itemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header - Mobile Optimized */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 active:text-gray-700 min-h-[44px] touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            title="Your cart is empty"
            description="Start adding products to your cart to see them here."
            action={{
              label: "Start Shopping",
              onClick: () => router.push("/products"),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Mobile Optimized */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 active:text-gray-700 min-h-[44px] touch-manipulation"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Continue Shopping</span>
                <span className="sm:hidden">Back</span>
              </Link>

              {cart.items.length > 0 && (
                <button
                  onClick={() => setShowClearDialog(true)}
                  className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 active:text-red-800 min-h-[44px] px-2 touch-manipulation"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clear Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h1 className="text-xl font-bold text-gray-900">
                    Shopping Cart ({cart.itemCount}{" "}
                    {cart.itemCount === 1 ? "item" : "items"})
                  </h1>
                </div>

                <div className="px-6">
                  {cart.items.map((item: any) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  You might also like
                </h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-sm text-gray-600 text-center">
                    Product recommendations will appear here
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <CartSummary
                subtotal={cart.subtotal}
                shipping={(cart as any).shipping || 0}
                tax={cart.tax}
                discount={cart.discount}
                total={cart.total}
                itemCount={cart.itemCount}
                couponCode={(cart as any).couponCode}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                onCheckout={handleCheckout}
              />

              {/* Accepted Payments */}
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  We Accept
                </h3>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    UPI
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    Credit Card
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    Debit Card
                  </div>
                  <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                    Net Banking
                  </div>
                </div>
              </div>

              {/* Guest Checkout Notice */}
              {!user && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>New to Letitrip?</strong> Create an account to track
                    your order and enjoy faster checkout next time.
                  </p>
                  <Link
                    href="/register"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Create Account →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">🚚</div>
              <h3 className="font-medium text-gray-900 mb-1">Free Shipping</h3>
              <p className="text-sm text-gray-600">On orders above ₹5,000</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-medium text-gray-900 mb-1">Secure Payment</h3>
              <p className="text-sm text-gray-600">100% secure transactions</p>
            </div>

            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
              <div className="text-2xl mb-2">↩️</div>
              <h3 className="font-medium text-gray-900 mb-1">Easy Returns</h3>
              <p className="text-sm text-gray-600">7-day return policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation */}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        description="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmLabel="Clear Cart"
        variant="danger"
      />
    </>
  );
}
