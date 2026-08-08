import { withProviders } from "@/providers.config";
import { z } from "zod";
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

const startGroupSchema = z.object({ slug: z.string().min(1) });
const updateTitleSchema = z.object({ groupTitle: z.string().max(200) });

/** Resolves the caller's own product, or any product for admin/employee. */
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

const ROLES = [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE];

export const POST = withProviders(
  createRouteHandler<z.infer<typeof startGroupSchema>>({
    auth: true,
    roles: ROLES,
    schema: startGroupSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);
      const product = await loadScopedProduct(user!, privileged, id);
      if (!product) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (product.groupId) return errorResponse("This listing is already part of a group", 400);

      await productRepository.startGroup(id, body!.slug);
      return successResponse({ id, groupId: body!.slug });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof updateTitleSchema>>({
    auth: true,
    roles: ROLES,
    schema: updateTitleSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);
      const product = await loadScopedProduct(user!, privileged, id);
      if (!product) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (!product.isGroupParent) return errorResponse(ERR_FORBIDDEN, 403);

      await productRepository.updateGroupTitle(id, body!.groupTitle);
      return successResponse({ id, groupTitle: body!.groupTitle });
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES,
    permission: "store:api:write",
    handler: async ({ params, user }) => {
      const id = (params as { id: string }).id;
      const privileged = isAdminUser(user) || isEmployeeUser(user);
      const product = await loadScopedProduct(user!, privileged, id);
      if (!product) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (!product.isGroupParent || !product.groupId) {
        return errorResponse(ERR_FORBIDDEN, 403);
      }

      await productRepository.dissolveGroup(product.groupId);
      return successResponse({ id, dissolved: true });
    },
  }),
);
