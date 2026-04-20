import { BlogIndexPageView } from "@mohasinac/appkit/features/blog";

export const revalidate = 120;

export default async function Page() {
  return <BlogIndexPageView />;
}