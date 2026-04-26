import { BlogPostView, BlogCard, getBlogPostBySlug, ROUTES } from "@mohasinac/appkit";
import type { Metadata } from "next";
import { generateBlogMetadata } from "@/constants/seo.server";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

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
  const { slug } = await params;
  return (
    <BlogPostView
      slug={slug}
      renderRelatedCard={(post) => (
        <BlogCard post={post as any} />
      )}
    />
  );
}
