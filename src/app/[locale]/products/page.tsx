import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { productRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import { ProductsView } from "@/features/products";
import type { ProductsListResult } from "@/features/products";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    openGraph: {
      title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
      description: t("metaDescription"),
    },
  };
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const initialData = await productRepository
    .list({
      filters: "status==published,isAuction==false",
      sorts: "-createdAt",
      page: 1,
      pageSize: 24,
    })
    .then(
      (r): ProductsListResult => ({
        items:
          r.items as unknown as import("@mohasinac/feat-products").ProductItem[],
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
