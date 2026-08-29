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
import { USER_ROLE } from "@/constants";

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
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);

      const child = await loadScopedProduct(user!, privileged, id);
      if (!child) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (!child.groupId) return errorResponse(ERR_FORBIDDEN, 403);
      if (child.isGroupParent) {
        return errorResponse("The group parent must dissolve the group instead of leaving it", 400);
      }

      // groupParentSlug === the parent's id (product ids are pure slugs).
      const parent = child.groupParentSlug
        ? await productRepository.findById(child.groupParentSlug)
        : null;

      await productRepository.leaveGroup(child, parent);
      return successResponse({ id, left: true });
    },
  }),
);
