import { withProviders } from "@/providers.config";
/**
 * Admin Protection Claims API — adjudicate.
 *
 * `PATCH /api/admin/protection-claims/[id]` with `{ finding }`.
 *
 * ## 🛑 The finding decides WHO PAYS, never whether a protected buyer is paid
 *
 * `adjudicateClaim` encodes this and neither the action nor this route
 * second-guesses it: on sale cover, a `change-of-mind` finding STILL refunds
 * the buyer and moves the cost to the platform, raising a report. The promise
 * sold was unconditional, and the only honest enforcement against repeat abuse
 * is withdrawing FUTURE eligibility — not denying this claim.
 *
 * That is why the request body carries a FINDING and not an outcome. Letting an
 * admin post `{ refundBuyer: false }` would make the cover conditional at the
 * exact moment it is being tested, which is the one moment it must not be.
 *
 * ## It records a decision and moves no money
 *
 * The refund is `processRefundAction`'s job, with its own idempotency key.
 * Keeping them apart is what makes a half-failure findable: a claim that
 * adjudicated but failed to refund leaves `upheld` with no `refundId`, which is
 * a state a reconciler can see — rather than a lost one.
 */
import { adjudicateProtectionClaimAction } from "@mohasinac/appkit/server";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";
import { z } from "zod";

/*
 * `ClaimFinding` is `"genuine" | "change-of-mind"`. Spelled as a Zod enum here
 * rather than imported as a type, because a type cannot validate a request
 * body — and `.strict()` means an admin cannot smuggle an `outcome` or a
 * `costBorneBy` past the rule above.
 */
const adjudicateSchema = z
  .object({
    finding: z.enum(["genuine", "change-of-mind"]),
  })
  .strict();

export const PATCH = withProviders(
  createRouteHandler<z.infer<typeof adjudicateSchema>>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:protection-claims:write",
    schema: adjudicateSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const result = await adjudicateProtectionClaimAction(id, body!.finding);

      /*
       * 🛑 UNWRAP THE ENVELOPE. `adjudicateProtectionClaimAction` is a
       * `"use server"` action returning `ActionResult<T>` — always truthy, so
       * `if (!result)` can never fire and `result.outcome` is silently
       * `undefined` (Root Cause #98). The action also throws a ValidationError
       * on an already-adjudicated claim, which `wrapAction` turns into
       * `ok: false` rather than an exception, so this branch is the only place
       * that case surfaces.
       */
      if (!result.ok) {
        return errorResponse(result.error ?? "Could not adjudicate this claim", 400);
      }
      return successResponse({ id, outcome: result.data.outcome });
    },
  }),
);
