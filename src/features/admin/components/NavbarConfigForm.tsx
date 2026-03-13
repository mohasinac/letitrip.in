"use client";

import { useTranslations } from "next-intl";
import { Button, Card, Heading, Text } from "@/components";
import { THEME_CONSTANTS, MAIN_NAV_ITEMS } from "@/constants";
import type { SiteSettingsDocument } from "@/db/schema";

const { spacing, enhancedCard, typography } = THEME_CONSTANTS;

type NavKey =
  | "home"
  | "products"
  | "auctions"
  | "preOrders"
  | "categories"
  | "stores"
  | "events"
  | "blog"
  | "reviews";

interface NavbarConfigFormProps {
  settings: Partial<SiteSettingsDocument>;
  onChange: (updated: Partial<SiteSettingsDocument>) => void;
}

export function NavbarConfigForm({
  settings,
  onChange,
}: NavbarConfigFormProps) {
  const t = useTranslations("nav");
  const tAdmin = useTranslations("adminNavigation");

  const hidden = settings.navbarConfig?.hiddenNavItems ?? [];

  const toggle = (key: string) => {
    const next = hidden.includes(key)
      ? hidden.filter((k) => k !== key)
      : [...hidden, key];
    onChange({
      ...settings,
      navbarConfig: { ...settings.navbarConfig, hiddenNavItems: next },
    });
  };

  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} className={`${typography.cardTitle} mb-1`}>
          {tAdmin("navbarSection")}
        </Heading>
        <Text size="sm" variant="secondary" className="mb-4">
          {tAdmin("navbarSectionSubtitle")}
        </Text>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {MAIN_NAV_ITEMS.map((item) => {
            const key = item.key as NavKey;
            const isVisible = !hidden.includes(key);
            return (
              <div key={key} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl" aria-hidden>
                    {item.icon}
                  </span>
                  <Text size="sm" weight="medium">
                    {t(key)}
                  </Text>
                </div>
                <Button
                  type="button"
                  role="switch"
                  aria-checked={isVisible}
                  aria-label={t(key)}
                  variant="ghost"
                  size="sm"
                  onClick={() => toggle(key)}
                  className={`relative h-5 w-9 rounded-full border-2 border-transparent p-0 min-h-0 transition-colors ${
                    isVisible ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                      isVisible ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
