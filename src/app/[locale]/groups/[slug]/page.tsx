import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupedListingDetailView } from "@mohasinac/appkit/client";
import {
  buildGroupedListingMetadata,
  getGroupedListingWithItems,
  toPublicGroupMembers,
} from "@mohasinac/appkit/server";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const revalidate = 120;

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
  return buildGroupedListingMetadata(group, {
    siteName: "LetItRip",
    siteUrl: "https://letitrip.in",
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
