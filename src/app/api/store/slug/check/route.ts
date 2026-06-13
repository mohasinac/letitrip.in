import { withProviders } from "@/providers.config";
import { createRouteHandler, successResponse, ApiErrors } from "@mohasinac/appkit";
import { storeRepository } from "@mohasinac/appkit";
import { ROLES_STORE_READ } from "@/constants";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_READ],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const slug = url.searchParams.get("slug")?.toLowerCase().trim() ?? "";

      if (!slug) return ApiErrors.badRequest("slug is required");
      if (!SLUG_RE.test(slug)) {
        return successResponse({
          available: false,
          reason: "Slug must be 3–50 characters, only lowercase letters, numbers, and hyphens.",
        });
      }

      const available = await storeRepository.isSlugAvailable(slug);
      return successResponse({ available, reason: available ? null : "This slug is already taken." });
    },
  }),
);
