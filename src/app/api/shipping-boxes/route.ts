/**
 * GET  /api/shipping-boxes — the dispatch form's carton picker
 * POST /api/shipping-boxes — any seller adds a carton they actually use
 *
 * ## 🛑 NOT the same thing as `/api/admin/inventory/boxes`
 *
 * "Box" is overloaded in this codebase and the two are unrelated:
 *
 *  - `storageBoxes` (`/admin/inventory/boxes`) is the registry of REAL,
 *    labelled physical boxes in the warehouse — AC60/AC30 — each of which
 *    exists because somebody put a label on one.
 *  - `shippingBoxes` (here) is a library of CARTON SIZE presets: named
 *    dimensions a seller picks to pre-fill a dispatch declaration.
 *
 * One is inventory, the other is a measurement default. Pointing either route
 * at the other's repository would compile, return rows, and be wrong in a way
 * only a human reading the numbers would catch.
 *
 * ## Who may write
 *
 * **Any seller creates; only staff edit or retire** (the `[id]` route). A
 * seller adds a carton they actually use, and nobody but staff can change
 * dimensions another seller's dispatch form defaults to — a wrong edit
 * misdeclares other people's parcels, and an understated weight is re-billed
 * by the courier after delivery as a weight-discrepancy adjustment.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { shippingBoxesRepository } from "@mohasinac/appkit/features/shipping-boxes/repository/shipping-boxes.repository";
import {
  SHIPPING_BOX_FIELDS,
  SHIPPING_BOX_LIMITS,
} from "@mohasinac/appkit/features/shipping-boxes/schemas/firestore";
/* 🛑 The DEFINING module — a `sortBy` from the `"use client"` entry would be a
 * client-reference proxy in a route handler (Root Cause #76). */
import { sortBy } from "@mohasinac/appkit/constants/sort";
/* 🛑 The DEFINING module, never the `@/constants` barrel — see the 401 note on
 * `/api/dispute-reasons`: that barrel re-exports `navigation.tsx`, which pulls
 * appkit's `"use client"` entry into a server graph and gives the route a
 * second appkit whose provider registry is empty. */
import { ROLES_STORE_WRITE, ROLES_ANY_STAFF } from "@/constants/api-roles";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    /*
     * Sellers AND staff: the picker is on the seller's dispatch form, and staff
     * open the same form when dispatching on a seller's behalf.
     */
    roles: [...ROLES_STORE_WRITE, ...ROLES_ANY_STAFF],
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      /*
       * 🛑 NOT delegated. `listingProcessor.ts`'s `LISTERS` map has no
       * `shippingBoxes` entry, so `executor: listingProcessorFirstExecutor`
       * would 400 in the Function and fall back to this same local query —
       * a guaranteed-failing round trip per request. Identical reasoning to
       * `/api/admin/inventory/boxes`, and measured the same way.
       */
      // audit-listing-delegation-ok: no `shippingBoxes` lister exists in the Function; delegating would 400 and fall back on every request
      const result = await shippingBoxesRepository.listActive({
        page: Number(getStringParam(searchParams, "page") ?? 1) || 1,
        /* Clamped to 50 per Rule #6 — the caller is a picker, so a bounded
         * page is the right answer rather than a 400 on an editable URL. */
        pageSize: Math.min(
          50,
          Math.max(1, Number(getStringParam(searchParams, "pageSize")) || 20),
        ),
        /*
         * `PaginatedSelect` searches the NAME, and `name` is allowlisted in
         * `SIEVE_FIELDS` for exactly that. An unallowlisted searched field is
         * silently dropped and the picker returns the whole library while
         * looking as though it filtered (Root Cause #62).
         */
        filters: getStringParam(searchParams, "filters") ?? undefined,
        sorts: sortBy(SHIPPING_BOX_FIELDS.NAME),
      });

      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });
    },
  }),
);

const createSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    /*
     * Bounds mirrored from `SHIPPING_BOX_LIMITS` rather than retyped, so the
     * schema and the repository's clamp cannot disagree about what a plausible
     * carton is. The repository CLAMPS and this REJECTS, deliberately: a body
     * out of range is a caller bug worth a 400, while the clamp is the last
     * line that stops a typo reaching a courier API as a 4-metre parcel.
     */
    length: z.number().min(SHIPPING_BOX_LIMITS.minCm).max(SHIPPING_BOX_LIMITS.maxCm),
    width: z.number().min(SHIPPING_BOX_LIMITS.minCm).max(SHIPPING_BOX_LIMITS.maxCm),
    height: z.number().min(SHIPPING_BOX_LIMITS.minCm).max(SHIPPING_BOX_LIMITS.maxCm),
    tareWeight: z
      .number()
      .min(SHIPPING_BOX_LIMITS.minKg)
      .max(SHIPPING_BOX_LIMITS.maxKg)
      .optional(),
  })
  .strict();

export const POST = withProviders(
  createRouteHandler<(typeof createSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE, ...ROLES_ANY_STAFF],
    schema: createSchema,
    handler: async ({ body, user }) => {
      const { box, created } = await shippingBoxesRepository.createPreset({
        ...body!,
        createdByUid: user!.uid,
        createdByName: user!.name ?? user!.uid,
      });

      /*
       * `created: false` is a SUCCESS carrying the existing row, not a 409.
       *
       * The id is `box-<slug of name>`, so a second seller adding "Standard
       * carton" has their intent satisfied by the row that already exists —
       * and that row has an author and may be in use. Returning it is what
       * makes the picker's inline create idempotent; a 409 would send the
       * seller to find a different name for a carton that is already there.
       */
      return successResponse({ box, created });
    },
  }),
);
