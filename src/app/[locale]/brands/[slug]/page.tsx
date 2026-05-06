import type { Metadata } from "next";
import { BrandDetailPageView, getBrandBySlug } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) return { title: "Brand Not Found" };
  return _gm({
    title: `${brand.name} Collectibles — LetiTrip`,
    description:
      brand.description?.slice(0, 155) ||
      `Shop authentic ${brand.name} collectibles on LetiTrip India.`,
    image: brand.logoURL,
    path: `/brands/${slug}`,
    type: "website",
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <BrandDetailPageView slug={slug} />;
}
