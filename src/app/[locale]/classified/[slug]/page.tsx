import type { Metadata } from "next";
import { getClassifiedForDetail } from "@mohasinac/appkit";
import { ClassifiedDetailView } from "@mohasinac/appkit/client";
import { startClassifiedConversationAction } from "@mohasinac/appkit";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getClassifiedForDetail(slug).catch(() => null);
  if (!product) return { title: "Listing Not Found" };
  return {
    title: product.title,
    description: product.description?.slice(0, 160) ?? "",
  };
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
