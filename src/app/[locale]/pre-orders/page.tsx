/**
 * Pre-Orders Listing Page
 *
 * Route: /pre-orders
 * Thin orchestration layer — all logic in PreOrdersView.
 */

import { getTranslations } from "next-intl/server";
import { PreOrdersView } from "@/features/products";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";
import { productRepository } from "@/repositories";
import type {
  PreOrdersListResult,
  PreOrderItem,
} from "@/features/products/hooks/usePreOrders";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("preOrders");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    description: t("subtitle"),
    openGraph: { title, type: "website" },
  };
}

export default async function PreOrdersPage() {
  const result = await productRepository.list({
    filters: "isPreOrder==true,status==published",
    sorts: "preOrderDeliveryDate",
    page: 1,
    pageSize: 24,
  });
  const initialData: PreOrdersListResult = {
    items: result.items as unknown as PreOrderItem[],
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
    hasMore: result.hasMore,
  };

  return <PreOrdersView initialData={initialData} />;
}
