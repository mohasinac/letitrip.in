"use client";

/**
 * BuyRipCoinsModal
 *
 * Fixed-package RipCoin purchase modal. Shows 5 preset packages,
 * then triggers a Razorpay payment flow on selection.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal, Heading, Text, Caption, Button, Badge } from "@/components";
import {
  usePurchaseRipCoins,
  useVerifyRipCoinPurchase,
  useRazorpay,
} from "@/hooks";
import { THEME_CONSTANTS } from "@/constants";
import { RIPCOIN_PACKAGES } from "@/db/schema";

const { spacing, flex, themed } = THEME_CONSTANTS;

interface Props {
  open: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export function BuyRipCoinsModal({ open, onClose, onPurchaseSuccess }: Props) {
  const t = useTranslations("ripcoinsWallet.buy");
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    RIPCOIN_PACKAGES[0].packageId,
  );

  const { mutateAsync: purchaseCoins, isPending: isCreatingOrder } =
    usePurchaseRipCoins();
  const { mutateAsync: verifyPurchase, isPending: isVerifying } =
    useVerifyRipCoinPurchase();
  const { openRazorpay, isLoading: isRazorpayLoading } = useRazorpay();

  const isProcessing = isCreatingOrder || isVerifying || isRazorpayLoading;
  const selectedPkg =
    RIPCOIN_PACKAGES.find((p) => p.packageId === selectedPackageId) ??
    RIPCOIN_PACKAGES[0];

  const handlePay = async () => {
    try {
      const order = await purchaseCoins(selectedPackageId);
      const payment = await openRazorpay({
        key: order.razorpayKeyId,
        amount: order.amountRs * 100,
        currency: order.currency ?? "INR",
        name: "LetItRip",
        description: `${order.totalCoins} RipCoins`,
        order_id: order.razorpayOrderId,
        handler: () => {},
      });
      await verifyPurchase({
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
        packageId: selectedPackageId,
      });
      onPurchaseSuccess?.();
      onClose();
    } catch {
      // errors handled by hook onError callbacks
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={t("title")}>
      <div className={spacing.stack}>
        {/* Package cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {RIPCOIN_PACKAGES.map((pkg) => {
            const isSelected = pkg.packageId === selectedPackageId;
            return (
              <button
                key={pkg.packageId}
                type="button"
                onClick={() => setSelectedPackageId(pkg.packageId)}
                className={[
                  "rounded-xl border-2 p-4 text-left transition-all",
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40"
                    : `${themed.border} hover:border-indigo-300`,
                ].join(" ")}
              >
                <div className={`${flex.between} mb-1`}>
                  <Heading
                    level={4}
                    className="text-indigo-700 dark:text-indigo-300"
                  >
                    {pkg.totalCoins.toLocaleString()} RC
                  </Heading>
                  {pkg.bonusPct > 0 && (
                    <Badge variant="success">+{pkg.bonusPct}%</Badge>
                  )}
                </div>
                <Caption>₹{pkg.priceRs.toLocaleString()}</Caption>
                {pkg.bonusCoins > 0 && (
                  <Caption className="text-xs text-emerald-600 dark:text-emerald-400">
                    {t("bonusNote", { bonus: pkg.bonusCoins })}
                  </Caption>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected summary */}
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-4 flex flex-col gap-1">
          <div className={flex.between}>
            <Caption>{t("coins")}</Caption>
            <Heading level={4} className="text-indigo-600 dark:text-indigo-400">
              {selectedPkg.totalCoins.toLocaleString()} RC
            </Heading>
          </div>
          {selectedPkg.bonusCoins > 0 && (
            <div className={flex.between}>
              <Caption>{t("bonus")}</Caption>
              <Text
                weight="semibold"
                className="text-emerald-600 dark:text-emerald-400"
              >
                +{selectedPkg.bonusCoins.toLocaleString()} RC
              </Text>
            </div>
          )}
          <div
            className={`${flex.between} border-t border-indigo-200 dark:border-indigo-800 pt-1 mt-1`}
          >
            <Caption>{t("amount")}</Caption>
            <Heading level={4}>₹{selectedPkg.priceRs.toLocaleString()}</Heading>
          </div>
        </div>

        <Text className="text-xs text-zinc-500 dark:text-zinc-400">
          {t("infoNote")}
        </Text>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handlePay}
          isLoading={isProcessing}
          disabled={isProcessing}
        >
          {t("payButton", { amount: selectedPkg.priceRs.toLocaleString() })}
        </Button>
      </div>
    </Modal>
  );
}
