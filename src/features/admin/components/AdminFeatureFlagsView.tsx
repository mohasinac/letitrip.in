/**
 * AdminFeatureFlagsView — Thin Adapter
 *
 * Tier 2 — feature component.
 * Admin page to enable/disable platform features globally.
 * Uses appkit AdminFeatureFlagsView shell + letitrip business logic.
 */

"use client";

import { Toggle } from "@mohasinac/appkit/ui";
import { useToast } from "@mohasinac/appkit/ui";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AdminFeatureFlagsView as AppkitAdminFeatureFlagsView } from "@mohasinac/appkit/features/admin";
import { THEME_CONSTANTS } from "@/constants";
import { Heading, Text, Span } from "@mohasinac/appkit/ui";
import { AdminPageHeader, Card } from "@/components";
import { useAdminFeatureFlags } from "../hooks/useAdminFeatureFlags";
import type { SiteSettingsDocument } from "@/db/schema";
import { FEATURE_FLAG_META } from "@/db/schema";

type FeatureFlags = NonNullable<SiteSettingsDocument["featureFlags"]>;
type PaymentSettings = SiteSettingsDocument["payment"];

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  chats: true,
  smsVerification: true,
  translations: true,
  wishlists: true,
  auctions: true,
  reviews: true,
  events: true,
  blog: true,
  coupons: true,
  notifications: true,
  sellerRegistration: true,
  preOrders: false,
};

const DEFAULT_PAYMENT: PaymentSettings = {
  razorpayEnabled: true,
  upiManualEnabled: true,
  codEnabled: true,
};

const { spacing, enhancedCard, themed, typography } = THEME_CONSTANTS;

interface FlagRowProps {
  icon: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function FlagRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: FlagRowProps) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-4 border-b last:border-b-0 ${themed.borderColor}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Span className="text-xl mt-0.5 flex-shrink-0">{icon}</Span>
        <div className="min-w-0">
          <Text
            className={`font-medium ${themed.textPrimary} text-sm sm:text-base`}
          >
            {label}
          </Text>
          <Text
            size="xs"
            variant="secondary"
            className="mt-0.5 leading-relaxed"
          >
            {description}
          </Text>
        </div>
      </div>
      <Toggle
        checked={checked}
        onChange={onChange}
        size="md"
        className="flex-shrink-0 mt-0.5"
      />
    </div>
  );
}

export function AdminFeatureFlagsView() {
  const { showToast } = useToast();
  const t = useTranslations("adminFeatureFlags");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");

  const { data, isLoading, refetch, updateMutation } = useAdminFeatureFlags();

  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(
    DEFAULT_FEATURE_FLAGS,
  );
  const [payment, setPayment] = useState<PaymentSettings>(DEFAULT_PAYMENT);

  useEffect(() => {
    if (data) {
      if (data.featureFlags) {
        setFeatureFlags({ ...DEFAULT_FEATURE_FLAGS, ...data.featureFlags });
      }
      if (data.payment) {
        setPayment(data.payment);
      }
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ featureFlags, payment });
      await refetch();
      showToast(t("settingsSaved"), "success");
    } catch {
      showToast(t("settingsFailed"), "error");
    }
  };

  const isSaving = updateMutation.isPending;

  return (
    <AppkitAdminFeatureFlagsView
      renderHeader={() => (
        <AdminPageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actionLabel={isSaving ? tLoading("saving") : tActions("save")}
          onAction={handleSave}
          actionDisabled={isSaving || isLoading}
        />
      )}
      renderFlags={() => (
        <div className={`${spacing.stack} sm:space-y-6`}>
          {/* Platform Features */}
          <Card className={enhancedCard.base}>
            <div className={spacing.cardPadding}>
              <Heading level={3} className={`${typography.cardTitle} mb-1`}>
                {t("platformFeatures")}
              </Heading>
              <Text size="xs" variant="secondary" className="mb-4">
                {t("platformFeaturesDesc")}
              </Text>

              <div>
                {FEATURE_FLAG_META.filter((m) => m.category === "platform").map(
                  (meta) => (
                    <FlagRow
                      key={meta.key}
                      icon={meta.icon}
                      label={t(meta.labelKey as Parameters<typeof t>[0])}
                      description={t(meta.descKey as Parameters<typeof t>[0])}
                      checked={
                        featureFlags[meta.key] ??
                        DEFAULT_FEATURE_FLAGS[meta.key]
                      }
                      onChange={(val) =>
                        setFeatureFlags((prev) => ({
                          ...prev,
                          [meta.key]: val,
                        }))
                      }
                    />
                  ),
                )}
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className={enhancedCard.base}>
            <div className={spacing.cardPadding}>
              <Heading level={3} className={`${typography.cardTitle} mb-1`}>
                {t("paymentMethods")}
              </Heading>
              <Text size="xs" variant="secondary" className="mb-4">
                {t("paymentMethodsDesc")}
              </Text>

              <div>
                <FlagRow
                  icon="💳"
                  label={t("razorpay")}
                  description={t("razorpayDesc")}
                  checked={payment.razorpayEnabled}
                  onChange={(val) =>
                    setPayment((prev) => ({ ...prev, razorpayEnabled: val }))
                  }
                />
                <FlagRow
                  icon="📲"
                  label={t("upiManual")}
                  description={t("upiManualDesc")}
                  checked={payment.upiManualEnabled}
                  onChange={(val) =>
                    setPayment((prev) => ({ ...prev, upiManualEnabled: val }))
                  }
                />
                <FlagRow
                  icon="💵"
                  label={t("cod")}
                  description={t("codDesc")}
                  checked={payment.codEnabled}
                  onChange={(val) =>
                    setPayment((prev) => ({ ...prev, codEnabled: val }))
                  }
                />
              </div>
            </div>
          </Card>
        </div>
      )}
      isLoading={isLoading}
      className={`${spacing.stack} sm:space-y-6 w-full`}
    />
  );
}
