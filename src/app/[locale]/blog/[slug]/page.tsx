import { blogPostJsonLd, breadcrumbJsonLd } from "@mohasinac/appkit/seo/json-ld";
import { getBlogPostForDetail } from "@mohasinac/appkit";
import { blogPostSlugs, getAttachedCoupons } from "@mohasinac/appkit/server";
import { AttachedCouponsSection } from "@mohasinac/appkit/features/promotions/components/AttachedCouponsSection";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { generateBlogMetadata } from "@/constants/seo.server";
import { BlogPostPageClient } from "./BlogPostPageClient";
import { ShareButtons } from "./ShareButtons";

export const revalidate = 1800;

/**
 * Prerender the 22 published posts so each carries its own `<title>` and
 * `article` metadata in `<head>`. Drafts are excluded by the query, not by
 * `dynamicParams` — an unpublished slug must not be prerendered, but it still
 * resolves on demand and the page's own `notFound()` handles it.
 */
export async function generateStaticParams() {
  return (await blogPostSlugs()).map((slug) => ({ slug }));
}

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

  /*
   * One `getAll`, and no read at all when the post carries no `couponIds` —
   * which is all 21 existing posts. `getBlogPostForDetail` is `React.cache`d
   * and `generateMetadata` already called it, so this page costs one extra
   * round trip only on a post that actually attaches coupons.
   */
  const attachedCoupons = await getAttachedCoupons(post.couponIds);

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
        {/*
          After the article and BEFORE the share buttons. A reader who has
          finished the post is the one most likely to use a code, and the
          share row is the end-of-page affordance — slotting coupons after it
          would put them below what reads as the end.

          Rendered from the SERVER copy of the post, not from
          `BlogPostPageClient`'s own fetch. That client component re-fetches by
          slug, so routing the ids through it would mean the coupon strip
          could not paint until a second round trip had completed, on a page
          that is otherwise ISR-cached HTML.

          The heading is "…you can use", NOT "…mentioned in this post": the
          field attaches coupons to a post, it does not verify the prose names
          them, and the stronger claim would be a lie on the first post where
          an editor attaches a code without writing about it.
        */}
        <AttachedCouponsSection
          coupons={attachedCoupons}
          title="Coupons you can use"
          description="Copy a code and apply it at checkout."
        />
        <ShareButtons title={post.title} />
      </>
    </>
  );
}
