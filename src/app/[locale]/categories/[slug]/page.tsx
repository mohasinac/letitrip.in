import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { categoriesRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import { CategoryProductsView } from "@/features/categories";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await categoriesRepository
    .getCategoryBySlug(slug)
    .catch(() => null);

  if (!category) {
    return { title: `Category — ${SITE_CONFIG.brand.name}` };
  }

  const t = await getTranslations("categories");
  return {
    title: `${category.name} — ${SITE_CONFIG.brand.name}`,
    description:
      category.description ??
      t("categoryMetaDescription", { name: category.name }),
    openGraph: {
      title: `${category.name} — ${SITE_CONFIG.brand.name}`,
      description:
        category.description ??
        t("categoryMetaDescription", { name: category.name }),
      images: category.seo?.ogImage
        ? [{ url: category.seo.ogImage }]
        : category.display?.coverImage
          ? [{ url: category.display.coverImage }]
          : undefined,
    },
  };
}

export default async function CategoryProductsPage({ params }: PageProps) {
  const { slug } = await params;

  const category = await categoriesRepository
    .getCategoryBySlug(slug)
    .catch(() => null);

  if (!category) notFound();

  const children = await categoriesRepository
    .getChildren(category.id)
    .catch(() => []);

  return (
    <CategoryProductsView
      slug={slug}
      initialCategory={category}
      initialChildren={children}
    />
  );
}
