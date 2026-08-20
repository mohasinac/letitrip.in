import type { Metadata } from "next";
import { getClassifiedForDetail, ClassifiedDetailPageView } from "@mohasinac/appkit";
import { buildClassifiedMetadata } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getClassifiedForDetail(slug).catch(() => null);
  return buildClassifiedMetadata(product, { siteName: SEO_CONFIG.siteName ?? "LetItRip" });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getClassifiedForDetail(slug).catch(() => null);

  return <ClassifiedDetailPageView slug={slug} initialProduct={product} />;
}
