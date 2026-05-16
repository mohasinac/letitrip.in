import { withProviders } from "@/providers.config";
import { createRouteHandler, ApiErrors, successResponse } from "@mohasinac/appkit";
import { productRepository, storeRepository, isAuctionListing } from "@mohasinac/appkit";

const MSG_NO_STORE = "Store not found for this seller.";
const MSG_PRODUCT_NOT_FOUND = "Product not found.";
const MSG_NOT_YOUR_PRODUCT = "This product does not belong to your store.";

/** POST — start a group (this product becomes parent) */
export const POST = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user, params }) => {
    const productId = (params as Record<string, string>).id;
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden(MSG_NO_STORE);

    const product = await productRepository.findById(productId);
    if (!product) return ApiErrors.notFound(MSG_PRODUCT_NOT_FOUND);
    if (product.storeId !== store.id) return ApiErrors.forbidden(MSG_NOT_YOUR_PRODUCT);
    if (isAuctionListing(product)) return ApiErrors.badRequest("Auctions cannot be in groups");
    if (product.groupId) return ApiErrors.badRequest("Product is already in a group");

    const slug = product.slug ?? product.id;
    await productRepository.startGroup(product.id, slug);
    return successResponse({ groupId: slug }, "Group started");
  },
}));

/** PATCH — update groupTitle */
export const PATCH = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ request, user, params }) => {
    const productId = (params as Record<string, string>).id;
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden(MSG_NO_STORE);

    const product = await productRepository.findById(productId);
    if (!product) return ApiErrors.notFound(MSG_PRODUCT_NOT_FOUND);
    if (product.storeId !== store.id) return ApiErrors.forbidden(MSG_NOT_YOUR_PRODUCT);
    if (!product.isGroupParent) return ApiErrors.badRequest("Product is not a group parent");

    const body = await request.json() as { groupTitle?: string };
    await productRepository.updateGroupTitle(product.id, body.groupTitle ?? "");
    return successResponse({ groupTitle: body.groupTitle }, "Group title updated");
  },
}));

/** DELETE — dissolve the group */
export const DELETE = withProviders(createRouteHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user, params }) => {
    const productId = (params as Record<string, string>).id;
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden(MSG_NO_STORE);

    const product = await productRepository.findById(productId);
    if (!product) return ApiErrors.notFound(MSG_PRODUCT_NOT_FOUND);
    if (product.storeId !== store.id) return ApiErrors.forbidden(MSG_NOT_YOUR_PRODUCT);
    if (!product.isGroupParent) return ApiErrors.badRequest("Product is not a group parent");
    if (!product.groupId) return ApiErrors.badRequest("No groupId on product");

    await productRepository.dissolveGroup(product.groupId);
    return successResponse({}, "Group dissolved");
  },
}));
