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
import { resolveLocale } from "@/i18n/resolve-locale";
import { setRequestLocale } from "next-intl/server";
import type {
  PreOrdersListResult,
  PreOrderItem,
} from "@/features/products/hooks/usePreOrders";

export const revalidate = 60;
type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "preOrders" });
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    description: t("subtitle"),
    openGraph: { title, type: "website" },
  };
}

export default async function PreOrdersPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);

  const result = await productRepository
    .list({
      filters: "isPreOrder==true,status==published",
      sorts: "preOrderDeliveryDate",
      page: 1,
      pageSize: 24,
    })
    .catch(() => null);
  const initialData: PreOrdersListResult | undefined = result
    ? {
        items: result.items as unknown as PreOrderItem[],
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      }
    : undefined;

  return <PreOrdersView initialData={initialData} />;
}
