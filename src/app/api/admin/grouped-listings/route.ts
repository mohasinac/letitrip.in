/**
 * GET /api/admin/grouped-listings — admin Sieve-paginated list across all stores.
 * DELETE not exposed at the list level (use [id]/route.ts).
 *
 * W1-29 — companion to the seller-scoped /api/store/grouped-listings; gives
 * admin a full cross-store view for moderation.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  groupedListingsRepository,
  groupedListingCreateSchema,
  storeRepository,
  parseJsonBody,
  ValidationError,
  type JsonValue,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const pageSize = Math.min(Number(url.searchParams.get("pageSize") ?? "50"), 50);
      const items = await groupedListingsRepository.findAll(pageSize);
      return successResponse({ items, total: items.length });
    },
  }),
);

/**
 * Create a grouped listing on behalf of any store.
 *
 * ## Why this did not exist
 *
 * Admin had a list, a detail GET, a PATCH and a DELETE — and no way to create.
 * `/admin/grouped-listings` therefore had no create affordance at all, and
 * pointing a shared editor at these endpoints would have 405'd on create,
 * which is why `endpointOverride` on the seller form was never viable.
 *
 * ## `storeId` comes from the BODY here, and only here
 *
 * The seller route derives it from the session — that is what stops a seller
 * filing a group under someone else's store, and it must stay that way. An
 * admin owns no store, so there is nothing to derive it from; the editor asks
 * with an explicit store picker. The id is verified against a real store
 * rather than trusted, so a typo cannot orphan a group under a storeId that
 * does not exist (nothing downstream would report it — the group would simply
 * never appear on any storefront).
 *
 * Derivations are the seller route's, not re-invented: `activeMemberCount`
 * from `productIds.length` and `visibilityStatus` on create. A second copy of
 * those is how the count goes stale on one path and not the other.
 */
export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:grouped-listings:write",
    handler: async ({ request, user }) => {
      const body = await parseJsonBody<Record<string, JsonValue>>(request);

      const storeId = typeof body.storeId === "string" ? body.storeId : "";
      if (!storeId) return errorResponse("A store is required", 400);
      const store = await storeRepository.findById(storeId);
      if (!store) return errorResponse("Store not found", 404);

      const parsed = groupedListingCreateSchema.safeParse(body);
      if (!parsed.success) {
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid grouped listing",
          parsed.error.issues,
        );
      }

      const productIds = Array.isArray(parsed.data.productIds) ? parsed.data.productIds : [];
      const doc = await groupedListingsRepository.create({
        ...parsed.data,
        storeId: store.id,
        createdBy: user!.uid,
        productIds,
        minActiveMembers: Number(parsed.data.minActiveMembers ?? 2),
        activeMemberCount: productIds.length,
        visibilityStatus: "visible",
      });
      return successResponse(doc, "Group created", 201);
    },
  }),
);
