import { notFound } from "next/navigation";
import { blogRepository } from "@/repositories";
import { BlogPostView } from "@/features/blog/components";
import type { Metadata } from "next";
import type { BlogPostDetailResponse } from "@mohasinac/appkit/features/blog/server";
import { getMediaUrl } from "@mohasinac/appkit/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogRepository.findBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: getMediaUrl(post.coverImage) ? [getMediaUrl(post.coverImage)!] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await blogRepository.findBySlug(slug);
  if (!post) notFound();

  const related = await blogRepository.findRelated(post.category, post.id, 3);

  const serialize = (p: typeof post) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  });

  const initialData: BlogPostDetailResponse = {
    post: serialize(post),
    related: related.map(serialize),
  };

  return <BlogPostView slug={slug} initialData={initialData} />;
}
