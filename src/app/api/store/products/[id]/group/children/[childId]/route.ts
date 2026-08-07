import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productRepository,
  storeRepository,
  isAdminUser,
  isEmployeeUser,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants/api-roles";

const ERR_PRODUCT_NOT_FOUND = "Product not found";
const ERR_FORBIDDEN = "You do not own this listing";

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

async function loadScopedProduct(
  user: { uid: string },
  isPrivileged: boolean,
  id: string,
) {
  const product = await productRepository.findById(id);
  if (!product) return null;
  if (isPrivileged) return product;
  const store = await storeRepository.findByOwnerId(user.uid);
  if (!store || product.storeId !== store.id) return null;
  return product;
}

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES,
    permission: "store:api:write",
    handler: async ({ params, user }) => {
      const { id: parentId, childId } = params as { id: string; childId: string };
      const privileged = isAdminUser(user) || isEmployeeUser(user);

      const parent = await loadScopedProduct(user!, privileged, parentId);
      if (!parent) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (!parent.isGroupParent) return errorResponse(ERR_FORBIDDEN, 403);

      const child = await productRepository.findById(childId);
      if (!child) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (child.groupId !== parent.groupId) {
        return errorResponse("That listing is not a member of this group", 400);
      }

      await productRepository.unlinkChildFromGroup(parent, child);
      return successResponse({ unlinked: true, childId });
    },
  }),
);
