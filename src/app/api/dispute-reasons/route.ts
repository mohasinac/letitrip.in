/**
 * GET  /api/dispute-reasons?kind=item|not_reached   — the picker's list
 * POST /api/dispute-reasons                          — staff add a reason
 *
 * The list is staff-curated and buyer-selected. See
 * `_internal/shared/features/orders/dispute-reasons.ts` for why the KIND is
 * closed in code while the reasons are data: a gate cannot branch on a
 * user-created string, so a row carries a kind and inherits its gate.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { disputeReasonsRepository } from "@mohasinac/appkit/features/dispute-reasons/repository/dispute-reasons.repository";
/*
 * 🛑 From the BARREL, not `@mohasinac/appkit/_internal/...` — appkit declares
 * no `./_internal/*` subpath export, so that path does not resolve at all.
 * `_internal` is reachable only through a barrel, which is what the
 * `RETURN_REASON` family beside these already relies on.
 */
import { DISPUTE_KIND, isDisputeKind } from "@mohasinac/appkit";
import { DISPUTE_REASON_LABEL_MAX } from "@mohasinac/appkit/features/dispute-reasons/schemas/firestore";
import { recordAdminAction } from "@mohasinac/appkit/server";
import { AdminAuditActionValues } from "@mohasinac/appkit/features/audit-log/schemas/firestore";
/*
 * 🛑 From `@/constants/api-roles`, the DEFINING module — never the `@/constants`
 * barrel.
 *
 * That barrel re-exports `./navigation` (index.ts:49), and `navigation.tsx:45`
 * imports `@mohasinac/appkit/client`. Pulling the `"use client"` entry into a
 * SERVER graph instantiates appkit a second time under the client condition,
 * and that second instance has its own EMPTY provider registry — so
 * `initProviders()` registers the session provider into one copy while
 * `createRouteHandler` reads the other, and the route answers 401
 * UNAUTHENTICATED to every valid session. The whole cost is one import string.
 *
 * Measured 2026-10-22: both halves are still live. Several existing routes do
 * import from the barrel; this one does not add to them.
 */
import { ROLES_AUTHENTICATED, ROLES_BACK_OFFICE } from "@/constants/api-roles";

/*
 * Any authenticated user, because a BUYER is the primary reader — this is the
 * list in their dispute form. There is nothing sensitive in it: eleven short
 * strings and the name of whoever added each one.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_AUTHENTICATED],
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const kind = getStringParam(searchParams, "kind");

      /*
       * 🛑 `kind` is REQUIRED, not optional-with-a-merged-fallback.
       *
       * A buyer reporting a damaged item must never be offered "it never
       * arrived": that reason belongs to the other gate, so picking it
       * produces a dispute the action then refuses — which reads to the buyer
       * as the form being broken rather than as the wrong choice. Returning
       * every reason when the caller forgets the param is precisely how that
       * happens.
       */
      if (!kind || !isDisputeKind(kind)) {
        return errorResponse(
          `kind is required and must be one of: ${DISPUTE_KIND.join(", ")}`,
          400,
          { code: "INVALID_KIND" },
        );
      }

      const result = await disputeReasonsRepository.listActiveByKind(kind, {
        page: 1,
        pageSize: 50,
        sorts: "label",
      });

      return successResponse({
        items: result.items.map((r) => ({
          id: r.id,
          label: r.label,
          kind: r.kind,
          /*
           * Shown in the STAFF picker so an agent can see whose wording a
           * reason is. Harmless to a buyer — it is a staff display name, not
           * contact detail — and withholding it would mean two shapes for one
           * list.
           */
          createdByName: r.createdByName,
        })),
        total: result.total,
      });
    },
  }),
);

const createSchema = z.object({
  label: z.string().trim().min(3).max(DISPUTE_REASON_LABEL_MAX),
  /*
   * 🛑 `z.enum` over the shipped union, so a body naming a kind that does not
   * exist is a 400 here rather than a row whose gate nobody can evaluate.
   */
  kind: z.enum(DISPUTE_KIND),
});

/*
 * ROLES_BACK_OFFICE = [ADMIN, EMPLOYEE] — the owner's "staff" tier. Its own
 * comment in api-roles.ts calls it "the one pairing where a declared
 * permission is actually consulted and never a guaranteed 403", which is
 * exactly what this needs: support agents add reasons while triaging, buyers
 * and sellers cannot.
 */
export const POST = withProviders(
  createRouteHandler<(typeof createSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    /*
     * A REAL member of the closed `Permission` union — checked, not invented.
     * A first draft said `"support:write"`, which does not exist; the union in
     * `features/auth/permissions/constants.ts` spells it with the `admin:`
     * prefix, and an unlisted string would not have compiled.
     *
     * Reusing the support-ticket permission rather than minting a new one:
     * whoever triages tickets is exactly who should be able to add the reason
     * a ticket keeps arriving about, and a permission with one route behind it
     * is a role in disguise.
     */
    permission: "admin:support-tickets:write",
    schema: createSchema,
    handler: async ({ body, user }) => {
      const { reason, created } = await disputeReasonsRepository.createReason({
        label: body!.label,
        kind: body!.kind,
        createdByUid: user!.uid,
        createdByName: user!.name ?? user!.uid,
      });

      /*
       * Audit-logged, and only on a real creation. Re-adding wording that
       * already exists returns the existing row (see `createReason`) and is
       * not an act worth recording — logging it would fill the audit trail
       * with agents discovering the list already had what they wanted.
       */
      if (created) {
        await recordAdminAction({
          actorUid: user!.uid,
          actorName: user!.name ?? undefined,
          // From the closed enum, never a literal — `AdminAuditAction` is
          // derived from this map, so a typo'd string would not compile.
          action: AdminAuditActionValues.DISPUTE_REASON_CREATE,
          targetType: "disputeReason",
          targetId: reason.id,
          targetLabel: reason.label,
          metadata: { kind: reason.kind },
        }).catch(() => {
          /* best-effort: a failed audit write must never fail the create */
        });
      }

      return successResponse({ reason, created });
    },
  }),
);
