import { getTranslations } from "next-intl/server";
import { BlogListView } from "@/features/blog";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("blog");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    openGraph: { title, type: "website" },
  };
}

export default function BlogPage() {
  return <BlogListView />;
}
