import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BundleDetailView } from "@mohasinac/appkit";
import {
  buildBundleMetadata,
  getBundleForDetail,
  listBundleMembers,
  getRelatedBundles,
} from "@mohasinac/appkit/server";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { buyBundleAction, addBundleToCartOnlyAction } from "@/actions/bundle.actions";

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
  const bundle = await getBundleForDetail(slug);
  return buildBundleMetadata(bundle, {
    siteName: "LetItRip",
    siteUrl: "https://letitrip.in",
  });
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const bundle = await getBundleForDetail(slug);
  if (!bundle) notFound();

  const [members, relatedBundles] = await Promise.all([
    listBundleMembers(bundle),
    getRelatedBundles(bundle),
  ]);

  return (
    <>
      <PageViewTracker entityType="bundle" entityId={slug} url={`/bundles/${slug}`} />
      <BundleDetailView
        bundle={bundle}
        members={members}
        onBuyNow={buyBundleAction}
        onAddToCart={addBundleToCartOnlyAction}
        relatedBundles={relatedBundles}
      />
    </>
  );
}
