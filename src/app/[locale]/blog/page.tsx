import { getTranslations } from "next-intl/server";
import { BlogListView } from "@/features/blog";
import { blogRepository } from "@/repositories";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";
import type { BlogListResponse } from "@mohasinac/feat-blog";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    openGraph: { title, type: "website" },
  };
}

export default async function BlogPage() {
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
