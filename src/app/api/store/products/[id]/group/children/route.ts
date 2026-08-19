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

const childBodySchema = z.union([
  z.object({
    mode: z.literal("create"),
    parentId: z.string().min(1),
    title: z.string().min(1).max(200),
    price: z.number().min(0),
    condition: z.string().max(40).optional(),
  }),
  z.object({
    mode: z.literal("link"),
    parentId: z.string().min(1),
    childId: z.string().min(1),
  }),
]);

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

export const POST = withProviders(
  createRouteHandler<z.infer<typeof childBodySchema>>({
    auth: true,
    roles: ROLES,
    schema: childBodySchema,
    handler: async ({ params, body, user }) => {
      // `params.id` is the parent product id (route is nested under
      // /group/children); `body.parentId` must match it — the client always
      // sends both, this just guards against a stale/mismatched request.
      const routeParentId = (params as { id: string }).id;
      if (body!.parentId !== routeParentId) {
        return errorResponse("parentId does not match the route", 400);
      }

      const privileged = isAdminUser(user) || isEmployeeUser(user);
      const parent = await loadScopedProduct(user!, privileged, routeParentId);
      if (!parent) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      if (!parent.isGroupParent || !parent.groupId) {
        return errorResponse(ERR_FORBIDDEN, 403);
      }

      if (body!.mode === "create") {
        const child = await productRepository.addChildProduct(parent, {
          title: body!.title,
          description: "",
          categorySlugs: parent.categorySlugs ?? [],
          price: body!.price,
          currency: parent.currency,
          stockQuantity: 1,
          mainImage: parent.mainImage,
          images: parent.images ?? [],
          status: "draft",
          storeId: parent.storeId,
          featured: false,
          tags: parent.tags ?? [],
          condition: body!.condition as never,
          listingType: parent.listingType ?? "standard",
        });
        return successResponse({ child });
      }

      // mode === "link"
      const child = await productRepository.findById(body!.childId);
      if (!child) return errorResponse(ERR_PRODUCT_NOT_FOUND, 404);
      const childOwned = privileged || child.storeId === parent.storeId;
      if (!childOwned) return errorResponse(ERR_FORBIDDEN, 403);
      if (child.groupId) return errorResponse("That listing already belongs to a group", 400);

      await productRepository.linkChildToGroup(parent, child);
      return successResponse({ linked: true, childId: child.id });
    },
  }),
);
