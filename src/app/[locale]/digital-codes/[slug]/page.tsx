import type { Metadata } from "next";
import { getDigitalCodeForDetail } from "@mohasinac/appkit";
import { DigitalCodeDetailView } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants/api";

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

async function fetchCode(orderId: string) {
  const res = await fetch(API_ROUTES.ORDERS.CODE(orderId), {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Could not retrieve code");
  const json = (await res.json()) as { data: { code: string; orderId: string; claimedAt?: string; expiresAt?: string } };
  return json.data;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getDigitalCodeForDetail(slug).catch(() => null);

  return (
    <DigitalCodeDetailView
      product={product}
      fetchCode={fetchCode}
    />
  );
}
