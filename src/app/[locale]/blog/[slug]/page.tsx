import { BlogPostView } from "@mohasinac/appkit";

export const revalidate = 300;

export default function Page({ params }: { params: { slug: string } }) {
  return <BlogPostView slug={params.slug} />;
}
