import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse, ApiErrors, errorResponse } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

const updateSchema = z.object({
  storeSlug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/, {
      message: "Slug must be 3–50 characters, only lowercase letters, numbers, and hyphens.",
    }),
});

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const PUT = withProviders(
  createRouteHandler<(typeof updateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: updateSchema,
    handler: async ({ body, user }) => {
      const newSlug = body!.storeSlug;

      if (!SLUG_RE.test(newSlug)) {
        return ApiErrors.badRequest(
          "Slug must be 3–50 characters, only lowercase letters, numbers, and hyphens.",
        );
      }

      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store found for this account");

      if (store.storeSlug === newSlug) {
        return successResponse({ store, changed: false });
      }

      const available = await storeRepository.isSlugAvailable(newSlug);
      if (!available) {
        return errorResponse("This slug is already taken. Please choose a different one.", 409);
      }

      const updated = await storeRepository.changeSlug(store.storeSlug, newSlug);
      return successResponse({ store: updated, changed: true });
    },
  }),
);
