import { getTranslations, setRequestLocale } from "next-intl/server";
import { BlogListView } from "@/features/blog/components";
import { blogRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";
import type { BlogListResponse } from "@mohasinac/appkit/features/blog";
import { resolveLocale } from "@/i18n/resolve-locale";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: "blog" });
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    openGraph: { title, type: "website" },
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);
  const result = await blogRepository
    .listPublished({}, { sorts: "-publishedAt", page: 1, pageSize: 24 })
    .catch(() => null);
  const initialData: BlogListResponse | undefined = result
    ? {
        posts: result.items.map((p) => ({
          ...p,
          publishedAt: p.publishedAt?.toISOString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt?.toISOString(),
        })),
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          hasMore: result.page < result.totalPages,
        },
      }
    : undefined;
  return <BlogListView initialData={initialData} />;
}
