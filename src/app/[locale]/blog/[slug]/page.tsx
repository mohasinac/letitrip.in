import { BlogPostView } from "@mohasinac/appkit/features/blog";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostView slug={slug} />;
}