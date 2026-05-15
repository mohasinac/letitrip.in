import type { Metadata } from "next";
import { getDigitalCodeForDetail } from "@mohasinac/appkit";
import { DigitalCodeDetailView } from "@mohasinac/appkit/client";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getDigitalCodeForDetail(slug).catch(() => null);
  if (!product) return { title: "Digital Code Not Found" };
  return {
    title: product.title,
    description: product.description?.slice(0, 160) ?? "",
  };
}

// Code reveal is wired from the order detail page (where orderId is known),
// not from the product listing page. The view falls back to the
// "return to your order" message when no orderId is provided.
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getDigitalCodeForDetail(slug).catch(() => null);

  return <DigitalCodeDetailView product={product} />;
}
