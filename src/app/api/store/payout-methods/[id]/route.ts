import { normalizeError } from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";
import {
  ApiErrors,
  createRouteHandler,
  errorResponse,
  parseJsonBody,
  type JsonValue,
  payoutMethodsRepository,
  payoutMethodUpdateSchema,
  ValidationError,
  storeRepository,
  successResponse,
} from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

async function loadAndAssertOwner(uid: string, id: string) {
  const store = await storeRepository.findByOwnerId(uid);
  if (!store) return { error: ApiErrors.forbidden("No store") };
  const doc = await payoutMethodsRepository.findById(id);
  if (!doc) return { error: ApiErrors.notFound("Not found") };
  if (doc.storeId !== store.id) return { error: ApiErrors.forbidden("Not your store") };
  return { store, doc };
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
      const body = await parseJsonBody<Record<string, JsonValue>>(request);
      // The raw body used to be handed straight to `.update()` — no schema, no
      // field filtering, so any key a caller invented was persisted and
      // `sellerId`/`storeId` could be rewritten from the request. The update
      // schema is `.strict()`, so an unknown key is now a 400 rather than a
      // silent write.
      const parsed = payoutMethodUpdateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid payout method",
          parsed.error.issues,
        );
      }
      try {
        const updated = await payoutMethodsRepository.update(
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
      await payoutMethodsRepository.delete((params as { id: string }).id);
      return successResponse({ deleted: true }, "Deleted");
    },
  }),
);
