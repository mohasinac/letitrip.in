import { withProviders } from "@/providers.config";
/**
 * Admin Homepage Sections API Route
 * GET  /api/admin/sections — List sections with pagination
 * POST /api/admin/sections — Create a new section
 */

import { revalidatePath } from "next/cache";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { resolveNextSectionOrder } from "@mohasinac/appkit/features/homepage/actions/homepage-section-actions";
import { homepageSectionCreateSchema } from "@mohasinac/appkit/features/homepage/schemas/index";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { homepageSectionsRepository } from "@mohasinac/appkit/features/homepage/repository/homepage-sections.repository";
import { HOMEPAGE_SECTION_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { ROLES_ADMIN_ONLY } from "@/constants";

const DEFAULT_SORTS = sortBy(HOMEPAGE_SECTION_FIELDS.ORDER, "ASC");
const DESC_SORTS = sortBy(HOMEPAGE_SECTION_FIELDS.ORDER);
import type { HomepageSectionCreateInput, SectionType } from "@mohasinac/appkit/features/homepage/schemas/firestore";
import { validateRequestBody, formatZodErrors } from "@/validation/request-schemas";
import { z } from "zod";
import { ERROR_MESSAGES } from "@mohasinac/appkit/errors/messages";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/values/success-messages";

/**
 * GET /api/admin/sections
 *
 * Query params:
 *  - filters  (string) — Sieve filters (e.g. enabled==true)
 *  - sorts    (string) — Sieve sorts (e.g. order)
 *  - page     (number) — page number (default 1)
 *  - pageSize (number) — results per page (default 50, max 200)
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:sections:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);

      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      /*
       * `max` was 50 while the docstring above said 200 and the repository
       * allows 200 — three numbers, two of them wrong. The listing's page-size
       * control offers 100, so picking it silently returned 50 while
       * `totalPages` was computed from 100 and disagreed with what the server
       * had actually paged.
       */
      const pageSize = getNumberParam(searchParams, "pageSize", 50, {
        min: 1,
        max: 200,
      });
      const filters = getStringParam(searchParams, "filters");
      const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

      serverLogger.info("Admin homepage sections list requested", {
        filters,
        sorts,
        page,
        pageSize,
      });

      const result = await homepageSectionsRepository.list({
        filters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

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

/**
 * POST /api/admin/sections
 *
 * Create a new homepage section
 */
// The create contract lives in appkit and is shared with the OTHER route that
// can create a section (`POST /api/homepage-sections`). Two local copies is
// how one of them ended up four section types behind the union while the
// other had no schema at all.
/*
 * The create contract lives in appkit and is SHARED with the other route that
 * can create a section (`POST /api/homepage-sections`). Two local copies is
 * how one of them fell four section types behind `SectionType` while the other
 * had no schema at all.
 *
 * Parsed via `createRouteHandler({ schema })` rather than the manual
 * `validateRequestBody` this route used before — appkit compiles against zod 3
 * and this file against zod 4, so an appkit-authored schema does not satisfy a
 * consumer-side zod-4 `ZodType` parameter. The route handler's own schema seam
 * is the one that bridges the two majors, which is why every other route in
 * this codebase goes through it.
 */
export const POST = withProviders(
  createRouteHandler<(typeof homepageSectionCreateSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:sections:write",
    schema: homepageSectionCreateSchema,
    handler: async ({ user, body }) => {
      /*
       * 🛑 `surface` must appear BOTH in the Zod schema and in this destructure
       * plus the explicit `input` below. It was stripped twice over: a plain
       * `z.object()` drops unknown keys silently, and even once accepted, this
       * hand-rolled object would not have carried it through. Root Cause #76.
       */
      const { type, enabled, config, order, surface } = body!;

      // Shared with `POST /api/homepage-sections`, which needs the identical
      // answer — see `resolveNextSectionOrder`.
      const resolvedOrder = order ?? (await resolveNextSectionOrder());

      const input: HomepageSectionCreateInput = {
        type: type as SectionType,
        enabled: enabled ?? true,
        order: resolvedOrder,
        config: config as any,
        // Omitted when absent rather than defaulted here: the DOCUMENT treats a
        // missing `surface` as "homepage", and writing the default explicitly
        // would make every new homepage row differ from the 23 existing ones
        // for no gain.
        ...(surface ? { surface } : {}),
      };

      const section = await homepageSectionsRepository.create(input);

      serverLogger.info("Homepage section created", {
        id: section.id,
        type: section.type,
        createdBy: user?.uid,
      });

      // Homepage is ISR-cached (revalidate=120) and reads sections directly
      // in the Server Component — bust it now instead of waiting up to 2min.
      revalidatePath("/");

      return successResponse(section, SUCCESS_MESSAGES.SECTION.CREATED, 201);
    },
  }),
);
