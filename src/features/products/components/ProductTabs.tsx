"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Li, Ol, Text, Ul, RichText } from "@mohasinac/appkit/ui";
import { proseMirrorToHtml } from "@mohasinac/appkit/utils";
import { SectionTabs } from "@/components";
import type { SectionTab } from "@/components";
import type { ProductItem } from "@mohasinac/appkit/features/products";

interface ProductTabsProps {
  product: ProductItem;
}

type TabKey = "description" | "ingredients" | "howToUse" | "reviews";

/**
 * ProductTabs — pill-group tab nav for product detail content.
 *
 * Tabs:
 * - Description: prose-rendered product description
 * - Ingredients: bullet list from `product.ingredients[]`
 * - How to Use: numbered list from `product.howToUse[]`
 * - Reviews: anchor scroll to `#reviews` (no panel — navigates to reviews section)
 */
export function ProductTabs({ product }: ProductTabsProps) {
  const t = useTranslations("products");
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  const tabs: SectionTab[] = [
    { value: "description", label: t("tabDescription") },
    { value: "ingredients", label: t("tabIngredients") },
    { value: "howToUse", label: t("tabHowToUse") },
    { value: "reviews", label: t("tabReviews") },
  ];

  const handleTabClick = (key: TabKey) => {
    if (key === "reviews") {
      const el = document.getElementById("reviews");
      el?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setActiveTab(key);
  };

  return (
    <div>
      {/* Tab nav */}
      <SectionTabs
        inline
        value={activeTab}
        onChange={(v) => handleTabClick(v as TabKey)}
        tabs={tabs}
      />

      {/* Tab panels */}
      <div className="mt-4">
        {activeTab === "description" && (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <RichText
              html={proseMirrorToHtml(product.description ?? "")}
              copyableCode
              className="text-sm"
            />
          </div>
        )}

        {activeTab === "ingredients" &&
          (product.ingredients?.length ? (
            <Ul className="space-y-1">
              {product.ingredients.map((item, i) => (
                <Li
                  key={i}
                  className="text-sm text-zinc-700 dark:text-zinc-300 list-disc ml-4"
                >
                  {item}
                </Li>
              ))}
            </Ul>
          ) : (
            <Text variant="secondary" size="sm">
              {t("noIngredients")}
            </Text>
          ))}

        {activeTab === "howToUse" &&
          (product.howToUse?.length ? (
            <Ol className="space-y-2 list-decimal ml-4">
              {product.howToUse.map((step, i) => (
                <Li
                  key={i}
                  className="text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {step}
                </Li>
              ))}
            </Ol>
          ) : (
            <Text variant="secondary" size="sm">
              {t("noHowToUse")}
            </Text>
          ))}
      </div>
    </div>
  );
}
