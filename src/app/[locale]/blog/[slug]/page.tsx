import { BlogPostView, BlogCard, getBlogPostBySlug, ROUTES } from "@mohasinac/appkit";
import type { Metadata } from "next";
import Link from "next/link";
import { generateBlogMetadata } from "@/constants/seo.server";
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
      <BlogPostView
        slug={slug}
        renderBackButton={() => (
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-primary transition-colors"
          >
            <span>←</span> Back to Blog
          </Link>
        )}
        renderRelatedCard={(relatedPost) => (
          <BlogCard post={relatedPost as any} />
        )}
      />
      <ShareButtons title={post?.title ?? ""} />
    </div>
  );
}
