"use client";

import { useTranslations } from "next-intl";
import { useFeaturedPreOrders } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import type { ProductItem } from "@mohasinac/feat-products";
import { PreOrderCard } from "@/components";
import { SectionCarousel } from "./SectionCarousel";

export function FeaturedPreOrdersSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedPreOrders();

  const preOrders: ProductItem[] = data ?? [];

  // Hide section entirely when there are no pre-orders and not loading
  if (!isLoading && preOrders.length === 0) return null;

  return (
    <SectionCarousel
      title={t("featuredPreOrders")}
      description={t("preOrdersSubtitle")}
      headingVariant="editorial"
      pillLabel={t("preOrdersPill")}
      viewMoreHref={ROUTES.PUBLIC.PRE_ORDERS}
      viewMoreLabel={tActions("viewAllArrow")}
      items={preOrders}
      renderItem={(preOrder) => <PreOrderCard product={preOrder} />}
      perView={{ base: 2, sm: 3, md: 4 }}
      gap={12}
      autoScroll
      autoScrollInterval={4000}
      keyExtractor={(p) => p.id}
      isLoading={isLoading}
      skeletonCount={5}
      className="bg-gradient-to-b from-cobalt/5 dark:from-cobalt/10"
    />
  );
}
