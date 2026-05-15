import type { Metadata } from "next";
import { getClassifiedForDetail, startClassifiedConversationAction } from "@mohasinac/appkit";
import { buildClassifiedMetadata } from "@mohasinac/appkit/server";
import { ClassifiedDetailView } from "@mohasinac/appkit/client";
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

  return (
    <ClassifiedDetailView
      product={product}
      onContactSeller={startClassifiedConversationAction}
    />
  );
}
