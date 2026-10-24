import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FranchiseDetailPageView } from "@mohasinac/appkit/features/categories/components/FranchiseDetailPageView";
import { franchiseDetailSlugs, getFranchiseForDetail } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const revalidate = 3600;

/**
 * Only the ACTIVE franchises are prerendered — 1 of 8, measured 2026-10-24.
 * The other seven are deliberately `isActive: false` because an unstocked facet
 * "renders as a card in the grid that opens an empty page". Their pages still
 * resolve on demand so `CharacterHotspot`'s `/franchise/*` links land somewhere
 * honest; they are simply not prerendered and not advertised.
 */
export async function generateStaticParams() {
  return (await franchiseDetailSlugs()).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const franchise = await getFranchiseForDetail(slug);
  if (!franchise) return { title: "Franchise Not Found" };
  return _gm({
    title: `${franchise.name} Collectibles — LetItRip`,
    description:
      franchise.description?.slice(0, 155) ||
      `Shop ${franchise.name} collectibles on LetItRip India.`,
    image: franchise.display?.coverImage,
    path: `/franchise/${slug}`,
    type: "website",
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const franchise = await getFranchiseForDetail(slug);
  // A slug with no row renders the 404 view — that is what gets it noindexed.
  // An INACTIVE franchise is NOT a 404: those rows exist precisely so the
  // eighteen CharacterHotspot links resolve, and the view says plainly that we
  // do not stock it yet.
  if (!franchise) notFound();
  return (
    <>
      {/* A franchise is a `categories` document with categoryType:"franchise",
          so it counts as a category rather than needing a new entity type —
          same reasoning as brands. */}
      <PageViewTracker entityType="category" entityId={slug} url={`/franchise/${slug}`} />
      <Suspense>
        <FranchiseDetailPageView slug={slug} franchise={franchise} />
      </Suspense>
    </>
  );
}
