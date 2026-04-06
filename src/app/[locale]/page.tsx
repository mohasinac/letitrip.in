import type { Metadata } from "next";
import { generateMetadata as genMetadata, SEO_CONFIG } from "@/constants";
import { HomepageView } from "@/features/homepage";

export const revalidate = 60;

export const metadata: Metadata = genMetadata({
  title: SEO_CONFIG.pages.home.title,
  description: SEO_CONFIG.pages.home.description,
  keywords: [...SEO_CONFIG.pages.home.keywords],
  path: "/",
});

export default async function Page() {
  return <HomepageView />;
}
