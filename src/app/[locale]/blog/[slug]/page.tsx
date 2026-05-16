import { getBlogPostForDetail, blogPostJsonLd, breadcrumbJsonLd } from "@mohasinac/appkit";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateBlogMetadata } from "@/constants";
import { BlogPostPageClient } from "./BlogPostPageClient";
import { ShareButtons } from "./ShareButtons";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string; locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostForDetail(slug);
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
  const post = await getBlogPostForDetail(slug);
  if (!post) notFound();

  const coverImage = typeof post.coverImage === "string" ? post.coverImage : post.coverImage?.url;

  const ldPost = blogPostJsonLd({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    coverImage,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
    updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
    authorName: post.authorName,
    authorAvatar: post.authorAvatar,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
  });

  const ldBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldPost) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldBreadcrumb) }}
      />
      <>
        <BlogPostPageClient slug={slug} locale={locale} />
        <ShareButtons title={post.title} />
      </>
    </>
  );
}
