/**
 * Auctions Listing Page
 *
 * Route: /auctions
 * Thin orchestration layer — all logic in AuctionsView.
 */

import { getTranslations } from "next-intl/server";
import { AuctionsView } from "@/features/products";
import { productRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auctions");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    openGraph: { title, type: "website" },
  };
}

export default async function AuctionsPage() {
  const result = await productRepository
    .list({
      filters: "isAuction==true,status==published",
      sorts: "auctionEndDate",
      page: 1,
      pageSize: 24,
    })
    .catch(() => null);
  const initialData = result
    ? {
        items:
          result.items as unknown as import("@mohasinac/feat-auctions").AuctionItem[],
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      }
    : undefined;
  return <AuctionsView initialData={initialData} />;
}
