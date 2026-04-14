/**
 * Promotions Page
 *
 * Route: /promotions
 * SSR: fetches promoted products, featured products, and active coupons
 * from the server for zero-CLS first paint and full SEO indexing.
 */

import type { Metadata } from "next";
import { productRepository, couponsRepository } from "@/repositories";
import { SEO_CONFIG, SITE_CONFIG } from "@/constants";
import { PromotionsView } from "@/features/promotions/components/PromotionsView";
import type { ProductDocument, CouponDocument } from "@/db/schema";
import type { ProductItem } from "@mohasinac/appkit/features/products";
import { nowMs } from "@/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { title, description, keywords } = SEO_CONFIG.pages.promotions;
  return {
    title: `${title} — ${SITE_CONFIG.brand.name}`,
    description,
    keywords: keywords.join(", "),
    openGraph: { title, description },
  };
}

export default async function PromotionsPage() {
  const now = nowMs();

  const [promotedRaw, featuredRaw, couponsRaw] = await Promise.all([
    productRepository.findPromoted().catch(() => [] as ProductDocument[]),
    productRepository.findFeatured().catch(() => [] as ProductDocument[]),
    couponsRepository.getActiveCoupons().catch(() => [] as CouponDocument[]),
  ]);

  const promotedProducts = promotedRaw
    .filter((p) => p.status === "published")
    .slice(0, 12);

  const featuredProducts = featuredRaw
    .filter((p) => p.status === "published")
    .slice(0, 8);

  const activeCoupons = couponsRaw.filter((c) => {
    const startOk =
      !c.validity.startDate || new Date(c.validity.startDate).getTime() <= now;
    const endOk =
      !c.validity.endDate || new Date(c.validity.endDate).getTime() >= now;
    return startOk && endOk;
  });

  return (
    <PromotionsView
      promotedProducts={promotedProducts as unknown as ProductItem[]}
      featuredProducts={featuredProducts as unknown as ProductItem[]}
      activeCoupons={activeCoupons}
    />
  );
}
