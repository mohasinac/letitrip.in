/**
 * SiteCommissionsForm
 *
 * Admin form for configuring platform commission rates and payment method settings.
 * Part of the Site Settings admin panel.
 */

"use client";

import { Heading, Text, Caption, Label, Grid } from "@mohasinac/appkit/ui";
import { Card, FormField, FormGroup } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import type { SiteSettingsDocument } from "@/db/schema";

const { spacing, enhancedCard, typography, themed } = THEME_CONSTANTS;

interface SiteCommissionsFormProps {
  settings: Partial<SiteSettingsDocument>;
  onChange: (updated: Partial<SiteSettingsDocument>) => void;
}

export function SiteCommissionsForm({
  settings,
  onChange,
}: SiteCommissionsFormProps) {
  const t = useTranslations("adminSite");

  const commissions = settings.commissions ?? {
    razorpayFeePercent: 5,
    codDepositPercent: 10,
    sellerShippingFixed: 50,
    platformShippingPercent: 10,
    platformShippingFixedMin: 50,
  };

  const payment = settings.payment ?? {
    razorpayEnabled: true,
    upiManualEnabled: true,
    codEnabled: true,
  };

  const updateCommission = (field: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) return;
    onChange({
      ...settings,
      commissions: { ...commissions, [field]: num },
    });
  };

  const togglePayment = (field: string, value: boolean) => {
    onChange({
      ...settings,
      payment: { ...payment, [field]: value },
    });
  };

  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} className={`${typography.cardTitle} mb-1`}>
          {t("commissionsTitle")}
        </Heading>
        <Text size="sm" variant="secondary" className="mb-4">
          {t("commissionsSubtitle")}
        </Text>

        {/* Info banner — explains purpose of commissions */}
        <div
          className={`mb-6 p-3 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 dark:border-primary/30`}
        >
          <Text size="sm" className="text-primary">
            ℹ {t("commissionsInfoBanner")}
          </Text>
        </div>

        <div className={`${spacing.stack} space-y-6`}>
          {/* Payment method toggles */}
          <div>
            <Caption className="font-semibold mb-3 uppercase tracking-wide">
              {t("paymentMethodsLabel")}
            </Caption>
            <Grid cols={3} gap="3" className="grid-cols-1 sm:grid-cols-3">
              {(
                [
                  ["razorpayEnabled", t("razorpayLabel")],
                  ["upiManualEnabled", t("whatsappPayLabel")],
                  ["codEnabled", t("codLabel")],
                ] as const
              ).map(([field, label]) => (
                <Label
                  key={field}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors mb-0 ${
                    payment[field as keyof typeof payment]
                      ? `border-primary bg-primary/5 dark:bg-primary/10`
                      : `${themed.border} ${themed.bgSecondary}`
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!payment[field as keyof typeof payment]}
                    onChange={(e) => togglePayment(field, e.target.checked)}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <Text size="sm" weight="medium">
                    {label}
                  </Text>
                </Label>
              ))}
            </Grid>
          </div>

          {/* Razorpay fee */}
          <div>
            <Caption className="font-semibold mb-3 uppercase tracking-wide">
              {t("paymentFeesLabel")}
            </Caption>
            <FormGroup columns={2}>
              <FormField
                name="razorpayFeePercent"
                label={t("razorpayFeePercent")}
                type="number"
                value={String(commissions.razorpayFeePercent)}
                onChange={(v) => updateCommission("razorpayFeePercent", v)}
                helpText={t("razorpayFeeHint")}
              />
              <FormField
                name="codDepositPercent"
                label={t("codDepositPercent")}
                type="number"
                value={String(commissions.codDepositPercent)}
                onChange={(v) => updateCommission("codDepositPercent", v)}
                helpText={t("codDepositHint")}
              />
            </FormGroup>
          </div>

          {/* Shipping fees */}
          <div>
            <Caption className="font-semibold mb-3 uppercase tracking-wide">
              {t("shippingFeesLabel")}
            </Caption>
            <FormGroup columns={3}>
              <FormField
                name="sellerShippingFixed"
                label={t("sellerShippingFixed")}
                type="number"
                value={String(commissions.sellerShippingFixed)}
                onChange={(v) => updateCommission("sellerShippingFixed", v)}
                helpText={t("sellerShippingFixedHint")}
              />
              <FormField
                name="platformShippingPercent"
                label={t("platformShippingPercent")}
                type="number"
                value={String(commissions.platformShippingPercent)}
                onChange={(v) => updateCommission("platformShippingPercent", v)}
                helpText={t("platformShippingPercentHint")}
              />
              <FormField
                name="platformShippingFixedMin"
                label={t("platformShippingFixedMin")}
                type="number"
                value={String(commissions.platformShippingFixedMin)}
                onChange={(v) =>
                  updateCommission("platformShippingFixedMin", v)
                }
                helpText={t("platformShippingFixedMinHint")}
              />
            </FormGroup>
            <Text size="xs" variant="secondary" className="mt-2">
              {t("shippingFeeRule")}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
}
