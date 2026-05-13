import { withProviders } from "@/providers.config";
import { createApiHandler, ApiErrors, successResponse } from "@mohasinac/appkit";
import { productRepository } from "@mohasinac/appkit";

/** DELETE /api/admin/products/[id]/group/leave — admin removes a child from its group */
export const DELETE = withProviders(createApiHandler({
  roles: ["admin"],
  permission: "admin:products:delete",
  handler: async ({ params }) => {
    const productId = (params as { id: string }).id;
    const child = await productRepository.findById(productId);
    if (!child) return ApiErrors.notFound("Product not found");
    if (child.isGroupParent) return ApiErrors.badRequest("Group parents cannot leave — use dissolve");
    if (!child.groupId) return ApiErrors.badRequest("Product is not in a group");

    const parent = child.groupParentSlug
      ? (await productRepository.findBySlug(child.groupParentSlug)) ?? null
      : null;

    await productRepository.leaveGroup(child, parent);
    return successResponse({ left: true }, "Left the group");
  },
}));
