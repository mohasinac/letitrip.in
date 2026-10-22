import { withProviders } from "@/providers.config";
/**
 * Buyer protection claim — what can be claimed, and filing it.
 *
 * `GET`  — per-REASON availability, so the form offers only reasons that can
 *          actually be filed right now.
 * `POST` — file the claim.
 *
 * ## 🛑 Availability is computed PER REASON, not per cover kind
 *
 * The cover kind is derived from the reason (`REASON_TO_KIND`) and is never
 * taken from the caller — otherwise a buyer could file a non-delivery against
 * the 7-day SALE window after the 48-hour TRANSIT window had closed, which is
 * the window rule defeated by a dropdown.
 *
 * The consequence for this endpoint is that "can this order be claimed?" has
 * no single answer. Transit cover may be bought and its window closed while
 * sale cover is still open, or either may not have been bought at all. So the
 * GET returns one verdict per reason, and the form renders only the claimable
 * ones — rather than showing six reasons and rejecting four of them after the
 * buyer has written a description.
 *
 * ## The reasons are not filtered on the client
 *
 * `canClaimProtection` reads the order's fees, the existing claim and the
 * obligation window. Shipping that to the browser would mean publishing which
 * protections were bought and when each window shuts; the verdict is one
 * boolean and a code, which is all the form needs.
 */
import { canClaimProtection, fileProtectionClaimAction } from "@mohasinac/appkit/server";
import { orderRepository } from "@mohasinac/appkit";
import {
  REASON_TO_KIND,
  PROTECTION_CLAIM_DETAIL_MIN,
  PROTECTION_CLAIM_DETAIL_MAX,
  type ProtectionClaimReason,
} from "@mohasinac/appkit/features/protection-claims/schemas/firestore";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { z } from "zod";

const REASONS = Object.keys(REASON_TO_KIND) as ProtectionClaimReason[];

/**
 * Why a reason is unavailable, in words a buyer can act on.
 *
 * 🛑 "not-covered" must NOT read as a refusal. The buyer did not buy that
 * cover, which is a fact about the order rather than a judgement about them —
 * and phrasing it as a denial is how a support ticket gets raised about a
 * product that was never purchased.
 */
const UNAVAILABLE_COPY: Record<string, string> = {
  "not-covered": "This order does not include that cover.",
  "already-claimed": "A claim has already been filed on that cover for this order.",
  "window-closed": "The window for claiming that cover on this order has closed.",
};

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const id = (params as { id: string }).id;
      const order = await orderRepository.findById(id);
      if (!order) return errorResponse("Order not found", 404);
      /*
       * `NotFound`, not Forbidden — the response must not confirm that an order
       * exists to someone who does not own it. Same choice
       * `getOrderByIdForUser` makes, and for the same reason.
       */
      if (order.userId !== user!.uid) return errorResponse("Order not found", 404);

      /*
       * 🛑 Unwrap the envelope, and treat a FAILED call as "cannot claim"
       * rather than as a verdict. `canClaimProtection` returns an
       * `ActionResult` now; its rejected form is a resolved promise, so
       * reading `.can` off the envelope would be `undefined` — falsy, which
       * happens to look right while meaning nothing. Saying so explicitly is
       * what keeps "the window is closed" distinct from "we could not check".
       */
      const verdicts = await Promise.all(
        (["shipping", "sale"] as const).map(async (kind) => {
          const res = await canClaimProtection(order, kind);
          return [
            kind,
            res.ok ? res.data : { can: false, reason: "check-failed" },
          ] as const;
        }),
      );
      const byKind = Object.fromEntries(verdicts);

      return successResponse({
        reasons: REASONS.map((reason) => {
          const v = byKind[REASON_TO_KIND[reason]];
          return {
            reason,
            can: v.can,
            ...(v.can
              ? {}
              : {
                  why: v.reason,
                  message: UNAVAILABLE_COPY[v.reason ?? ""] ?? "That cover cannot be claimed.",
                }),
          };
        }),
        detailMin: PROTECTION_CLAIM_DETAIL_MIN,
        detailMax: PROTECTION_CLAIM_DETAIL_MAX,
      });
    },
  }),
);

/*
 * `reason` is a Zod enum over the real union keys, so a value outside it is a
 * 400 rather than a lookup that silently resolves to `undefined` and files
 * against the wrong cover.
 *
 * 🛑 `kind` is deliberately NOT a field. It is derived from the reason, and
 * accepting it here would hand the caller back exactly the dropdown the
 * derivation exists to remove.
 */
const fileSchema = z
  .object({
    reason: z.enum(REASONS as [ProtectionClaimReason, ...ProtectionClaimReason[]]),
    detail: z.string().min(PROTECTION_CLAIM_DETAIL_MIN).max(PROTECTION_CLAIM_DETAIL_MAX),
    itemIds: z.array(z.string().min(1).max(300)).max(50).optional(),
    evidenceUrls: z.array(z.string().max(500)).max(6).optional(),
  })
  .strict();

export const POST = withProviders(
  createRouteHandler<z.infer<typeof fileSchema>>({
    auth: true,
    schema: fileSchema,
    handler: async ({ body, params }) => {
      const id = (params as { id: string }).id;
      const result = await fileProtectionClaimAction({
        orderId: id,
        reason: body!.reason,
        detail: body!.detail,
        ...(body!.itemIds?.length ? { itemIds: body!.itemIds } : {}),
        ...(body!.evidenceUrls?.length ? { evidenceUrls: body!.evidenceUrls } : {}),
      });
      /*
       * 🛑 UNWRAP. `ActionResult` is always truthy — `if (!result)` can never
       * fire and `result.claimId` is silently undefined (Root Cause #98). The
       * action owns ownership, the window, the fee check and the one-claim-per
       * (order, kind) rule, so every refusal arrives here as `ok: false`.
       */
      if (!result.ok) {
        return errorResponse(result.error ?? "Could not file this claim", 400);
      }
      return successResponse(result.data);
    },
  }),
);
