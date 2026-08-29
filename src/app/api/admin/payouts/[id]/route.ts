import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  payoutRepository,
  adminUpdatePayout,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * Admin Single Payout API
 *
 * GET   /api/admin/payouts/[id] — Fetch one payout by ID.
 * PATCH /api/admin/payouts/[id] — Update payout status (pending/processing/paid/failed) + transaction reference via adminUpdatePayout.
 *
 * Status literals here match `payoutRepository`'s actual stored values
 * ("paid", not "completed") — the local `PAYOUT_FIELDS.STATUS_VALUES`
 * constant in `@/constants` disagrees with the repository and is not used.
 */

const updatePayoutSchema = z.object({
  status: z.enum(["pending", "processing", "paid", "failed"]),
  /**
   * The payment reference (UTR / UPI ref / bank transfer id). Required by the
   * mark-paid modal, declared here since day one, and DISCARDED by
   * `adminUpdatePayout` until 2026-08-26 because it was absent from
   * `PAYOUT_ADMIN_UPDATEABLE_FIELDS` — while this handler echoed it back in
   * the 200 as though it had been stored.
   */
  transactionId: z.string().optional(),
  /**
   * Renamed from `notes`. The document field is `adminNote`, and
   * `adminUpdatePayout` picks by field name — so a `notes` value validated
   * cleanly and was then dropped on the floor. No caller sent one, which is
   * the only reason it never surfaced as a bug report.
   */
  adminNote: z.string().optional(),
}).strict();

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const payout = await payoutRepository.findById(id);
      if (!payout) return errorResponse("Payout not found", 404);
      return successResponse(payout);
    },
  }),
);
export const GET = __GET__g;

const __PATCH__g = withProviders(
  createRouteHandler<(typeof updatePayoutSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    schema: updatePayoutSchema,
    handler: async ({ user, params, body }) => {
      const id = (params as { id: string }).id;
      // Return the STORED document, not an echo of the submission — echoing
      // the request back is what made the dropped `transactionId` invisible
      // for as long as it was.
      const updated = await adminUpdatePayout(user!.uid, id, body!);
      return successResponse(updated, "Payout updated");
    },
  }),
);
export const PATCH = __PATCH__g;
