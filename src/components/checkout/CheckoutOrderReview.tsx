"use client";

import Image from "next/image";
import type { CartItemDocument, AddressDocument } from "@/db/schema";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed } = THEME_CONSTANTS;

interface CheckoutOrderReviewProps {
  items: CartItemDocument[];
  address: AddressDocument;
  subtotal: number;
  paymentMethod: "cod" | "online";
  onPaymentMethodChange: (method: "cod" | "online") => void;
  onChangeAddress: () => void;
}

export function CheckoutOrderReview({
  items,
  address,
  subtotal,
  paymentMethod,
  onPaymentMethodChange,
  onChangeAddress,
}: CheckoutOrderReviewProps) {
  return (
    <div className="space-y-6">
      {/* Shipping address */}
      <div
        className={`p-4 rounded-xl border ${themed.bgPrimary} ${themed.border}`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${themed.textPrimary}`}>
            {UI_LABELS.CHECKOUT.SHIPPING_TO}
          </h3>
          <button
            onClick={onChangeAddress}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {UI_LABELS.CHECKOUT.CHANGE_ADDRESS}
          </button>
        </div>
        <p className={`text-sm font-medium ${themed.textPrimary}`}>
          {address.fullName}
        </p>
        <p className={`text-sm ${themed.textSecondary}`}>
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>
        <p className={`text-sm ${themed.textSecondary}`}>
          {address.city}, {address.state} — {address.postalCode}
        </p>
        <p className={`text-sm ${themed.textSecondary}`}>{address.phone}</p>
      </div>

      {/* Order items */}
      <div>
        <h3 className={`font-semibold mb-3 ${themed.textPrimary}`}>
          {UI_LABELS.CHECKOUT.ORDER_ITEMS}
        </h3>
        <div className={`rounded-xl border divide-y ${themed.border}`}>
          {items.map((item) => (
            <div key={item.itemId} className="flex items-center gap-3 p-3">
              {item.productImage ? (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={item.productImage}
                    alt={item.productTitle}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ) : (
                <div
                  className={`w-14 h-14 rounded-lg flex-shrink-0 ${themed.bgSecondary}`}
                />
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${themed.textPrimary}`}
                >
                  {item.productTitle}
                </p>
                <p className={`text-xs ${themed.textSecondary}`}>
                  {UI_LABELS.CART.QUANTITY} × {item.quantity}
                </p>
              </div>
              <p
                className={`text-sm font-semibold flex-shrink-0 ${themed.textPrimary}`}
              >
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <h3 className={`font-semibold mb-3 ${themed.textPrimary}`}>
          {UI_LABELS.CHECKOUT.PAYMENT_METHOD}
        </h3>
        <div className="space-y-2">
          {/* Cash on Delivery */}
          <button
            onClick={() => onPaymentMethodChange("cod")}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
              paymentMethod === "cod"
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                : `${themed.border} ${themed.bgPrimary}`
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === "cod" ? "border-indigo-500" : themed.border
                }`}
              >
                {paymentMethod === "cod" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${themed.textPrimary}`}>
                  {UI_LABELS.CHECKOUT.COD}
                </p>
                <p className={`text-xs ${themed.textSecondary}`}>
                  {UI_LABELS.CHECKOUT.PAYMENT_ON_DELIVERY}
                </p>
              </div>
            </div>
          </button>

          {/* Online payment (stub) */}
          <button
            disabled
            className={`w-full text-left px-4 py-3 rounded-xl border-2 opacity-50 cursor-not-allowed ${themed.border} ${themed.bgPrimary}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${themed.border}`}
              />
              <div>
                <p className={`text-sm font-medium ${themed.textPrimary}`}>
                  {UI_LABELS.CHECKOUT.ONLINE_PAYMENT}
                </p>
                <p className={`text-xs ${themed.textSecondary}`}>
                  {UI_LABELS.CHECKOUT.ONLINE_PAYMENT_HINT}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Total */}
      <div
        className={`flex items-center justify-between pt-4 border-t ${themed.border}`}
      >
        <span className={`font-semibold ${themed.textPrimary}`}>
          {UI_LABELS.CHECKOUT.ORDER_TOTAL}
        </span>
        <span className={`text-xl font-bold ${themed.textPrimary}`}>
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
}
