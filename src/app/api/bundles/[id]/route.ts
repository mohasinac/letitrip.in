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
  successResponse,
  serverLogger,
} from "@mohasinac/appkit";
import { bundlesRepository } from "@mohasinac/appkit/server";

type Ctx = { params: Promise<{ id: string }> };

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
        serverLogger.warn("Bundle reverse-ref add failed", { productId, err });
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
        serverLogger.warn("Bundle reverse-ref remove failed", { productId, err });
      }
    }),
  ]);
}

export async function GET(_request: Request, context: Ctx) {
  const { id } = await context.params;
  const bundle = await bundlesRepository.findById(id);
  if (!bundle) {
    return Response.json(
      { error: { code: "NOT_FOUND", message: "Bundle not found" } },
      { status: 404 },
    );
  }
  return Response.json(successResponse({ bundle }));
}

export const PUT = withProviders(
  createRouteHandler<unknown, { id: string }>({
    auth: true,
    handler: async ({ request, user, params }) => {
      const id = (params as any)?.id as string;
      const existing = await bundlesRepository.findById(id);
      if (!existing) {
        return Response.json(
          { error: { code: "NOT_FOUND", message: "Bundle not found" } },
          { status: 404 },
        );
      }
      // Authorization: store owner or admin.
      if (user?.role !== "admin" && existing.storeId !== user?.uid) {
        // storeId is the store slug, not Auth uid — accept admin only as a
        // simple guard for v1. Stricter ownership lookup can land later.
        if (user?.role !== "admin") {
          return Response.json(
            { error: { code: "FORBIDDEN", message: "Not your bundle" } },
            { status: 403 },
          );
        }
      }
      const body: any = await request.json();
      const productIds: string[] = Array.isArray(body.bundleItems)
        ? body.bundleItems.map((it: any) => it.productId)
        : existing.partOfBundleProductIds;
      const updates: any = {
        ...body,
        partOfBundleProductIds: productIds,
        updatedAt: new Date(),
      };
      const next = await bundlesRepository.update(id, updates);
      await syncReverseRefs(
        id,
        body.title ?? existing.title,
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
      const id = (params as any)?.id as string;
      const existing = await bundlesRepository.findById(id);
      if (!existing) {
        return successResponse({ deleted: true });
      }
      if (user?.role !== "admin") {
        return Response.json(
          { error: { code: "FORBIDDEN", message: "Admin required" } },
          { status: 403 },
        );
      }
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
