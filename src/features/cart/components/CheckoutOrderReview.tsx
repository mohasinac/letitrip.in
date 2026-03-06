"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CartItemDocument, AddressDocument } from "@/db/schema";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { Heading, Text, Span, Button, Caption, Ol, Li } from "@/components";

const { themed, flex } = THEME_CONSTANTS;

export type CheckoutPaymentMethod = "cod" | "online" | "upi_manual";

interface CheckoutOrderReviewProps {
  items: CartItemDocument[];
  address: AddressDocument;
  subtotal: number;
  paymentMethod: CheckoutPaymentMethod;
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void;
  onChangeAddress: () => void;
  /** Business UPI Virtual Payment Address from site settings */
  upiVpa?: string;
}

export function CheckoutOrderReview({
  items,
  address,
  subtotal,
  paymentMethod,
  onPaymentMethodChange,
  onChangeAddress,
  upiVpa,
}: CheckoutOrderReviewProps) {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const [upiCopied, setUpiCopied] = useState(false);

  const handleCopyUpiId = () => {
    if (!upiVpa) return;
    navigator.clipboard.writeText(upiVpa).then(() => {
      setUpiCopied(true);
      setTimeout(() => setUpiCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Shipping address */}
      <div
        className={`p-4 rounded-xl border ${themed.bgPrimary} ${themed.border}`}
      >
        <div className={`${flex.between} mb-3`}>
          <Heading level={3} className="font-semibold">
            {t("shippingTo")}
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangeAddress}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {t("changeAddress")}
          </Button>
        </div>
        <Text size="sm" weight="medium">
          {address.fullName}
        </Text>
        <Text size="sm" variant="secondary">
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </Text>
        <Text size="sm" variant="secondary">
          {address.city}, {address.state} — {address.postalCode}
        </Text>
        <Text size="sm" variant="secondary">
          {address.phone}
        </Text>
      </div>

      {/* Order items */}
      <div>
        <Heading level={3} className="font-semibold mb-3">
          {t("orderItems")}
        </Heading>
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
                <Text size="sm" weight="medium" className="truncate">
                  {item.productTitle}
                </Text>
                <Text size="xs" variant="secondary">
                  {tCart("quantity")} × {item.quantity}
                </Text>
              </div>
              <Text size="sm" weight="semibold" className="flex-shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </div>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div>
        <Heading level={3} className="font-semibold mb-3">
          {t("paymentMethod")}
        </Heading>
        <div className="space-y-2">
          {/* Cash on Delivery */}
          <Button
            variant="outline"
            onClick={() => onPaymentMethodChange("cod")}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
              paymentMethod === "cod"
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                : `${themed.border} ${themed.bgPrimary}`
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 ${flex.center} flex-shrink-0 ${
                  paymentMethod === "cod" ? "border-indigo-500" : themed.border
                }`}
              >
                {paymentMethod === "cod" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                )}
              </div>
              <div>
                <Text size="sm" weight="medium">
                  {t("cod")}
                </Text>
                <Text size="xs" variant="secondary">
                  {t("paymentOnDelivery")}
                </Text>
              </div>
            </div>
          </Button>

          {/* Online payment (Razorpay) */}
          <Button
            variant="outline"
            onClick={() => onPaymentMethodChange("online")}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
              paymentMethod === "online"
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                : `${themed.border} ${themed.bgPrimary}`
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 ${flex.center} flex-shrink-0 ${
                  paymentMethod === "online"
                    ? "border-indigo-500"
                    : themed.border
                }`}
              >
                {paymentMethod === "online" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                )}
              </div>
              <div>
                <Text size="sm" weight="medium">
                  {t("online")}
                </Text>
                <Text size="xs" className="text-emerald-600">
                  Powered by Razorpay
                </Text>
              </div>
            </div>
          </Button>

          {/* UPI Manual — only shown when a UPI VPA is configured */}
          {upiVpa && (
            <div className="space-y-0">
              <Button
                variant="outline"
                onClick={() => onPaymentMethodChange("upi_manual")}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                  paymentMethod === "upi_manual"
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 rounded-b-none border-b-0"
                    : `${themed.border} ${themed.bgPrimary}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${flex.center} flex-shrink-0 ${
                      paymentMethod === "upi_manual"
                        ? "border-indigo-500"
                        : themed.border
                    }`}
                  >
                    {paymentMethod === "upi_manual" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  <div>
                    <Text size="sm" weight="medium">
                      {t("upiManual")}
                    </Text>
                    <Text size="xs" variant="secondary">
                      {t("upiManualDesc")}
                    </Text>
                  </div>
                  {/* UPI app logos */}
                  <Span
                    className="ml-auto text-xs font-medium text-violet-600 dark:text-violet-400"
                    variant="inherit"
                  >
                    PhonePe · GPay · Paytm
                  </Span>
                </div>
              </Button>

              {/* Expanded UPI instructions panel */}
              {paymentMethod === "upi_manual" && (
                <div
                  className={`px-4 py-4 rounded-b-xl border-2 border-t-0 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 space-y-4`}
                >
                  {/* UPI ID display + copy */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg border ${themed.border} ${themed.bgPrimary}`}
                  >
                    <div className="flex-1 min-w-0">
                      <Caption>{t("upiId")}</Caption>
                      <Text
                        weight="semibold"
                        className="text-lg tracking-wide font-mono"
                      >
                        {upiVpa}
                      </Text>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCopyUpiId}
                      className="flex-shrink-0"
                    >
                      {upiCopied ? t("upiIdCopied") : t("copyUpiId")}
                    </Button>
                  </div>

                  {/* Steps */}
                  <div>
                    <Caption className="font-medium mb-2">
                      {t("upiInstructions")}
                    </Caption>
                    <Ol className="space-y-1 list-none">
                      {[
                        t("upiStep1"),
                        t("upiStep2", { amount: formatCurrency(subtotal) }),
                        t("upiStep3"),
                      ].map((step, i) => (
                        <Li key={i} className="flex items-start gap-2">
                          <Span
                            className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold mt-0.5"
                            variant="inherit"
                          >
                            {i + 1}
                          </Span>
                          <Caption>{step}</Caption>
                        </Li>
                      ))}
                    </Ol>
                  </div>

                  {/* Note */}
                  <Text
                    size="xs"
                    className="text-amber-700 dark:text-amber-400"
                  >
                    ⚠ {t("upiPaymentNote")}
                  </Text>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      <div className={`${flex.between} pt-4 border-t ${themed.border}`}>
        <Span weight="semibold" variant="primary">
          {t("orderTotal")}
        </Span>
        <Span className="text-xl font-bold" variant="primary">
          {formatCurrency(subtotal)}
        </Span>
      </div>
    </div>
  );
}
