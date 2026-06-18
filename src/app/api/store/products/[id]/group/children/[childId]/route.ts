import { withProviders } from "@/providers.config";
import { createApiHandler, ApiErrors, successResponse } from "@mohasinac/appkit";
import { productRepository, storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

/** DELETE /api/store/products/[id]/group/children/[childId] — unlink a child */
export const DELETE = withProviders(createApiHandler({
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ user, params }) => {
    const { id: parentDocId, childId } = params as { id: string; childId: string };

    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store) return ApiErrors.forbidden("No store found for this account");

    const [parent, child] = await Promise.all([
      productRepository.findById(parentDocId),
      productRepository.findById(childId),
    ]);

    if (!parent) return ApiErrors.notFound("Parent product not found");
    if (!child) return ApiErrors.notFound("Child product not found");
    if (parent.storeId !== store.id) return ApiErrors.forbidden("Not your product");

    await productRepository.unlinkChildFromGroup(parent, child);
    return successResponse({ unlinked: true }, "Listing unlinked from group");
  },
}));
