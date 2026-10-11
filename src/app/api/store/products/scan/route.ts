import { withProviders } from "@/providers.config";
import { userRepository } from "@mohasinac/appkit/features/auth/repository/user.repository";
import { isAdminUser, isEmployeeUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { productRepository } from "@mohasinac/appkit/features/products/repository/products.repository";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants";
import { USER_ROLE } from "@/constants";

const NOT_FOUND_MSG = "No product found for this barcode";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    handler: async ({ request, user }) => {
      const url = new URL(request.url);
      const barcode = url.searchParams.get("barcode")?.trim();
      if (!barcode) return errorResponse("barcode param required", 400);

      const product = await productRepository.findByBarcodeId(barcode);
      if (!product) return errorResponse(NOT_FOUND_MSG, 404);

      if (isAdminUser(user)) {
        return successResponse(product);
      }

      if (isEmployeeUser(user)) {
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
