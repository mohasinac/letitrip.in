import { getBlogPostBySlug } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { generateBlogMetadata } from "@/constants/seo.server";
import { BlogPostPageClient } from "./BlogPostPageClient";
import { ShareButtons } from "./ShareButtons";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) return { title: "Blog Post Not Found" };
  const coverImage =
    typeof post.coverImage === "string" ? post.coverImage : post.coverImage?.url;
  return generateBlogMetadata({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorName: post.authorName,
  });
}

export default async function Page({ params }: Props) {
  const { slug, locale } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);

  return (
    <div>
      <BlogPostPageClient slug={slug} locale={locale} />
      <ShareButtons title={post?.title ?? ""} />
    </div>
  );
}
