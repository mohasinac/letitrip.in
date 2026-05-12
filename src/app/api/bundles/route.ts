/**
 * Bundles API — SB3-J.
 * GET  /api/bundles  — list (public, status filter)
 * POST /api/bundles  — create (auth: seller/admin)
 */

import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  productRepository,
  successResponse,
  serverLogger,
} from "@mohasinac/appkit";
import { bundlesRepository } from "@mohasinac/appkit/server";
import type { BundleDocument } from "@mohasinac/appkit";

const ALLOWED_STATUS = ["draft", "published", "out_of_stock", "archived"] as const;

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function makeBundleId(title: string): string {
  const slug = slugifyTitle(title) || "bundle";
  const rand = Math.random().toString(36).slice(2, 8);
  return `bundle-${slug}-${rand}`;
}

async function syncReverseRefs(
  bundleId: string,
  bundleTitle: string,
  productIds: string[],
  prevProductIds: string[] = [],
) {
  const removed = prevProductIds.filter((id) => !productIds.includes(id));
  const added = productIds.filter((id) => !prevProductIds.includes(id));
  await Promise.all([
    ...added.map(async (productId) => {
      try {
        const p: any = await productRepository.findById(productId);
        if (!p) return;
        const ids: string[] = Array.from(
          new Set([...(p.partOfBundleIds ?? []), bundleId]),
        );
        const titles: string[] = Array.from(
          new Set([...(p.partOfBundleTitles ?? []), bundleTitle]),
        );
        await productRepository.update(productId, {
          partOfBundleIds: ids,
          partOfBundleTitles: titles,
        } as any);
      } catch (err) {
        serverLogger.warn("Bundle reverse-ref add failed", { productId, bundleId, err });
      }
    }),
    ...removed.map(async (productId) => {
      try {
        const p: any = await productRepository.findById(productId);
        if (!p) return;
        const ids: string[] = (p.partOfBundleIds ?? []).filter(
          (id: string) => id !== bundleId,
        );
        const titles: string[] = (p.partOfBundleTitles ?? []).filter(
          (t: string) => t !== bundleTitle,
        );
        await productRepository.update(productId, {
          partOfBundleIds: ids,
          partOfBundleTitles: titles,
        } as any);
      } catch (err) {
        serverLogger.warn("Bundle reverse-ref remove failed", { productId, bundleId, err });
      }
    }),
  ]);
}

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const storeId = url.searchParams.get("storeId");
      const category = url.searchParams.get("category");
      const featured = url.searchParams.get("featured");

      let items;
      if (storeId) items = await bundlesRepository.findByStore(storeId);
      else if (category) items = await bundlesRepository.findByCategory(category);
      else if (featured === "true") items = await bundlesRepository.findFeatured();
      else items = await bundlesRepository.findAll();

      // Public-facing: drop drafts/archived
      const isPublic = !url.searchParams.has("includeAll");
      const filtered = isPublic
        ? items.filter(
            (b: BundleDocument) =>
              b.status === "published" || b.status === "out_of_stock",
          )
        : items;

      return successResponse({ items: filtered, total: filtered.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ request, user }) => {
      const body: any = await request.json();
      if (!body?.title?.trim()) {
        return Response.json(
          { error: { code: "INVALID_INPUT", message: "title required" } },
          { status: 400 },
        );
      }
      if (
        !Array.isArray(body.bundleItems) ||
        body.bundleItems.length < 3 ||
        body.bundleItems.length > 16
      ) {
        return Response.json(
          {
            error: {
              code: "INVALID_INPUT",
              message: "bundleItems must be 3..16 entries",
            },
          },
          { status: 400 },
        );
      }
      const itemType = body.bundleItems[0]?.listingType;
      if (itemType !== "standard" && itemType !== "pre-order") {
        return Response.json(
          { error: { code: "INVALID_INPUT", message: "invalid bundleItemType" } },
          { status: 400 },
        );
      }
      if (body.bundleItems.some((it: any) => it.listingType !== itemType)) {
        return Response.json(
          {
            error: {
              code: "INVALID_INPUT",
              message: "bundle items must share the same listingType",
            },
          },
          { status: 400 },
        );
      }

      const id = body.id ?? makeBundleId(body.title);
      const productIds = body.bundleItems.map((it: any) => it.productId);
      const status = ALLOWED_STATUS.includes(body.status) ? body.status : "draft";

      const bundle = await bundlesRepository.create({
        ...body,
        id,
        slug: body.slug ?? id,
        status,
        bundleItemType: itemType,
        currency: "INR",
        partOfBundleProductIds: productIds,
        createdBy: user?.uid,
      });

      await syncReverseRefs(id, body.title, productIds, []);

      return successResponse({ bundle });
    },
  }),
);
