import type { Metadata } from "next";
import { redirect } from "@/i18n/navigation";
import { getCategoryBySlug } from "@mohasinac/appkit";
import { generateCategoryMetadata } from "@/constants";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug).catch(() => null);
  if (!category) return { title: "Category Not Found" };
  return generateCategoryMetadata({
    name: category.name,
    slug: category.slug,
    description: category.description,
    seo: {
      ogImage: category.display?.coverImage,
    },
  });
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  redirect(`/${locale}/categories/${slug}/products/sort/relevance/page/1`);
}
