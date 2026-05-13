/**
 * Bundles API — SB3-J.
 * GET  /api/bundles  — list (public, status filter)
 * POST /api/bundles  — create (auth: seller/admin)
 */

import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  productRepository,
  storeRepository,
  successResponse,
  errorResponse,
  serverLogger,
  bundleCreateInputSchema,
  BUNDLE_ITEM_MIN,
  BUNDLE_ITEM_MAX,
} from "@mohasinac/appkit";
import { bundlesRepository } from "@mohasinac/appkit/server";
import type {
  BundleCreateInput,
  BundleDocument,
} from "@mohasinac/appkit";

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
        const p = await productRepository.findById(productId);
        if (!p) return;
        const ids = Array.from(
          new Set([
            ...((p as { partOfBundleIds?: string[] }).partOfBundleIds ?? []),
            bundleId,
          ]),
        );
        const titles = Array.from(
          new Set([
            ...((p as { partOfBundleTitles?: string[] }).partOfBundleTitles ?? []),
            bundleTitle,
          ]),
        );
        await productRepository.update(productId, {
          partOfBundleIds: ids,
          partOfBundleTitles: titles,
        } as never);
      } catch (err) {
        serverLogger.warn("Bundle reverse-ref add failed", { productId, bundleId, err });
      }
    }),
    ...removed.map(async (productId) => {
      try {
        const p = await productRepository.findById(productId);
        if (!p) return;
        const ids = (
          (p as { partOfBundleIds?: string[] }).partOfBundleIds ?? []
        ).filter((id) => id !== bundleId);
        const titles = (
          (p as { partOfBundleTitles?: string[] }).partOfBundleTitles ?? []
        ).filter((t) => t !== bundleTitle);
        await productRepository.update(productId, {
          partOfBundleIds: ids,
          partOfBundleTitles: titles,
        } as never);
      } catch (err) {
        serverLogger.warn("Bundle reverse-ref remove failed", { productId, bundleId, err });
      }
    }),
  ]);
}

/**
 * Verify the caller owns `storeId` (their `ownerId` resolves to the same store)
 * or is an admin. Returns null when authorised; an error response otherwise.
 */
async function assertOwnerOrAdmin(
  user: { uid: string; role?: string } | null | undefined,
  storeId: string,
): Promise<Response | null> {
  if (!user) return errorResponse("Authentication required", 401);
  if (user.role === "admin") return null;
  const ownerStore = await storeRepository.findByOwnerId(user.uid);
  if (!ownerStore || ownerStore.id !== storeId) {
    return errorResponse("Not authorised for this store", 403, {
      code: "FORBIDDEN",
    });
  }
  return null;
}

export const GET = withProviders(
  createRouteHandler({
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const storeId = url.searchParams.get("storeId");
      const category = url.searchParams.get("category");
      const featured = url.searchParams.get("featured");

      let items: BundleDocument[];
      if (storeId) items = await bundlesRepository.findByStore(storeId);
      else if (category) items = await bundlesRepository.findByCategory(category);
      else if (featured === "true") items = await bundlesRepository.findFeatured();
      else items = await bundlesRepository.findAll();

      // Public-facing: drop drafts/archived
      const isPublic = !url.searchParams.has("includeAll");
      const filtered = isPublic
        ? items.filter(
            (b) => b.status === "published" || b.status === "out_of_stock",
          )
        : items;

      return successResponse({ items: filtered, total: filtered.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<BundleCreateInput>({
    auth: true,
    schema: bundleCreateInputSchema,
    handler: async ({ body, user }) => {
      const input = body!;

      const forbidden = await assertOwnerOrAdmin(user, input.storeId);
      if (forbidden) return forbidden;

      // Belt-and-suspenders — schema enforces these but routes are the
      // canonical contract for the public API.
      if (
        input.bundleItems.length < BUNDLE_ITEM_MIN ||
        input.bundleItems.length > BUNDLE_ITEM_MAX
      ) {
        return errorResponse(
          `bundleItems must be ${BUNDLE_ITEM_MIN}..${BUNDLE_ITEM_MAX} entries`,
          400,
          { code: "INVALID_INPUT" },
        );
      }

      const itemType = input.bundleItems[0].listingType;
      const id = input.id ?? makeBundleId(input.title);
      const productIds = input.bundleItems.map((it) => it.productId);

      const bundle = await bundlesRepository.create({
        ...input,
        id,
        slug: input.slug ?? id,
        status: input.status ?? "draft",
        bundleItemType: itemType,
        currency: "INR",
        partOfBundleProductIds: productIds,
        createdBy: user!.uid,
      } as never);

      await syncReverseRefs(id, input.title, productIds, []);

      return successResponse({ bundle });
    },
  }),
);
