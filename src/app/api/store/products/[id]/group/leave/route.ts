import { withProviders } from "@/providers.config";
import { createApiHandler, ApiErrors, successResponse } from "@mohasinac/appkit";
import { productRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

/** DELETE /api/store/products/[id]/group/leave — child leaves its group */
export const DELETE = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ user, params }) => {
    const productId = (params as { id: string }).id;

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const child = await productRepository.findById(productId);
    if (!child) return ApiErrors.notFound("Product not found");
    if (child.storeId !== store.id) return ApiErrors.forbidden("Not your product");
    if (child.isGroupParent) return ApiErrors.badRequest("Group parents cannot leave — use dissolve");
    if (!child.groupId) return ApiErrors.badRequest("Product is not in a group");

    const parent = child.groupParentSlug
      ? (await productRepository.findBySlug(child.groupParentSlug)) ?? null
      : null;

    await productRepository.leaveGroup(child, parent);
    return successResponse({ left: true }, "Left the group");
  },
}));
