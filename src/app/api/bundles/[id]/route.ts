/**
 * Bundles API by id — SB3-J.
 * GET    /api/bundles/[id] — public detail (drops drafts unless owner/admin)
 * PUT    /api/bundles/[id] — update (auth: store owner or admin)
 * DELETE /api/bundles/[id] — delete (auth: store owner or admin)
 */

import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  productRepository,
  storeRepository,
  successResponse,
  errorResponse,
  serverLogger,
  bundleUpdateInputSchema,
} from "@mohasinac/appkit";
import { bundlesRepository } from "@mohasinac/appkit/server";
import type { BundleUpdateInput } from "@mohasinac/appkit";

async function syncReverseRefs(
  bundleId: string,
  bundleTitle: string,
  productIds: string[],
  prevProductIds: string[],
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
 * Verify the caller owns `storeId` (their `ownerId` resolves to the same
 * store) or is an admin. Returns null when authorised; an error response
 * otherwise.
 */
async function assertOwnerOrAdmin(
  user: { uid: string; role?: string } | null | undefined,
  storeId: string,
): Promise<Response | null> {
  if (!user) return errorResponse("Authentication required", 401);
  if (user.role === "admin") return null;
  const ownerStore = await storeRepository.findByOwnerId(user.uid);
  if (!ownerStore || ownerStore.id !== storeId) {
    return errorResponse("Not authorised for this bundle", 403, {
      code: "FORBIDDEN",
    });
  }
  return null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const bundle = await bundlesRepository.findById(id);
  if (!bundle) {
    return errorResponse("Bundle not found", 404, { code: "NOT_FOUND" });
  }
  return successResponse({ bundle });
}

export const PUT = withProviders(
  createRouteHandler<BundleUpdateInput, { id: string }>({
    auth: true,
    schema: bundleUpdateInputSchema,
    handler: async ({ body, user, params }) => {
      const id = (params as { id: string }).id;
      const existing = await bundlesRepository.findById(id);
      if (!existing) {
        return errorResponse("Bundle not found", 404, { code: "NOT_FOUND" });
      }
      const forbidden = await assertOwnerOrAdmin(user, existing.storeId);
      if (forbidden) return forbidden;

      const input = body ?? {};
      const productIds = input.bundleItems
        ? input.bundleItems.map((it) => it.productId)
        : existing.partOfBundleProductIds;
      const updates = {
        ...input,
        partOfBundleProductIds: productIds,
        updatedAt: new Date(),
      };
      const next = await bundlesRepository.update(id, updates as never);
      await syncReverseRefs(
        id,
        input.title ?? existing.title,
        productIds,
        existing.partOfBundleProductIds ?? [],
      );
      return successResponse({ bundle: next });
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler<unknown, { id: string }>({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const existing = await bundlesRepository.findById(id);
      if (!existing) {
        return successResponse({ deleted: true });
      }
      const forbidden = await assertOwnerOrAdmin(user, existing.storeId);
      if (forbidden) return forbidden;

      await bundlesRepository.delete(id);
      await syncReverseRefs(
        id,
        existing.title,
        [],
        existing.partOfBundleProductIds ?? [],
      );
      return successResponse({ deleted: true });
    },
  }),
);
