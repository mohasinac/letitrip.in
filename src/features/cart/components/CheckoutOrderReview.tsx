"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CartItemDocument, AddressDocument } from "@/db/schema";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import {
  Heading,
  Text,
  Span,
  Button,
  Caption,
  MediaImage,
  Ol,
  Li,
  Textarea,
} from "@/components";

const { themed, flex, spacing } = THEME_CONSTANTS;

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
  /** Platform fee (e.g. Razorpay 5%) — read from create-order response */
  platformFee?: number;
  /** Shipping fee for this checkout */
  shippingFee?: number;
  /** COD deposit amount (10% of subtotal) */
  depositAmount?: number;
  /** Notes for the seller */
  notes: string;
  onNotesChange: (notes: string) => void;
}

export function CheckoutOrderReview({
  items,
  address,
  subtotal,
  paymentMethod,
  onPaymentMethodChange,
  onChangeAddress,
  upiVpa,
  platformFee = 0,
  shippingFee = 0,
  depositAmount,
  notes,
  onNotesChange,
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
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-slate-800">
                  <MediaImage
                    src={item.productImage}
                    alt={item.productTitle}
                    size="thumbnail"
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
                  className={`px-4 py-4 rounded-b-xl border-2 border-t-0 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 ${spacing.stack}`}
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
                            className={`flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600 text-white text-xs ${flex.center} font-bold mt-0.5`}
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

      {/* Commission info banner */}
      <div
        className={`p-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800`}
      >
        <Text size="xs" className="text-blue-700 dark:text-blue-300">
          ℹ️ {t("commissionInfoNote")}
        </Text>
      </div>

      {/* Order notes per seller */}
      <div>
        <Heading level={3} className="font-semibold mb-2">
          {t("sellerNotesLabel")}
        </Heading>
        <Textarea
          name="sellerNotes"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t("sellerNotesPlaceholder")}
          rows={2}
          maxLength={500}
          className={`w-full text-sm rounded-xl border px-3 py-2 ${themed.border} ${themed.bgPrimary}`}
        />
        <Caption className="mt-1">{t("sellerNotesHint")}</Caption>
      </div>

      {/* Order summary with fee breakdown */}
      <div className={`space-y-2 pt-4 border-t ${themed.border}`}>
        <div className={flex.between}>
          <Text size="sm" variant="secondary">
            {t("subtotal")}
          </Text>
          <Text size="sm">{formatCurrency(subtotal)}</Text>
        </div>
        {shippingFee > 0 && (
          <div className={flex.between}>
            <Text size="sm" variant="secondary">
              {t("shippingFee")}
            </Text>
            <Text size="sm">{formatCurrency(shippingFee)}</Text>
          </div>
        )}
        {paymentMethod === "online" && platformFee > 0 && (
          <div className={flex.between}>
            <div>
              <Text size="sm" variant="secondary">
                {t("razorpayFeeLabel")}
              </Text>
              <Caption className="text-amber-600 dark:text-amber-400">
                {t("razorpayFeeNote")}
              </Caption>
            </div>
            <Text size="sm" className="text-amber-600 dark:text-amber-400">
              +{formatCurrency(platformFee)}
            </Text>
          </div>
        )}
        {(paymentMethod === "cod" || paymentMethod === "upi_manual") &&
          depositAmount != null && (
            <div className="space-y-1">
              <div className={flex.between}>
                <Text size="sm" variant="secondary">
                  {t("codDepositLabel")}
                </Text>
                <Text
                  size="sm"
                  className="text-orange-600 dark:text-orange-400"
                >
                  {formatCurrency(depositAmount)} {t("codDepositNow")}
                </Text>
              </div>
              <div className={flex.between}>
                <Text size="sm" variant="secondary">
                  {t("codRemainingLabel")}
                </Text>
                <Text size="sm">
                  {formatCurrency(subtotal + shippingFee - depositAmount)}{" "}
                  {t("codRemainingOnDelivery")}
                </Text>
              </div>
              <Text size="xs" className="text-amber-600 dark:text-amber-400">
                ⚠ {t("codDepositNote")}
              </Text>
            </div>
          )}
        <div className={`${flex.between} pt-2 border-t ${themed.border}`}>
          <Span weight="semibold" variant="primary">
            {t("orderTotal")}
          </Span>
          <Span className="text-xl font-bold" variant="primary">
            {formatCurrency(
              subtotal +
                shippingFee +
                (paymentMethod === "online" ? platformFee : 0),
            )}
          </Span>
        </div>
      </div>
    </div>
  );
}
