import { withProviders } from "@/providers.config";
/**
 * Grievance intake.
 *
 * `POST /api/grievance`
 *
 * ## Why this exists at all
 *
 * The Consumer Protection (E-Commerce) Rules 2020 require a grievance channel,
 * and before this there was none: `/grievance` published prose and a `mailto:`,
 * so nothing recorded a grievance, timestamped it, or started a clock. "How
 * long do complaints take" had no answerable form.
 *
 * ## 🛑 It records a clock; it PUBLISHES no promise
 *
 * `fileGrievanceAction` stamps `acknowledgedAt` synchronously and computes
 * `dueAt` from CONFIGURABLE periods — and this route returns `dueAt` to the
 * filer because telling someone when to expect an answer is the point of an
 * acknowledgement.
 *
 * What is deliberately NOT here is a published statutory timeline on the public
 * page. The exact acknowledgement and resolution periods applicable to this
 * business have not been supplied, and a published timeline we then miss is
 * worse than the present silence. So the clock runs and is evidenced; only the
 * public claim waits.
 *
 * ## Authenticated, and that is not a barrier being added
 *
 * `fileGrievanceAction` requires a user because a grievance is tied to a
 * person and usually to an order — an anonymous complaint cannot be
 * acknowledged to anybody, cannot be matched to a purchase, and cannot have
 * its resolution delivered. The form says so rather than failing at submit.
 */
import { fileGrievanceAction } from "@mohasinac/appkit/server";
import { successResponse, errorResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { applyRateLimit, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { z } from "zod";
import { grievanceFormSchema } from "@/validation/grievance-schema";

/*
 * Mirrors the action's own floors. `detail` has a real minimum because a
 * complaint with no account of the problem cannot be investigated OR evidenced
 * — and evidencing it is half of why the record exists.
 *
 * 🛑 MOVED to `src/validation/grievance-schema.ts` so the intake form parses
 * against the same object. It was declared inline here while `<GrievanceForm>`
 * hand-rolled its own SUBJECT_MIN/DETAIL_MIN constants — two definitions of
 * one contract, agreeing only by luck.
 */
const grievanceSchema = grievanceFormSchema;

export const POST = withProviders(
  createRouteHandler<z.infer<typeof grievanceSchema>>({
    auth: true,
    schema: grievanceSchema,
    handler: async ({ request, body }) => {
      /*
       * Rate-limited because this endpoint WRITES a durable record and opens a
       * `paymentCases` row. Unlimited, it is a way to fill the operator queue
       * with noise, which costs the queue its usefulness — the thing a
       * grievance channel most needs to keep.
       */
      /*
       * 🛑 `applyRateLimit` returns a RESULT, not a Response. I first wrote
       * `if (limited) return limited`, which is always truthy — so the limit
       * would have refused EVERY request with a non-Response body. Same shape
       * as Root Cause #98 one layer down, and the established spelling is
       * `if (!rl.success)`, which every auth route already uses.
       */
      const rl = await applyRateLimit(request, RateLimitPresets.STRICT);
      if (!rl.success) return errorResponse("Too many requests. Please slow down.", 429);

      const result = await fileGrievanceAction({
        subject: body!.subject,
        detail: body!.detail,
        ...(body!.orderId ? { orderId: body!.orderId } : {}),
        ...(typeof body!.disputedAmount === "number"
          ? { disputedAmount: body!.disputedAmount }
          : {}),
      });
      /*
       * 🛑 UNWRAP. `ActionResult` is always truthy (Root Cause #98). The action
       * owns the subject and detail floors and the acknowledgement stamp, so a
       * refusal arrives here as `ok: false` rather than as a throw.
       */
      if (!result.ok) {
        return errorResponse(result.error ?? "Could not file this grievance", 400);
      }
      return successResponse(result.data);
    },
  }),
);
