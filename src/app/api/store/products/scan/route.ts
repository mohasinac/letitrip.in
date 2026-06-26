import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  productRepository,
  storeRepository,
  userRepository,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants/api-roles";

const NOT_FOUND_MSG = "No product found for this barcode";

// rbac-public: scope enforced per-role inside handler
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    permission: "store:api:write",
    handler: async ({ request, user }) => {
      const url = new URL(request.url);
      const barcode = url.searchParams.get("barcode")?.trim();
      if (!barcode) return errorResponse("barcode param required", 400);

      const product = await productRepository.findByBarcodeId(barcode);
      if (!product) return errorResponse(NOT_FOUND_MSG, 404);

      if (user!.role === "admin") {
        return successResponse(product);
      }

      if (user!.role === "employee") {
        const userDoc = (await userRepository.findById(user!.uid)) as { storeId?: string } | null;
        if (!userDoc?.storeId || product.storeId !== userDoc.storeId)
          return errorResponse(NOT_FOUND_MSG, 404);
        return successResponse(product);
      }

      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store || product.storeId !== store.id)
        return errorResponse(NOT_FOUND_MSG, 404);

      return successResponse(product);
    },
  }),
);
