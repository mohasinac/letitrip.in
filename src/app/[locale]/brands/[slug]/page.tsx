import { Suspense } from "react";
import type { Metadata } from "next";
import {
  BrandDetailPageView,
  getBrandForDetail,
  getBrandCategoryForDetail,
} from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandForDetail(slug);
  if (!brand) return { title: "Brand Not Found" };
  return _gm({
    title: `${brand.name} Collectibles — LetItRip`,
    description:
      brand.description?.slice(0, 155) ||
      `Shop authentic ${brand.name} collectibles on LetItRip India.`,
    image: brand.display?.coverImage,
    path: `/brands/${slug}`,
    type: "website",
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const initialBrand = await getBrandCategoryForDetail(slug);
  return (
    <Suspense>
      <BrandDetailPageView slug={slug} initialBrand={initialBrand} />
    </Suspense>
  );
}
