import type { Metadata } from "next";
import { FAQPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return _gm({
    title: `${label} FAQs — LetItRip Help`,
    description: `Common questions about ${label.toLowerCase()} on LetItRip collectibles marketplace.`,
    path: `/faqs/${category}`,
  });
}

export default async function Page({ params }: Props) {
  const { category } = await params;
  return <FAQPageView category={category} />;
}
