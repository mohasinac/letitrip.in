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
  // A record that does not exist must render the 404 view - that is what gets it
  // marked noindex. The HTTP STATUS stays 200, and that is Next's documented
  // behaviour rather than a bug: the response is streamed, so headers are already
  // sent by the time notFound() runs and the status can no longer change. Next
  // injects <meta name="robots" content="noindex"> into the streamed HTML
  // instead, and that is what actually keeps the URL out of the index.
  // Before this, the page rendered its OWN "not found" body with no noindex at
  // all - a genuine soft 404 that stayed indexable forever.
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
