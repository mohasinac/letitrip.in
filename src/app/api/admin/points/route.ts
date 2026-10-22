/**
 * `POST /api/admin/points` — credit or debit a buyer's points by hand.
 *
 * ## D48's remaining half
 *
 * `admin_adjustment` has been a fully specified ledger kind with a mandatory
 * `adminReason` and a signed-amount invariant since the ledger was written, and
 * its only writer was the expiry sweep's `system:points-expiry` sentinel. So a
 * human could not correct a balance at all — the kind existed, the door did
 * not.
 *
 * ## 🛑 Admin only, and the reason is the money direction
 *
 * 1 point = ₹1 of spendable discount. A credit is a liability the platform must
 * honour; a debit removes value a buyer already holds and there is no undo
 * beyond another adjustment. `admin:points:write` is granted to no employee
 * bundle, matching `admin:payment-cases:write` — a queue an analyst may read is
 * a different thing from a decision that moves money.
 *
 * The amount cap lives in the schema (`POINTS_ADJUSTMENT_MAX`) rather than
 * here, because the realistic failure is a typo rather than an attack and a
 * caller that uses the schema should hit it before the network.
 */

import { withProviders } from "@/providers.config";
/*
 * 🛑 From `/server`, not a deep `_internal` path — appkit has **no
 * `./_internal/*` subpath export** (46 export keys, measured), so the deep
 * import I reached for first resolves to nothing. `server.ts` re-exports this
 * deliberately, and says so.
 */
import { adjustUserPoints } from "@mohasinac/appkit/server";
/*
 * 🛑 Take the INFERRED TYPE from appkit, never `z.infer` here.
 *
 * The consumer root is on zod 4 and appkit depends on zod 3, so there are two
 * zod type systems in this build. `z.infer` from v4 applied to a v3
 * `ZodObject` resolves to `{}` — not an error, just an empty body type, so
 * `body!.userId` stops compiling while the schema itself is perfectly fine.
 * `PointsAdjustFormValues` is inferred inside appkit, by appkit's own zod.
 */
import {
  pointsAdjustFormSchema,
  type PointsAdjustFormValues,
} from "@mohasinac/appkit/features/points/schemas/adjust-form";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const POST = withProviders(
  createRouteHandler<PointsAdjustFormValues>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:points:write",
    schema: pointsAdjustFormSchema,
    handler: async ({ user, body }) => {
      /*
       * 🛑 `actorUid` is the SIGNED-IN admin, never a value from the body.
       *
       * The ledger entry's `actorUid` is the only record of who decided this,
       * and `expireLapsedBatches` writes the same kind with a system sentinel —
       * so a caller-supplied actor would let a human adjustment be filed as a
       * scheduled rule in the one field that distinguishes them.
       */
      const result = await adjustUserPoints(body!, {
        uid: user!.uid,
        // `AuthPayload.name` is `string | null | undefined` (a session can
        // carry no display name); the actor param is `string | undefined`, and
        // `actorName` is only ever a label, so a null collapses to absent.
        name: user!.name ?? undefined,
      });

      return successResponse(
        { entryId: result.entryId, balance: result.balance, userId: body!.userId },
        body!.amount > 0 ? "Points credited" : "Points debited",
      );
    },
  }),
);
