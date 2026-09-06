import type { Metadata } from "next";
import { getLiveItemForDetail, LiveItemDetailPageView } from "@mohasinac/appkit";
import { buildLiveItemMetadata } from "@mohasinac/appkit/server";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { LiveItemActionsClient } from "@/components";
import { SEO_CONFIG } from "@/constants";
import { notFound } from "next/navigation";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveItemForDetail(slug);
  // `siteUrl` is required for a canonical — without it the builder returns
  // `alternates: undefined` and the page ships none. See classified/[slug].
  return buildLiveItemMetadata(product, {
    siteName: SEO_CONFIG.siteName ?? "LetItRip",
    siteUrl: SEO_CONFIG.siteUrl,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getLiveItemForDetail(slug);
  // A record that does not exist must answer 404, not 200. Rendering a
  // "not found" body under a 200 is a soft 404: the URL stays indexable
  // forever and every stale or mistyped link keeps accumulating.
  if (!product) notFound();

  return (
    <>
      <PageViewTracker entityType="live" entityId={slug} url={`/live/${slug}`} />
      <LiveItemDetailPageView
        slug={slug}
        initialProduct={product}
        renderActions={(p) => <LiveItemActionsClient product={p} />}
      />
    </>
  );
}
