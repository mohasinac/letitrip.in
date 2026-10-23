/**
 * PATCH /api/admin/dispute-reasons/[id] — retire or reactivate one reason.
 *
 * 🛑 There is no DELETE, and one must not be added. A past dispute names this
 * row; the schema's own header spells out why retiring is soft — deleting would
 * *"orphan that record and take the author with it"*. The order snapshots the
 * reason's LABEL, so a buyer's dispute keeps saying what it said either way,
 * but the row itself is the only record of who added the wording and when.
 *
 * The body is `{ isActive: boolean }` — one field, both directions. An `action`
 * string ("retire" | "reactivate") would be a second vocabulary for the one
 * boolean the document actually stores, and the two could then disagree.
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { disputeReasonsRepository } from "@mohasinac/appkit/features/dispute-reasons/repository/dispute-reasons.repository";
import { recordAdminAction } from "@mohasinac/appkit/server";
import { AdminAuditActionValues } from "@mohasinac/appkit/features/audit-log/schemas/firestore";
/* 🛑 The DEFINING module, never the `@/constants` barrel — see the list route. */
import { ROLES_BACK_OFFICE } from "@/constants/api-roles";

const patchSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export const PATCH = withProviders(
  createRouteHandler<(typeof patchSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:support-tickets:write",
    schema: patchSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as Record<string, string>).id;

      /*
       * Read first so a 404 is a 404. Without this, retiring a mistyped id
       * would be a successful-looking no-op — `update` on a missing document
       * is not an error anyone sees, which is Root Cause #40's shape.
       */
      const existing = await disputeReasonsRepository.findById(id);
      if (!existing) return errorResponse("Dispute reason not found", 404);

      if (existing.isActive === body!.isActive) {
        /*
         * Already in the requested state. Returned as success rather than a
         * conflict: two agents clicking Retire on the same row both wanted the
         * same outcome and both got it. No audit row, because nothing changed.
         */
        return successResponse({ reason: existing, changed: false });
      }

      if (body!.isActive) {
        await disputeReasonsRepository.reactivate(id);
      } else {
        await disputeReasonsRepository.retire(id);
        /*
         * Only the RETIRE is audited — see `DISPUTE_REASON_RETIRE`'s own note.
         * Retiring removes an option buyers could pick, so "who narrowed the
         * list" is the question a dispute-trend audit needs; putting a row
         * back restores the documented default.
         */
        await recordAdminAction({
          actorUid: user!.uid,
          actorName: user!.name ?? undefined,
          action: AdminAuditActionValues.DISPUTE_REASON_RETIRE,
          targetType: "disputeReason",
          targetId: existing.id,
          targetLabel: existing.label,
          metadata: { kind: existing.kind },
        }).catch(() => {
          /* best-effort: a failed audit write must never fail the retire */
        });
      }

      return successResponse({
        reason: { ...existing, isActive: body!.isActive },
        changed: true,
      });
    },
  }),
);
