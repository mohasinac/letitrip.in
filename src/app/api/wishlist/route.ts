import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productRepository,
} from "@mohasinac/appkit";
import { wishlistRepository } from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;
      const wishlistItems = await wishlistRepository.getWishlistItems(uid);

      if (wishlistItems.length === 0) {
        return successResponse({ items: [], total: 0 });
      }

      // Batch-enrich with product details
      const productIds = wishlistItems.map((i) => i.productId);
      const products = await Promise.all(
        productIds.map((id) => productRepository.findById(id).catch(() => null)),
      );

      const items = wishlistItems.map((item, idx) => {
        const product = products[idx];
        return {
          id: `${uid}-${item.productId}`,
          userId: uid,
          productId: item.productId,
          productTitle: product?.title ?? undefined,
          productImage: product?.mainImage ?? undefined,
          productPrice: product?.price ?? undefined,
          productCurrency: product?.currency ?? "INR",
          productSlug: product?.slug ?? item.productId,
          productStatus: product?.status ?? "published",
          addedAt: item.addedAt instanceof Date
            ? item.addedAt.toISOString()
            : String(item.addedAt),
        };
      });

      return successResponse({ items, total: items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const body = await request.json().catch(() => ({}));
      const { productId } = body as { productId?: string };
      if (!productId) return errorResponse("productId required", 400);
      await wishlistRepository.addItem(user!.uid, productId);
      return successResponse({ productId, added: true });
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const url = new URL(request.url);
      const productId = url.searchParams.get("productId");
      if (!productId) return errorResponse("productId required", 400);
      await wishlistRepository.removeItem(user!.uid, productId);
      return successResponse({ productId, removed: true });
    },
  }),
);
