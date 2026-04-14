"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CartItemDocument, AddressDocument } from "@/db/schema";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import {
  Accordion,
  AccordionItem,
  Caption,
  Li,
  Ol,
  Text,
  Button,
  Span,
  Row,
  Stack,
  Div,
} from "@mohasinac/appkit/ui";
import { MediaImage, Textarea } from "@/components";

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
    <Stack gap="lg">
      <Accordion
        type="multiple"
        defaultValue={[
          "checkout-address",
          "checkout-items",
          "checkout-payment",
        ]}
        className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden"
      >
        <AccordionItem
          value="checkout-address"
          title={
            <Row justify="between" gap="3" className="pr-2">
              <Text className="font-semibold">{t("shippingTo")}</Text>
              <Text size="xs" variant="secondary">
                {address.city}
              </Text>
            </Row>
          }
        >
          <Div className="pt-3">
            <Row justify="between" className={`${flex.between} mb-3`}>
              <Div />
              <Button
                variant="ghost"
                size="sm"
                onClick={onChangeAddress}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {t("changeAddress")}
              </Button>
            </Row>
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
          </Div>
        </AccordionItem>

        <AccordionItem
          value="checkout-items"
          title={
            <Row justify="between" gap="3" className="pr-2">
              <Text className="font-semibold">{t("orderItems")}</Text>
              <Text size="xs" variant="secondary">
                {items.length}
              </Text>
            </Row>
          }
        >
          <Stack gap="sm" className="space-y-3 pt-3">
            {(() => {
              const sellerMap = new Map<
                string,
                { sellerName: string; items: typeof items }
              >();
              for (const item of items) {
                const g = sellerMap.get(item.sellerId);
                if (g) {
                  g.items.push(item);
                } else {
                  sellerMap.set(item.sellerId, {
                    sellerName: item.sellerName,
                    items: [item],
                  });
                }
              }
              return Array.from(sellerMap.entries()).map(
                ([sellerId, { sellerName, items: groupItems }]) => (
                  <Div
                    key={sellerId}
                    className={`rounded-xl border ${themed.border} overflow-hidden`}
                  >
                    {/* Seller header */}
                    <Row gap="sm" className={`flex items-center gap-2 px-3 py-2 border-b ${themed.border} ${themed.bgSecondary}`}>
                      <Span className="text-sm">🏪</Span>
                      <Text size="xs" weight="semibold">
                        {t("soldBy", { name: sellerName })}
                      </Text>
                    </Row>
                    {/* Items */}
                    <Div className={`divide-y ${themed.border}`}>
                      {groupItems.map((item) => (
                        <Row key={item.itemId} className="p-3" gap="3">
                          {item.productImage ? (
                            <Div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-slate-800">
                              <MediaImage
                                src={item.productImage}
                                alt={item.productTitle}
                                size="thumbnail"
                              />
                            </Div>
                          ) : (
                            <Div
                              className={`w-14 h-14 rounded-lg flex-shrink-0 ${themed.bgSecondary}`}
                            />
                          )}
                          <Div className="flex-1 min-w-0">
                            <Text
                              size="sm"
                              weight="medium"
                              className="truncate"
                            >
                              {item.productTitle}
                            </Text>
                            <Text size="xs" variant="secondary">
                              {tCart("quantity")} × {item.quantity}
                            </Text>
                          </Div>
                          <Text
                            size="sm"
                            weight="semibold"
                            className="flex-shrink-0"
                          >
                            {formatCurrency(item.price * item.quantity)}
                          </Text>
                        </Row>
                      ))}
                    </Div>
                  </Div>
                ),
              );
            })()}
          </Stack>
        </AccordionItem>

        <AccordionItem
          value="checkout-payment"
          title={
            <Row justify="between" gap="3" className="pr-2">
              <Text className="font-semibold">{t("paymentMethod")}</Text>
              <Text size="xs" variant="secondary">
                {t(
                  paymentMethod === "cod"
                    ? "cod"
                    : paymentMethod === "online"
                      ? "online"
                      : "upiManual",
                )}
              </Text>
            </Row>
          }
        >
          <Stack gap="xs" className="space-y-2 pt-3">
            {/* Cash on Delivery */}
            <Button
              variant="outline"
              onClick={() => onPaymentMethodChange("cod")}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                paymentMethod === "cod"
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : `${themed.border} ${themed.bgPrimary}`
              }`}
            >
              <Row gap="3">
                <Div
                  className={`w-5 h-5 rounded-full border-2 ${flex.center} flex-shrink-0 ${
                    paymentMethod === "cod" ? "border-primary" : themed.border
                  }`}
                >
                  {paymentMethod === "cod" && (
                    <Div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </Div>
                <Div>
                  <Text size="sm" weight="medium">
                    {t("cod")}
                  </Text>
                  <Text size="xs" variant="secondary">
                    {t("paymentOnDelivery")}
                  </Text>
                </Div>
              </Row>
            </Button>

            {/* Online payment (Razorpay) */}
            <Button
              variant="outline"
              onClick={() => onPaymentMethodChange("online")}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                paymentMethod === "online"
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : `${themed.border} ${themed.bgPrimary}`
              }`}
            >
              <Row gap="3">
                <Div
                  className={`w-5 h-5 rounded-full border-2 ${flex.center} flex-shrink-0 ${
                    paymentMethod === "online"
                      ? "border-primary"
                      : themed.border
                  }`}
                >
                  {paymentMethod === "online" && (
                    <Div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </Div>
                <Div>
                  <Text size="sm" weight="medium">
                    {t("online")}
                  </Text>
                  <Text size="xs" className="text-emerald-600">
                    Powered by Razorpay
                  </Text>
                </Div>
              </Row>
            </Button>

            {/* UPI Manual — only shown when a UPI VPA is configured */}
            {upiVpa && (
              <Div className="space-y-0">
                <Button
                  variant="outline"
                  onClick={() => onPaymentMethodChange("upi_manual")}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    paymentMethod === "upi_manual"
                      ? "border-primary bg-primary/5 dark:bg-primary/10 rounded-b-none border-b-0"
                      : `${themed.border} ${themed.bgPrimary}`
                  }`}
                >
                  <Row gap="3">
                    <Div
                      className={`w-5 h-5 rounded-full border-2 ${flex.center} flex-shrink-0 ${
                        paymentMethod === "upi_manual"
                          ? "border-primary"
                          : themed.border
                      }`}
                    >
                      {paymentMethod === "upi_manual" && (
                        <Div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </Div>
                    <Div>
                      <Text size="sm" weight="medium">
                        {t("upiManual")}
                      </Text>
                      <Text size="xs" variant="secondary">
                        {t("upiManualDesc")}
                      </Text>
                    </Div>
                    {/* UPI app logos */}
                    <Span
                      className="ml-auto text-xs font-medium text-violet-600 dark:text-violet-400"
                      variant="inherit"
                    >
                      PhonePe · GPay · Paytm
                    </Span>
                  </Row>
                </Button>

                {/* Expanded UPI instructions panel */}
                {paymentMethod === "upi_manual" && (
                  <Stack gap="md" className={`px-4 py-4 rounded-b-xl border-2 border-t-0 border-primary bg-primary/5 dark:bg-primary/10 ${spacing.stack}`}>
                    {/* UPI ID display + copy */}
                    <Row gap="sm" className={`flex items-center gap-3 p-3 rounded-lg border ${themed.border} ${themed.bgPrimary}`}>
                      <Div className="flex-1 min-w-0">
                        <Caption>{t("upiId")}</Caption>
                        <Text
                          weight="semibold"
                          className="text-lg tracking-wide font-mono"
                        >
                          {upiVpa}
                        </Text>
                      </Div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyUpiId}
                        className="flex-shrink-0"
                      >
                        {upiCopied ? t("upiIdCopied") : t("copyUpiId")}
                      </Button>
                    </Row>

                    {/* Steps */}
                    <Div>
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
                              className={`flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs ${flex.center} font-bold mt-0.5`}
                              variant="inherit"
                            >
                              {i + 1}
                            </Span>
                            <Caption>{step}</Caption>
                          </Li>
                        ))}
                      </Ol>
                    </Div>

                    <Text
                      size="xs"
                      className="text-amber-700 dark:text-amber-400"
                    >
                      ⚠ {t("upiPaymentNote")}
                    </Text>
                  </Stack>
                )}
              </Div>
            )}
          </Stack>
        </AccordionItem>

        <AccordionItem
          value="checkout-notes"
          title={<Text className="font-semibold">{t("sellerNotesLabel")}</Text>}
        >
          <Div className="pt-3">
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
          </Div>
        </AccordionItem>

        <AccordionItem
          value="checkout-summary"
          title={<Text className="font-semibold">{t("orderSummary")}</Text>}
        >
          <Div className="pt-3">
            <Div
              className={`p-3 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 dark:border-primary/30 mb-4`}
            >
              <Text size="xs" className="text-primary">
                ℹ️ {t("commissionInfoNote")}
              </Text>
            </Div>

            <Stack gap="xs" className={`space-y-2 pt-1 border-t ${themed.border}`}>
              <Row justify="between" className={flex.between}>
                <Text size="sm" variant="secondary">
                  {t("subtotal")}
                </Text>
                <Text size="sm">{formatCurrency(subtotal)}</Text>
              </Row>
              {shippingFee > 0 && (
                <Row justify="between" className={flex.between}>
                  <Text size="sm" variant="secondary">
                    {t("shippingFee")}
                  </Text>
                  <Text size="sm">{formatCurrency(shippingFee)}</Text>
                </Row>
              )}
              {paymentMethod === "online" && platformFee > 0 && (
                <Row justify="between" className={flex.between}>
                  <Div>
                    <Text size="sm" variant="secondary">
                      {t("razorpayFeeLabel")}
                    </Text>
                    <Caption className="text-amber-600 dark:text-amber-400">
                      {t("razorpayFeeNote")}
                    </Caption>
                  </Div>
                  <Text
                    size="sm"
                    className="text-amber-600 dark:text-amber-400"
                  >
                    +{formatCurrency(platformFee)}
                  </Text>
                </Row>
              )}
              {(paymentMethod === "cod" || paymentMethod === "upi_manual") &&
                depositAmount != null && (
                  <Stack gap="xs" className="space-y-1">
                    <Row justify="between" className={flex.between}>
                      <Text size="sm" variant="secondary">
                        {t("codDepositLabel")}
                      </Text>
                      <Text
                        size="sm"
                        className="text-orange-600 dark:text-orange-400"
                      >
                        {formatCurrency(depositAmount)} {t("codDepositNow")}
                      </Text>
                    </Row>
                    <Row justify="between" className={flex.between}>
                      <Text size="sm" variant="secondary">
                        {t("codRemainingLabel")}
                      </Text>
                      <Text size="sm">
                        {formatCurrency(subtotal + shippingFee - depositAmount)}{" "}
                        {t("codRemainingOnDelivery")}
                      </Text>
                    </Row>
                    <Text
                      size="xs"
                      className="text-amber-600 dark:text-amber-400"
                    >
                      ⚠ {t("codDepositNote")}
                    </Text>
                  </Stack>
                )}
              <Row
                justify="between"
                className={`${flex.between} pt-2 border-t ${themed.border}`}
              >
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
              </Row>
            </Stack>
          </Div>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
}
