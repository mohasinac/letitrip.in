"use client";

import { useTranslations } from "next-intl";
import { Button, Card, FormField, Heading, Span, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { DEFAULT_TRUST_BAR_ITEMS } from "@/db/schema";
import type { SiteSettingsDocument, TrustBarItem } from "@/db/schema";

const { spacing, enhancedCard, typography } = THEME_CONSTANTS;

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        variant="ghost"
        size="sm"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full border-2 border-transparent p-0 min-h-0 transition-colors ${
          checked ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-600"
        }`}
      >
        <Span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </Button>
      <Text size="sm">{label}</Text>
    </div>
  );
}

interface FooterConfigFormProps {
  settings: Partial<SiteSettingsDocument>;
  onChange: (updated: Partial<SiteSettingsDocument>) => void;
}

export function FooterConfigForm({
  settings,
  onChange,
}: FooterConfigFormProps) {
  const t = useTranslations("adminNavigation");

  const footerConfig = settings.footerConfig ?? {};
  const trustBar = footerConfig.trustBar ?? {
    enabled: true,
    items: DEFAULT_TRUST_BAR_ITEMS,
  };
  const trustBarEnabled = trustBar.enabled ?? true;
  const items: TrustBarItem[] = trustBar.items ?? DEFAULT_TRUST_BAR_ITEMS;
  const newsletterEnabled = footerConfig.newsletterEnabled ?? true;

  const updateTrustBar = (patch: Partial<typeof trustBar>) => {
    onChange({
      ...settings,
      footerConfig: { ...footerConfig, trustBar: { ...trustBar, ...patch } },
    });
  };

  const updateItem = (index: number, patch: Partial<TrustBarItem>) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    updateTrustBar({ items: updated });
  };

  return (
    <div className={spacing.stack}>
      {/* Trust bar card */}
      <Card className={enhancedCard.base}>
        <div className={spacing.cardPadding}>
          <Heading level={3} className={`${typography.cardTitle} mb-4`}>
            {t("trustBarSection")}
          </Heading>
          <ToggleSwitch
            checked={trustBarEnabled}
            onChange={(v) => updateTrustBar({ enabled: v })}
            label={t("trustBarEnabled")}
          />
          {trustBarEnabled && (
            <div className="mt-5">
              <Text
                size="sm"
                weight="medium"
                className="mb-3 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[11px]"
              >
                {t("trustBarItems")}
              </Text>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[6rem_1fr_auto] items-end gap-3 py-3"
                  >
                    <FormField
                      name={`trustbar-icon-${i}`}
                      label={t("itemIcon")}
                      type="text"
                      value={item.icon}
                      onChange={(v) => updateItem(i, { icon: v })}
                    />
                    <FormField
                      name={`trustbar-label-${i}`}
                      label={t("itemLabel")}
                      type="text"
                      value={item.label}
                      onChange={(v) => updateItem(i, { label: v })}
                    />
                    <div className="pb-2">
                      <ToggleSwitch
                        checked={item.visible}
                        onChange={(v) => updateItem(i, { visible: v })}
                        label={t("itemVisible")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
      {/* Newsletter card */}
      <Card className={enhancedCard.base}>
        <div className={spacing.cardPadding}>
          <Heading level={3} className={`${typography.cardTitle} mb-4`}>
            {t("newsletterSection")}
          </Heading>
          <ToggleSwitch
            checked={newsletterEnabled}
            onChange={(v) =>
              onChange({
                ...settings,
                footerConfig: { ...footerConfig, newsletterEnabled: v },
              })
            }
            label={t("newsletterEnabled")}
          />
        </div>
      </Card>
    </div>
  );
}
