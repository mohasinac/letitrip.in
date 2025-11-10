"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import Toast from "@/components/common/Toast";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    loading,
    isMerging,
    mergeSuccess,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleClearCart = async () => {
    try {
      await clearCart();
      setShowClearDialog(false);
    } catch (error) {
      alert("Failed to clear cart. Please try again.");
    }
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
    try {
      await applyCoupon(code);
    } catch (error) {
      throw error;
    }
  };

  // Show toast when merge succeeds
  useState(() => {
    if (mergeSuccess) {
      setShowToast(true);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">
            {isMerging ? "Merging your cart items..." : "Loading cart..."}
          </p>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
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
      {/* Toast Notification */}
      <Toast
        message="Your cart items have been successfully merged!"
        type="success"
        duration={3000}
        show={showToast && mergeSuccess}
        onClose={() => setShowToast(false)}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>

              {cart.items.length > 0 && (
                <button
                  onClick={() => setShowClearDialog(true)}
                  className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Cart
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
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateItem}
                      onRemove={removeItem}
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
                shipping={cart.shipping}
                tax={cart.tax}
                discount={cart.discount}
                total={cart.total}
                itemCount={cart.itemCount}
                couponCode={cart.couponCode}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={removeCoupon}
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
