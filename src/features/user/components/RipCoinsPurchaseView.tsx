"use client";

/**
 * RipCoinsPurchaseView
 *
 * Full-page view for purchasing RipCoins.
 * Shows 5 fixed packages (100, 500, 1000, 5000, 10000) with bonus badges
 * for 5000 (+5%) and 10000 (+10%). Triggers Razorpay inline.
 */

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, Heading, Text, Caption, Button, Badge } from "@/components";
import {
  usePurchaseRipCoins,
  useVerifyRipCoinPurchase,
  useRazorpay,
} from "@/hooks";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { RIPCOIN_PACKAGES } from "@/db/schema";
import { useRouter } from "@/i18n/navigation";

const { spacing, flex, themed } = THEME_CONSTANTS;

export function RipCoinsPurchaseView() {
  const t = useTranslations("ripcoinsWallet.buy");
  const router = useRouter();
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    RIPCOIN_PACKAGES[2].packageId, // default: 1000 RC
  );
  const [buying, setBuying] = useState(false);

  const { mutateAsync: purchaseCoins } = usePurchaseRipCoins();
  const { mutateAsync: verifyPurchase } = useVerifyRipCoinPurchase();
  const { openRazorpay, isLoading: isRazorpayLoading } = useRazorpay();

  const selectedPkg =
    RIPCOIN_PACKAGES.find((p) => p.packageId === selectedPackageId) ??
    RIPCOIN_PACKAGES[2];

  const isProcessing = buying || isRazorpayLoading;

  const handlePay = async () => {
    setBuying(true);
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
      router.push(ROUTES.USER.RIPCOINS as never);
    } catch {
      // errors handled by hook onError callbacks
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className={`${spacing.stack} max-w-2xl mx-auto`}>
      <div>
        <Heading level={2}>{t("title")}</Heading>
        <Text size="sm" variant="secondary" className="mt-1">
          {t("infoNote")}
        </Text>
      </div>

      {/* ── Package cards grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {RIPCOIN_PACKAGES.map((pkg) => {
          const isSelected = pkg.packageId === selectedPackageId;
          return (
            <button
              key={pkg.packageId}
              type="button"
              onClick={() => setSelectedPackageId(pkg.packageId)}
              className={[
                "rounded-xl border-2 p-5 text-left transition-all w-full",
                isSelected
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-md"
                  : `${themed.border} hover:border-indigo-300 hover:shadow-sm`,
              ].join(" ")}
            >
              <div className={`${flex.between} items-start mb-2`}>
                <Heading
                  level={3}
                  className="text-indigo-700 dark:text-indigo-300"
                >
                  {pkg.totalCoins.toLocaleString()} RC
                </Heading>
                {pkg.bonusPct > 0 && (
                  <Badge variant="success" className="ml-2 shrink-0">
                    +{pkg.bonusPct}% bonus
                  </Badge>
                )}
              </div>

              <Heading level={4} className="text-zinc-800 dark:text-zinc-200">
                ₹{pkg.priceRs.toLocaleString()}
              </Heading>

              {pkg.bonusCoins > 0 ? (
                <Caption className="text-emerald-600 dark:text-emerald-400 mt-1">
                  {t("bonusNote", { bonus: pkg.bonusCoins })}
                </Caption>
              ) : (
                <Caption className="mt-1">
                  {pkg.coins.toLocaleString()} {t("coins")}
                </Caption>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Order summary ──────────────────────────────────────────── */}
      <Card className="p-4">
        <Heading level={4} className="mb-3">
          {t("summary")}
        </Heading>
        <div className="flex flex-col gap-2">
          <div className={flex.between}>
            <Caption>{t("coins")}</Caption>
            <Text
              weight="semibold"
              className="text-indigo-600 dark:text-indigo-400"
            >
              {selectedPkg.coins.toLocaleString()} RC
            </Text>
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
          <div className={`${flex.between} pt-2 border-t ${themed.border}`}>
            <Caption>{t("total")}</Caption>
            <Heading level={4} className="text-indigo-600 dark:text-indigo-400">
              {selectedPkg.totalCoins.toLocaleString()} RC
            </Heading>
          </div>
          <div className={`${flex.between}`}>
            <Caption>{t("amount")}</Caption>
            <Heading level={4}>₹{selectedPkg.priceRs.toLocaleString()}</Heading>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full mt-4"
          onClick={handlePay}
          isLoading={isProcessing}
          disabled={isProcessing}
        >
          {t("payButton", { amount: selectedPkg.priceRs.toLocaleString() })}
        </Button>

        <Button
          variant="ghost"
          size="md"
          className="w-full mt-2"
          onClick={() => router.push(ROUTES.USER.RIPCOINS as never)}
          disabled={isProcessing}
        >
          {t("cancel")}
        </Button>
      </Card>
    </div>
  );
}
