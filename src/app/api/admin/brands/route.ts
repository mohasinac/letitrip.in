import { withProviders } from "@/providers.config";
import { z } from "zod";
import { COMMON_FIELDS, BRAND_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { categoriesRepository } from "@mohasinac/appkit/features/categories/repository/categories.repository";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { createBrandAction } from "@mohasinac/appkit";
import { ROLES_ANY_STAFF, ROLES_STORE_WRITE } from "@/constants";

const DEFAULT_SORTS = [sortBy(COMMON_FIELDS.ORDER, "ASC"), sortBy(BRAND_FIELDS.NAME, "ASC")].join(",");

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  logoURL: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string().optional(),
  founded: z.number().int().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    // Sellers browse the same taxonomy admins do when picking/creating a
    // brand inline on the product form — ROLES_ANY_STAFF = admin+mod+seller.
    // No `permission` gate: getServerPermissions() only resolves fine-grained
    // permissions for role "employee", so keeping it here would 403 every
    // moderator/seller regardless of roles[] (neither is "admin" or "employee").
    roles: [...ROLES_ANY_STAFF],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 50));
      const sorts = url.searchParams.get("sorts") || DEFAULT_SORTS;
      const filters = url.searchParams.get("filters");
      const combinedFilters = filters
        ? `${filters},categoryType==brand`
        : "categoryType==brand";

      /*
       * A brand is a `categories` row (`categoryType:"brand"`), so it carries
       * the same `searchTxt` every other row in that collection does — the
       * seed's `.map(withCategorySearchTxt)` is applied after the closing `]`
       * of the five row families, not to one spread, so brand, franchise,
       * sublisting and bundle rows are all tokenised.
       *
       * 🛑 This route nonetheless read no `q`, and `AdminBrandsView` had had
       * its search box DELETED with the comment *"Restore it when the
       * collection gains searchTxt"*. The collection gained it; the note was
       * never paid. Marking `categories` MIGRATED while five of the six routes
       * querying it still could not search is Root Cause #99's shape — the
       * back-port that stops at the first caller.
       */
      const q = (url.searchParams.get("q") || "").trim();

      const result = await categoriesRepository.list(
        {
          filters: combinedFilters,
          sorts,
          page: String(page),
          pageSize: String(pageSize),
        },
        q ? { search: q } : undefined,
      );
      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof createBrandSchema)["_output"]>({
    auth: true,
    // Sellers can create brands inline from the product form — same
    // reasoning as GET above (ROLES_STORE_WRITE = seller+admin).
    roles: [...ROLES_STORE_WRITE],
    schema: createBrandSchema,
    handler: async ({ body }) => {
      const slug = body!.slug || `brand-${slugify(body!.name)}`;
      const existing = await categoriesRepository.findBySlugAndType(slug, "brand");
      if (existing) return errorResponse("A brand with this slug already exists", 409);
      const brand = await createBrandAction({ ...body!, slug });
      return successResponse(brand, "Brand created");
    },
  }),
);
