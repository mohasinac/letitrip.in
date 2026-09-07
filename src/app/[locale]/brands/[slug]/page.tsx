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
  // A record that does not exist must render the 404 view - that is what gets it
  // marked noindex. The HTTP STATUS stays 200, and that is Next's documented
  // behaviour rather than a bug: the response is streamed, so headers are already
  // sent by the time notFound() runs and the status can no longer change. Next
  // injects <meta name="robots" content="noindex"> into the streamed HTML
  // instead, and that is what actually keeps the URL out of the index.
  // Before this, the page rendered its OWN "not found" body with no noindex at
  // all - a genuine soft 404 that stayed indexable forever.
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
