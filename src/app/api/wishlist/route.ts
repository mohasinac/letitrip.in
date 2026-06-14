import { withProviders } from "@/providers.config";
import { WISHLIST_MAX, WishlistFullError, createRouteHandler, errorResponse, parseJsonBody, productRepository, successResponse, wishlistRepository } from "@mohasinac/appkit";

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;
      const wishlistItems = await wishlistRepository.getWishlistItems(uid);

      if (wishlistItems.length === 0) {
        return successResponse({
          items: [],
          total: 0,
          limit: WISHLIST_MAX,
          isFull: false,
        });
      }

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
          productTitle: product?.title ?? item.productSnapshot?.title,
          productImage: product?.mainImage ?? item.productSnapshot?.thumb,
          productPrice: product?.price ?? item.productSnapshot?.currentPrice,
          productCurrency: product?.currency ?? "INR",
          productSlug: product?.slug ?? item.productId,
          productStatus: product?.status ?? "published",
          addedAt: item.addedAt instanceof Date
            ? item.addedAt.toISOString()
            : String(item.addedAt),
        };
      });

      return successResponse({
        items,
        total: items.length,
        limit: WISHLIST_MAX,
        isFull: items.length >= WISHLIST_MAX,
      });
    },
  }),
);

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const body = await parseJsonBody(request);
      const { productId } = body as { productId?: string };
      if (!productId) return errorResponse("productId required", 400);
      try {
        const count = await wishlistRepository.addItem(user!.uid, productId);
        return successResponse({
          productId,
          added: true,
          count,
          limit: WISHLIST_MAX,
          isFull: count >= WISHLIST_MAX,
        });
      } catch (e) {
        if (e instanceof WishlistFullError) {
          return errorResponse(
            `Wishlist full (${e.current}/${e.limit}). Remove an item to add new ones.`,
            409,
            { code: "WISHLIST_FULL", limit: e.limit, current: e.current },
          );
        }
        throw e;
      }
    },
  }),
);

// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
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
