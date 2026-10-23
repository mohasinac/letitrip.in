import { withProviders } from "@/providers.config";
/**
 * Admin Money Cases API — take, resolve, dismiss.
 *
 * `PATCH /api/admin/payment-cases/[id]`
 *
 * ## 🛑 Three things the client may NOT send, and why each matters
 *
 * `paymentCaseResolveUpdateSchema` is `.strict()`, so anything outside
 * `{ status, resolution }` is a 400 rather than a silent write. In particular:
 *
 *   · **`resolvedBy`.** `PaymentCasesRepository.resolve()` asserts
 *     `resolvedBy !== "system"`, and that assertion is the entire mechanism
 *     keeping a case human-closed — the design rule is that a reconciler which
 *     stops seeing a problem may write `selfHealedAt` and nothing else. A
 *     client-supplied `resolvedBy` would let any caller name itself whatever it
 *     liked and walk straight through the one guard.
 *   · **`resolvedAt`.** `reportReviewFormSchema`'s header records what happened
 *     when a sibling route allowed this: `new Date()` does not survive
 *     `JSON.stringify`, so an ISO **string** was written into a field declared
 *     `Date` and the collection ended up holding both shapes for one field.
 *   · **`severity`.** Escalate-only by design. A downgrade path would let the
 *     queue be quietened rather than worked.
 *
 * All three are stamped server-side from the session, or not at all.
 *
 * ## There is no DELETE
 *
 * A case is the record that something went wrong with money. Closing it is
 * `actioned` / `dismissed` with a reason; deleting it would remove the evidence
 * that it ever existed, which is the opposite of what the collection is for.
 * Retention is handled by `dailyDataCleanup`, which excludes anything an active
 * case references.
 */
import { paymentCasesRepository } from "@mohasinac/appkit/features/payment-cases/repository/payment-cases.repository";
/*
 * 🛑 The inferred type comes from appkit, never from `z.infer` here — the
 * consumer root is on zod 4 while appkit depends on zod 3, and v4's `infer`
 * applied to a v3 `ZodObject` silently resolves to `{}`. See the same note
 * on /api/admin/points.
 */
import {
  paymentCaseResolveUpdateSchema,
  type PaymentCaseResolveFormValues,
} from "@mohasinac/appkit/features/payment-cases/schemas/resolve-form";
import { PAYMENT_CASE_RESOLUTION_MIN } from "@mohasinac/appkit/features/payment-cases/schemas/firestore";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_ONLY } from "@/constants";

export const PATCH = withProviders(
  createRouteHandler<PaymentCaseResolveFormValues>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:payment-cases:write",
    schema: paymentCaseResolveUpdateSchema,
    handler: async ({ user, body, params }) => {
      const id = (params as { id: string }).id;
      const { status, resolution } = body!;

      /*
       * Taking a case is not resolving it. `assign` sets `under-review` and
       * records who is looking, and it deliberately takes no note — the
       * schema's own `superRefine` exempts this status from the resolution
       * floor for the same reason.
       */
      if (status === "under-review") {
        await paymentCasesRepository().assign(id, user!.uid);
        void recordAdminAction({
          actorUid: user!.uid,
          actorName: user!.name,
          action: AdminAuditActionValues.PAYMENT_CASE_DECISION,
          targetType: "paymentCase",
          targetId: id,
          metadata: { change: "claimed", status: status ?? null },
        });
        return successResponse({ id, status, assignedTo: user!.uid });
      }

      /*
       * Belt and braces, and not redundant: the schema's floor protects callers
       * that USE the schema, and `resolve()` throws on its own check — which
       * would surface as a 500. Checking here converts it into the 400 it
       * actually is, and narrows `resolution` from `string | undefined` to
       * `string` without a cast, so the type and the runtime agree.
       */
      const note = resolution?.trim() ?? "";
      if (note.length < PAYMENT_CASE_RESOLUTION_MIN) {
        return errorResponse(
          `Say what was done about this case — at least ${PAYMENT_CASE_RESOLUTION_MIN} characters.`,
          400,
        );
      }

      await paymentCasesRepository().resolve(id, {
        status,
        resolution: note,
        resolvedBy: user!.uid,
      });
      /*
       * A payment case is money a buyer says did not arrive, so resolving
       * one is a decision about whether the platform absorbs it. Both the
       * claim and the resolution are logged — who PICKED IT UP matters
       * when the same agent resolves their own claims in one direction.
       */
      void recordAdminAction({
        actorUid: user!.uid,
        actorName: user!.name,
        action: AdminAuditActionValues.PAYMENT_CASE_DECISION,
        targetType: "paymentCase",
        targetId: id,
        metadata: { change: "resolved", status: status ?? null },
      });
      return successResponse({ id, status, resolvedBy: user!.uid });
    },
  }),
);
