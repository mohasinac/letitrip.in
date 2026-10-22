/**
 * PATCH /api/shipping-boxes/[id] — **staff only**: correct dimensions, retire,
 * or reactivate a carton preset.
 *
 * ## Why the write split is here and not on the collection route
 *
 * Any seller may ADD a preset (the collection route); only staff may change or
 * retire one. The asymmetry is the whole point of a shared library: these
 * numbers are what the NEXT seller's dispatch form defaults to, so a wrong
 * edit misdeclares other people's parcels — and an understated weight is
 * re-billed by the courier after delivery as a weight-discrepancy adjustment,
 * which is real money arriving on a reconciliation nobody can dispute without
 * the parcel.
 *
 * A seller who finds a preset wrong adds a correct one. Staff decide whether
 * the shared row changes.
 *
 * ## 🛑 Editing cannot rewrite a dispatched parcel, by construction
 *
 * Dimensions are COPIED onto the shipment at use time — the schema's own
 * header: *"a preset is a DEFAULT, never a lock"*. There is no stored
 * reference for an edit to reach through, which is exactly what makes staff
 * editing safe to offer. The same snapshot discipline as the checkout's fee
 * terms and the dispute reason's label.
 *
 * 🛑 There is no DELETE and no rename. Retire is soft because a draft shipment
 * holding a preset must not lose it mid-dispatch; the name is immutable
 * because the id is derived from it, so renaming would either leave the id
 * disagreeing with the name (mirror drift, Root Cause #42) or mean a new
 * document — which is just a create.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { shippingBoxesRepository } from "@mohasinac/appkit/features/shipping-boxes/repository/shipping-boxes.repository";
import { SHIPPING_BOX_LIMITS } from "@mohasinac/appkit/features/shipping-boxes/schemas/firestore";
/* 🛑 The DEFINING module, never the `@/constants` barrel. */
import { ROLES_ANY_STAFF } from "@/constants/api-roles";

const patchSchema = z
  .object({
    length: z.number().min(SHIPPING_BOX_LIMITS.minCm).max(SHIPPING_BOX_LIMITS.maxCm).optional(),
    width: z.number().min(SHIPPING_BOX_LIMITS.minCm).max(SHIPPING_BOX_LIMITS.maxCm).optional(),
    height: z.number().min(SHIPPING_BOX_LIMITS.minCm).max(SHIPPING_BOX_LIMITS.maxCm).optional(),
    tareWeight: z
      .number()
      .min(SHIPPING_BOX_LIMITS.minKg)
      .max(SHIPPING_BOX_LIMITS.maxKg)
      .optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  /*
   * An empty body is a 400 rather than a successful no-op. A PATCH that
   * changed nothing and returned 200 is Root Cause #40's shape — the response
   * looks identical to a real save, and only a reload tells you otherwise.
   */
  .refine((v) => Object.keys(v).length > 0, {
    message: "Nothing to change — send at least one field",
  });

export const PATCH = withProviders(
  createRouteHandler<(typeof patchSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ANY_STAFF],
    schema: patchSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as Record<string, string>).id;

      /*
       * Read first so a 404 is a 404. `update` on a missing document raises
       * nothing a caller sees, so without this a mistyped id would be a
       * successful-looking no-op.
       */
      const existing = await shippingBoxesRepository.findById(id);
      if (!existing) return errorResponse("Carton preset not found", 404);

      const { isActive, ...dimensions } = body!;

      if (Object.keys(dimensions).length > 0) {
        await shippingBoxesRepository.updatePreset(id, dimensions);
      }

      /*
       * The flag is applied only when it CHANGES. Re-retiring an already
       * retired preset is two agents wanting the same outcome, so it succeeds —
       * but it must not look like an event.
       */
      if (isActive !== undefined && isActive !== existing.isActive) {
        if (isActive) await shippingBoxesRepository.reactivate(id);
        else await shippingBoxesRepository.retire(id);
      }

      const after = await shippingBoxesRepository.findById(id);
      return successResponse({
        box: after ?? existing,
        /*
         * Echoing WHO changed it is deliberate: the library is shared, and a
         * seller who finds their preset's numbers different needs the audit
         * trail to start somewhere. `createdByName` records the author; this
         * records the editor on the response for the caller's own toast.
         */
        editedBy: user!.name ?? user!.uid,
      });
    },
  }),
);
