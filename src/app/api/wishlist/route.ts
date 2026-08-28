import { withProviders } from "@/providers.config";
import { WISHLIST_MAX, WishlistFullError, createRouteHandler, errorResponse, normalizeError, parseJsonBody, productRepository, successResponse, wishlistRepository } from "@mohasinac/appkit";
import { wishlistAddSchema } from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";

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
        // Hydration only — every field below falls back to the row's own
        // `productSnapshot`, so a missing product degrades the card, not the list.
        productIds.map((id) =>
          safeRead(() => productRepository.findById(id), {
            route: "/wishlist",
            key: "products.findById",
            fallback: null,
          }),
        ),
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

export const POST = withProviders(
  createRouteHandler<(typeof wishlistAddSchema)["_output"]>({
    auth: true,
    schema: wishlistAddSchema,
    handler: async ({ user, body }) => {
      // `postApiWishlist` has declared this exact shape in SCHEMAS.api since
      // the registry was seeded — and this route, its only consumer, read the
      // body raw and cast it. `body as { productId?: string }` has no runtime
      // effect: productId could be a number, an object, or absent.
      const { productId } = body!;
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
        void normalizeError(e);
        if (e instanceof WishlistFullError) {
          return errorResponse(
            `Wishlist full (${e.current}/${e.limit}). Remove an item to add new ones.`,
            409,
            { code: "WISHLIST_FULL" },
          );
        }
        throw e;
      }
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