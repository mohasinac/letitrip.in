import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupedListingDetailView } from "@mohasinac/appkit/client";
import {
  buildGroupedListingMetadata,
  getGroupedListingWithItems,
  toPublicGroupMembers,
} from "@mohasinac/appkit/server";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { SEO_CONFIG } from "@/constants/seo";

export const revalidate = 3600;

interface PageParams {
  locale: string;
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Shares one React.cache'd fetch with the page below.
  const group = await getGroupedListingWithItems(slug);
  /*
   * 🛑 `SEO_CONFIG.siteUrl`, never a literal — this read the APEX host, which
   * 308-redirects to www, so every group's canonical and og:url pointed at a
   * redirecting URL. One definition of the canonical host (Root Cause #81).
   */
  return buildGroupedListingMetadata(group, {
    siteName: SEO_CONFIG.siteName,
    siteUrl: SEO_CONFIG.siteUrl,
  });
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const group = await getGroupedListingWithItems(slug);
  if (!group) notFound();

  return (
    <>
      <PageViewTracker entityType="grouped-listing" entityId={slug} url={`/groups/${slug}`} />
      <GroupedListingDetailView
        group={group}
        // Allow-list projection — never hand a raw ProductDocument to a Client
        // Component, which publishes every field into the page HTML
        // (§ "Public Data Projections").
        members={toPublicGroupMembers(group.items)}
      />
    </>
  );
}
