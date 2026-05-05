import type { Metadata } from "next";
import { ProductPageClient } from "./ProductPageClient";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return { title };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
