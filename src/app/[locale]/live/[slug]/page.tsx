import type { Metadata } from "next";
import { getLiveItemForDetail } from "@mohasinac/appkit";
import { LiveItemDetailView } from "@mohasinac/appkit/client";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveItemForDetail(slug).catch(() => null);
  if (!product) return { title: "Live Listing Not Found" };
  return {
    title: product.title,
    description: product.description?.slice(0, 160) ?? "",
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getLiveItemForDetail(slug).catch(() => null);

  return <LiveItemDetailView product={product} />;
}
