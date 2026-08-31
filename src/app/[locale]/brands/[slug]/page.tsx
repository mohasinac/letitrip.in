import { Suspense } from "react";
import type { Metadata } from "next";
import {
  BrandDetailPageView,
  getBrandForDetail,
  getBrandCategoryForDetail,
} from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

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
    <>
      {/* A brand is a `categories` document with categoryType:"brand", so it
          counts as a category rather than needing an eleventh entity type. */}
      <PageViewTracker entityType="category" entityId={slug} url={`/brands/${slug}`} />
      <Suspense>
        <BrandDetailPageView slug={slug} initialBrand={initialBrand} />
      </Suspense>
    </>
  );
}
