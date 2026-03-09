import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { productRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import { ProductsView } from "@/features/products";
import type { ProductsListResult } from "@/features/products";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    openGraph: {
      title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
      description: t("metaDescription"),
    },
  };
}

export default async function ProductsPage() {
  const initialData = await productRepository
    .list({
      filters: "status==published,isAuction==false",
      sorts: "-createdAt",
      page: 1,
      pageSize: 24,
    })
    .then(
      (r): ProductsListResult => ({
        items: r.items,
        total: r.total,
        page: r.page,
        pageSize: r.pageSize,
        totalPages: r.totalPages,
        hasMore: r.hasMore,
      }),
    )
    .catch(() => undefined);

  return (
    <Suspense>
      <ProductsView initialData={initialData} />
    </Suspense>
  );
}
