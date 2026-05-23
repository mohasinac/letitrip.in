import { withProviders } from "@/providers.config";
import { createApiHandler, ApiErrors, successResponse } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/** DELETE /api/admin/products/[id]/group/children/[childId] — unlink a child (admin) */
export const DELETE = withProviders(createApiHandler({
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:products:delete",
  handler: async ({ params }) => {
    const { id: parentDocId, childId } = params as { id: string; childId: string };

    const [parent, child] = await Promise.all([
      productRepository.findById(parentDocId),
      productRepository.findById(childId),
    ]);

    if (!parent) return ApiErrors.notFound("Parent product not found");
    if (!child) return ApiErrors.notFound("Child product not found");

    await productRepository.unlinkChildFromGroup(parent, child);
    return successResponse({ unlinked: true }, "Listing unlinked from group");
  },
}));
