import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { shippingConfigsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { shippingConfigUpdateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/shipping-config-form";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { ApiErrors, errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { FirestoreDocument } from "@mohasinac/appkit/schemas/types";
import { ROLES_STORE_WRITE } from "@/constants";

async function loadAndAssertOwner(uid: string, id: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store) return { error: ApiErrors.forbidden("No store") };
  const doc = await shippingConfigsRepository.findById(id);
  if (!doc) return { error: ApiErrors.notFound("Not found") };
  if (doc.storeId !== store.id) return { error: ApiErrors.forbidden("Not your store") };
  return { doc };
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const { error, doc } = await loadAndAssertOwner(user!.uid, (params as { id: string }).id);
      if (error) return error;
      return successResponse(doc);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user, params }) => {
      const { error } = await loadAndAssertOwner(user!.uid, (params as { id: string }).id);
      if (error) return error;
      const body = await parseJsonBody<FirestoreDocument>(request);
      const parsed = shippingConfigUpdateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid shipping rule",
          parsed.error.issues,
        );
      }
      try {
        const updated = await shippingConfigsRepository.update(
          (params as { id: string }).id,
          parsed.data,
        );
        return successResponse(updated, "Updated");
      } catch (err) {
        void normalizeError(err);
        return errorResponse(err instanceof Error ? err.message : "Update failed", 400);
      }
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user, params }) => {
      const { error } = await loadAndAssertOwner(user!.uid, (params as { id: string }).id);
      if (error) return error;
      await shippingConfigsRepository.delete((params as { id: string }).id);
      return successResponse({ deleted: true }, "Deleted");
    },
  }),
);
