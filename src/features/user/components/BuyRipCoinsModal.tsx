"use client";

/**
 * BuyRipCoinsModal
 *
 * Lets the user choose a pack size (1–500 packs), shows the cost in ₹,
 * then triggers a Razorpay payment flow. On success, verification is done
 * via POST /api/ripcoins/purchase/verify, and the balance is refreshed.
 *
 * Economy:
 *   1 pack = 10 RipCoins = ₹1
 *   Min: 10 packs (100 RC / ₹10)
 *   Max: 500 packs (5000 RC / ₹500)
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal, Heading, Text, Caption, Button, Slider } from "@/components";
import {
  usePurchaseRipCoins,
  useVerifyRipCoinPurchase,
  useRazorpay,
} from "@/hooks";
import { THEME_CONSTANTS } from "@/constants";

const { spacing, flex } = THEME_CONSTANTS;

const MIN_PACKS = 10;
const MAX_PACKS = 500;
const COINS_PER_PACK = 10;
const PRICE_PER_PACK_RS = 1;

interface Props {
  open: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export function BuyRipCoinsModal({ open, onClose, onPurchaseSuccess }: Props) {
  const t = useTranslations("ripcoinsWallet.buy");
  const [packs, setPacks] = useState<number>(MIN_PACKS);
  const coins = packs * COINS_PER_PACK;
  const amountRs = packs * PRICE_PER_PACK_RS;

  const { mutate: purchaseCoins, isLoading: isCreatingOrder } =
    usePurchaseRipCoins();
  const { mutate: verifyPurchase, isLoading: isVerifying } =
    useVerifyRipCoinPurchase();
  const { openRazorpay, isLoading: isRazorpayLoading } = useRazorpay();

  const isProcessing = isCreatingOrder || isVerifying || isRazorpayLoading;

  const handlePay = async () => {
    try {
      // Step 1 — create Razorpay order
      const order = await purchaseCoins(packs);

      // Step 2 — open Razorpay modal
      const payment = await openRazorpay({
        key: order.razorpayKeyId,
        amount: order.amountRs * 100, // paise
        currency: order.currency ?? "INR",
        name: "LetItRip",
        description: `${coins} RipCoins`,
        order_id: order.razorpayOrderId,
        handler: () => {},
      });

      // Step 3 — verify on server
      await verifyPurchase({
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: payment.razorpay_payment_id,
        razorpaySignature: payment.razorpay_signature,
        packs,
      });

      onPurchaseSuccess?.();
      onClose();
    } catch {
      // errors handled by hook's onError callbacks
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={t("title")}>
      <div className={spacing.stack}>
        {/* Pack selector */}
        <div>
          <Text weight="medium" className="mb-1">
            {t("packsLabel")}
          </Text>
          <Slider
            min={MIN_PACKS}
            max={MAX_PACKS}
            step={MIN_PACKS}
            value={packs}
            onChange={(v) => setPacks(v)}
          />
          <div className="flex justify-between mt-1">
            <Caption>{MIN_PACKS} packs</Caption>
            <Caption>{MAX_PACKS} packs</Caption>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 p-4 flex flex-col gap-1">
          <div className={flex.between}>
            <Caption>{t("packs")}</Caption>
            <Text weight="semibold">{packs}</Text>
          </div>
          <div className={flex.between}>
            <Caption>{t("coins")}</Caption>
            <Heading level={4} className="text-indigo-600 dark:text-indigo-400">
              {coins.toLocaleString()} RC
            </Heading>
          </div>
          <div
            className={`${flex.between} border-t border-indigo-200 dark:border-indigo-800 pt-1 mt-1`}
          >
            <Caption>{t("amount")}</Caption>
            <Heading level={4}>₹{amountRs.toFixed(2)}</Heading>
          </div>
        </div>

        <Text className="text-xs text-gray-500 dark:text-gray-400">
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
          {t("payButton", { amount: amountRs.toFixed(2) })}
        </Button>
      </div>
    </Modal>
  );
}
