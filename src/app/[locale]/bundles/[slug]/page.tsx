import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BundleDetailView } from "@mohasinac/appkit/features/categories/components/BundleDetailView";
import {
  buildBundleMetadata,
  getBundleForDetail,
  listBundleMembers,
  getRelatedBundles,
} from "@mohasinac/appkit/server";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { SEO_CONFIG } from "@/constants/seo";
import { buyBundleAction, addBundleToCartOnlyAction } from "@/actions/bundle.actions";

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
  const bundle = await getBundleForDetail(slug);
  /*
   * 🛑 `SEO_CONFIG.siteUrl`, never a literal.
   *
   * This read `"https://letitrip.in"` — the APEX host, which 308-redirects to
   * www. Every bundle's canonical and og:url therefore pointed at a URL that
   * redirects, which is the exact failure that took the site out of Google in
   * 2026-08 (Root Cause #81): the canonical host has ONE definition, in
   * appkit.config.js, and everything derives from it.
   *
   * `audit-seo-canonical-host.mjs` did not catch this because it scans a
   * fixed six-file list and nothing under `src/app/[locale]/**`.
   */
  return buildBundleMetadata(bundle, {
    siteName: SEO_CONFIG.siteName,
    siteUrl: SEO_CONFIG.siteUrl,
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
