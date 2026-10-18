import { withProviders } from "@/providers.config";
/**
 * Retry a run — as a NEW named run, resuming where it is safe to.
 *
 * POST /api/admin/sticker-sheets/{id}/runs/{runId}/retry
 *
 * 🛑 THE RESPONSE CARRIES THE CLAMP, AND THE UI MUST SHOW IT. `resumeStage` is
 * `max(requested, earliestChangedParamStage)` — so asking to resume from
 * `parts` while having changed a ridge threshold restarts from `ridge` instead,
 * and `notice` is the sentence that says so.
 *
 * Without the clamp the run's stored artifacts would have been generated under
 * DIFFERENT parameters than the run records, and nothing anywhere would
 * contradict it: the parts would look plausible, the run would say
 * `precise, hysteresisLow 0.3`, and the two would have nothing to do with each
 * other. That is the same class of silent lie as a mirror field drifting from
 * its source (Root Cause #42), which is why the parameter grouping by stage is
 * structural rather than a convention.
 *
 * Applying it silently would be only half a fix — an operator who asked for a
 * fast resume and got a full re-trace needs to know WHY, or the tool looks
 * broken. So the clamp is returned, never swallowed.
 */
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { retryStickerTraceRun } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { z } from "zod";

const bodySchema = z.object({
  /** 🛑 Required, exactly as on a first run — a retry is a new named attempt. */
  name: z.string().min(1).max(160),
  tier: z.enum(["draft", "standard", "precise", "max"]),
  /*
   * Where the operator ASKED to resume from. The action may move it later; it
   * can never move it earlier, which is the only direction that would be unsafe.
   */
  requestedResumeStage: z
    .enum([
      "decode",
      "prefilter",
      "ridge",
      "flood",
      "segment",
      "cluster",
      "geometry",
      "parts",
      "exports",
    ])
    .optional(),
  paramOverrides: z.record(z.string(), z.number().finite()).optional(),
});

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    schema: bodySchema,
    handler: async ({ user, params, body }) => {
      const p = params as { id: string; runId: string };

      const result = await retryStickerTraceRun({
        sheetId: p.id,
        sourceRunId: p.runId,
        name: body!.name,
        tier: body!.tier,
        requestedBy: user!.uid,
        requestedResumeStage: body!.requestedResumeStage,
        paramOverrides: body!.paramOverrides,
      });

      return successResponse(result, "Retry started");
    },
  }),
);
