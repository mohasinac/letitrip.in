import type { Metadata } from "next";
import { getLiveItemForDetail, LiveItemDetailPageView } from "@mohasinac/appkit";
import { buildLiveItemMetadata } from "@mohasinac/appkit/server";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { LiveItemActionsClient } from "@/components";
import { SEO_CONFIG } from "@/constants";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveItemForDetail(slug).catch(() => null);
  return buildLiveItemMetadata(product, { siteName: SEO_CONFIG.siteName ?? "LetItRip" });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const product = await getLiveItemForDetail(slug).catch(() => null);

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
