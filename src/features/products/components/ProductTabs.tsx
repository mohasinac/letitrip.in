"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Ul, Li, Text } from "@/components";
import type { ProductDocument } from "@/db/schema";

interface ProductTabsProps {
  product: ProductDocument;
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

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: t("tabDescription") },
    { key: "ingredients", label: t("tabIngredients") },
    { key: "howToUse", label: t("tabHowToUse") },
    { key: "reviews", label: t("tabReviews") },
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
      {/* Pill tab nav */}
      <div
        className="rounded-full bg-zinc-100 dark:bg-slate-800 p-1 flex gap-1 overflow-x-auto scrollbar-none"
        role="tablist"
        aria-label={t("tabDescription")}
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            role={key !== "reviews" ? "tab" : undefined}
            aria-selected={key !== "reviews" ? activeTab === key : undefined}
            onClick={() => handleTabClick(key)}
            className={[
              "flex-none rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 whitespace-nowrap",
              activeTab === key && key !== "reviews"
                ? "bg-white dark:bg-slate-700 shadow-sm text-zinc-900 dark:text-white"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="mt-4">
        {activeTab === "description" && (
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            <Text size="sm" className="whitespace-pre-wrap">
              {product.description ?? ""}
            </Text>
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
            <ol className="space-y-2 list-decimal ml-4">
              {product.howToUse.map((step, i) => (
                <li
                  key={i}
                  className="text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {step}
                </li>
              ))}
            </ol>
          ) : (
            <Text variant="secondary" size="sm">
              {t("noHowToUse")}
            </Text>
          ))}
      </div>
    </div>
  );
}
