import { withProviders } from "@/providers.config";
/**
 * Admin single-offer API.
 *
 * GET   — read one offer (unmasked; admin-only surface).
 * PATCH — cancel it, by expiring it.
 *
 * Not feature-flag gated, for the same reason as the list route: an admin has
 * to be able to clear an in-flight offer after `featureFlags.offers` is
 * switched off.
 */
import { z } from "zod";
import { normalizeError } from "@mohasinac/appkit/errors/normalize";
import { offerDocumentToOffer } from "@mohasinac/appkit/server";
import { sendNotification } from "@mohasinac/appkit/features/admin/actions/notification-actions";
import { AdminAuditActionValues } from "@mohasinac/appkit/features/audit-log/schemas/firestore";
import { cartRepository } from "@mohasinac/appkit/features/cart/repository/cart.repository";
import { offerRepository } from "@mohasinac/appkit/features/seller/repository/offer.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { recordAdminAction } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD, ROLES_ADMIN_ONLY } from "@/constants";

const updateOfferSchema = z.object({
  status: z.literal("expired"),
  /**
   * Required, and actually read. It used to be `.optional()` AND the handler
   * never touched the body at all — so every cancellation reason an admin
   * typed was accepted and thrown away, and the buyer was told their offer
   * was cancelled with no explanation.
   *
   * A 10-char floor because "spam"/"no" is not a reason a buyer or a future
   * admin can act on, and this lands in a permanent audit record.
   */
  reason: z.string().min(10).max(300),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    // Gated on roles alone, matching every other ROLES_ADMIN_MOD route
    // (admin/addresses, admin/analytics, admin/audit-log). Pairing a
    // `permission` with a roles[] containing "moderator" locks moderators out
    // entirely — getServerPermissions() only resolves permissions for
    // "employee" — so the route would have been admin-only in practice despite
    // naming moderator. Enforced by audit-permission-role-mismatch.
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const offer = await offerRepository.findById(id);
      if (!offer) return errorResponse("Offer not found", 404);
      /*
       * 🛑 Through the adapter, not raw. `OfferRepository.mapDoc` does not
       * decrypt, so returning the document verbatim answered with `enc:v1:`
       * blobs for `buyerName` and `buyerEmail`.
       *
       * The LIST sibling already does this — `offerDocumentToOffer(o, {
       * buyerIdentity: "full" })` — and its own header explains that "admin
       * coordinates offers, so identity is in scope here". This detail route
       * was the half that was missed: Root Cause #38, for the fourth time in
       * this sweep.
       *
       * `"full"` matches the list rather than masking, deliberately: the two
       * views of one record must not disagree about what an admin can see,
       * and a masked detail page under a full list would read as data loss.
       */
      return successResponse(
        offerDocumentToOffer(offer, { buyerIdentity: "full" }),
      );
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof updateOfferSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:offers:write",
    schema: updateOfferSchema,
    handler: async ({ params, user, body }) => {
      const id = (params as { id: string }).id;
      // `body` is typed optional by createRouteHandler, but `schema` is set, so
      // a request that reached the handler has already parsed.
      const reason = body!.reason;
      const offer = await offerRepository.findById(id);
      if (!offer) return errorResponse("Offer not found", 404);

      // Order matters. Drop the locked cart line FIRST: leaving it behind keeps
      // the buyer's offer lane non-empty, and since the auction/offer lanes
      // outrank the standard one, that blocks their ENTIRE cart on an offer
      // that no longer exists. Same sequencing as the expiry sweep in
      // offerExpiry.ts, which is where this rule was first learned.
      await cartRepository.removeItemsByOfferId(offer.buyerUid, offer.id);
      // Pass the document, not the id: expireMany folds the history entry in
      // memory (arrayUnion cannot enforce the FIFO cap), and we already hold
      // the offer here — so this costs no extra read.
      await offerRepository.expireMany([offer], {
        actor: { uid: user!.uid, role: "admin" },
        trigger: "adminCancelOffer",
        reason,
        cancelledByAdminUid: user!.uid,
      });

      // Two records, deliberately. `adminAuditLog` answers "what have admins
      // done lately"; the offer's own statusHistory answers "what happened to
      // THIS offer" — and the buyer/store see the second, never the first.
      // Best-effort: a failed audit write must not fail a completed action.
      try {
        await recordAdminAction({
          actorUid: user!.uid,
          action: AdminAuditActionValues.OFFER_CANCEL,
          targetType: "offer",
          targetId: offer.id,
          targetLabel: offer.productTitle,
          reason,
          // buyerUid only — never a name or email. adminAuditLog is NOT
          // PII-encrypted, so identity must not be written into it.
          metadata: { buyerUid: offer.buyerUid, storeId: offer.storeId },
        });
      } catch (err) {
        const normalized = normalizeError(err);
        serverLogger.warn("adminAuditLog write failed for offer cancellation", {
          offerId: offer.id,
          actorUid: user!.uid,
          error: normalized.message,
        });
      }

      // Best-effort: the cancellation is already committed, and a failed
      // notification must not turn a completed admin action into an error.
      try {
        await sendNotification({
          userId: offer.buyerUid,
          type: "offer_expired",
          priority: "normal",
          title: "Offer cancelled",
          message: `Your offer on "${offer.productTitle}" was cancelled by an administrator. Reason: ${reason} You can make a new offer if the listing is still available.`,
          relatedId: offer.id,
          relatedType: "offer",
        });
      } catch (err) {
        // Intentionally swallowed — see above. // toast-intentionally-silent
        const normalized = normalizeError(err);
        serverLogger.warn("buyer notification failed after offer cancellation", {
          offerId: offer.id,
          buyerUid: offer.buyerUid,
          error: normalized.message,
        });
      }

      return successResponse(null, "Offer cancelled");
    },
  }),
);
