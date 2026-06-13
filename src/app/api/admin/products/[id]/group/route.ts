import { withProviders } from "@/providers.config";
import { createApiHandler, ApiErrors, successResponse } from "@mohasinac/appkit";
import { productRepository, isAuctionListing } from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

const MSG_PRODUCT_NOT_FOUND = "Product not found.";

/** POST — start a group (admin, no ownership check) */
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const POST = withProviders(createApiHandler({
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:products:write",
  handler: async ({ params }) => {
    const productId = (params as { id: string }).id;
    const product = await productRepository.findById(productId);
    if (!product) return ApiErrors.notFound(MSG_PRODUCT_NOT_FOUND);
    if (isAuctionListing(product)) return ApiErrors.badRequest("Auctions cannot be in groups");
    if (product.groupId) return ApiErrors.badRequest("Product is already in a group");

    const slug = product.slug ?? product.id;
    await productRepository.startGroup(product.id, slug);
    return successResponse({ groupId: slug }, "Group started");
  },
}));

/** PATCH — update groupTitle (admin) */
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const PATCH = withProviders(createApiHandler({
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:products:write",
  handler: async ({ request, params }) => {
    const productId = (params as { id: string }).id;
    const product = await productRepository.findById(productId);
    if (!product) return ApiErrors.notFound(MSG_PRODUCT_NOT_FOUND);
    if (!product.isGroupParent) return ApiErrors.badRequest("Product is not a group parent");

    const body = await request.json() as { groupTitle?: string };
    await productRepository.updateGroupTitle(product.id, body.groupTitle ?? "");
    return successResponse({ groupTitle: body.groupTitle }, "Group title updated");
  },
}));

/** DELETE — dissolve the group (admin) */
// rbac-scope-enforced-in-handler: admin section — handler uses createRouteHandler with admin roles + path-segregated guards
export const DELETE = withProviders(createApiHandler({
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:products:delete",
  handler: async ({ params }) => {
    const productId = (params as { id: string }).id;
    const product = await productRepository.findById(productId);
    if (!product) return ApiErrors.notFound(MSG_PRODUCT_NOT_FOUND);
    if (!product.isGroupParent) return ApiErrors.badRequest("Product is not a group parent");
    if (!product.groupId) return ApiErrors.badRequest("No groupId on product");

    await productRepository.dissolveGroup(product.groupId);
    return successResponse({}, "Group dissolved");
  },
}));
