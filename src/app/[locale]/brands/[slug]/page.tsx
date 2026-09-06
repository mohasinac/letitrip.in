import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  // A record that does not exist must answer 404, not 200. Rendering a
  // "not found" body under a 200 is a soft 404: the URL stays indexable
  // forever and every stale or mistyped link keeps accumulating.
  if (!initialBrand) notFound();
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
