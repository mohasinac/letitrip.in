import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { withProviders } from "@/providers.config";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import { payoutMethodsRepository } from "@mohasinac/appkit/features/store-extensions/repository/store-extensions.repositories";
import { payoutMethodCreateSchema } from "@mohasinac/appkit/features/store-extensions/schemas/payout-method-form";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { ApiErrors, errorResponse, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { parseJsonBody } from "@mohasinac/appkit/next/api/parseJsonBody";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import type { JsonValue } from "@mohasinac/appkit/schemas/types";
import { ROLES_STORE_WRITE } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const result = await payoutMethodsRepository.listByStore(store.id);
      return successResponse({ items: result.items, total: result.items.length });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ request, user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store");
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      // Parse, don't spread. This used to write the raw request body straight
      // into Firestore with no check of any kind, so a bank payout method
      // with a blank account number, blank IFSC and blank holder name saved
      // cleanly — and only failed at payout time, by which point it is a
      // support ticket rather than a form error.
      const parsed = payoutMethodCreateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid payout method",
          parsed.error.issues,
        );
      }
      try {
        const doc = await payoutMethodsRepository.create({
          ...parsed.data,
          // From the session, never the body — otherwise a seller could file a
          // payout method against another seller's store.
          storeId: store.id,
          sellerId: user!.uid,
        });
        return successResponse(doc, "Payout method created", 201);
      } catch (err) {
        void normalizeError(err);
        return errorResponse(
          err instanceof Error ? err.message : "Create failed",
          400,
        );
      }
    },
  }),
);
