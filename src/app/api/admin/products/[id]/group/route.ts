import { withProviders } from "@/providers.config";
import { z } from "zod";
import { ApiErrors, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler as createApiHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { isAuctionListing } from "@mohasinac/appkit/features/products/utils/listing-type";
import { ROLES_ADMIN_ONLY } from "@/constants";

const MSG_PRODUCT_NOT_FOUND = "Product not found.";

/*
 * The group title, validated rather than cast.
 *
 * `body.groupTitle ?? ""` on a cast body accepted a number, an object or an
 * array and wrote it verbatim to `groupTitle` — the `?? ""` only defends
 * against absence, never against the wrong type. A non-string there renders as
 * `[object Object]` on every card in the group.
 *
 * `.max(120)` because the title is denormalised onto each child row; an
 * unbounded string is an unbounded write multiplied by the group size.
 */
const groupTitleSchema = z.object({
  groupTitle: z.string().trim().max(120).optional(),
});

/** POST — start a group (admin, no ownership check) */
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
export const PATCH = withProviders(createApiHandler<(typeof groupTitleSchema)["_output"]>({
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:products:write",
  schema: groupTitleSchema,
  handler: async ({ body, params }) => {
    const productId = (params as { id: string }).id;
    const product = await productRepository.findById(productId);
    if (!product) return ApiErrors.notFound(MSG_PRODUCT_NOT_FOUND);
    if (!product.isGroupParent) return ApiErrors.badRequest("Product is not a group parent");

    const groupTitle = body!.groupTitle ?? "";
    await productRepository.updateGroupTitle(product.id, groupTitle);
    return successResponse({ groupTitle }, "Group title updated");
  },
}));

/** DELETE — dissolve the group (admin) */
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
