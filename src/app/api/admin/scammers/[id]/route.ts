import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  scammerRepository,
  ScammerStatusValues,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY, ROLES_TRUST_SAFETY } from "@/constants";
import type { ScammerDocument } from "@mohasinac/appkit";

const MSG_SCAMMER_NOT_FOUND = "Scammer profile not found.";

const patchSchema = z.object({
  // Derived from the runtime map, never restated — a hand-written copy here
  // would be one more independent enumeration of a union that already has
  // several (Recurrent Root Cause #61), and a wrong value in a status filter
  // matches zero rows in silence (#33).
  status: z.enum(ScammerStatusValues).optional(),
  verificationNote: z.string().optional(),
});

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_TRUST_SAFETY,
    permission: "admin:scammers:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const scammer = await scammerRepository.findById(id);
      if (!scammer) return errorResponse(MSG_SCAMMER_NOT_FOUND, 404);
      return successResponse(scammer);
    },
  }),
);

const __PATCH__g = withProviders(
  createRouteHandler<(typeof patchSchema)["_output"]>({
    auth: true,
    roles: ROLES_TRUST_SAFETY,
    permission: "admin:scammers:write",
    schema: patchSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id: string }).id;
      const scammer = await scammerRepository.findById(id);
      if (!scammer) return errorResponse(MSG_SCAMMER_NOT_FOUND, 404);

      const updates: Partial<ScammerDocument> & { updatedAt: Date } = {
        updatedAt: new Date(),
      };
      if (body!.status !== undefined) {
        updates.status = body!.status;
        if (body!.status === "verified" || body!.status === "rejected") {
          updates.verifiedBy = user!.uid;
          updates.verifiedAt = new Date();
        }
      }
      if (body!.verificationNote !== undefined) {
        updates.verificationNote = body!.verificationNote;
      }

      // Through `adminUpdate`, not a bare `update` — that is the funnel the
      // timeline entry is appended in, and `scammer` is already in hand from
      // the 404 check above so it costs no extra read.
      await scammerRepository.adminUpdate(
        id,
        updates,
        {
          actor: { role: "admin", uid: user!.uid },
          trigger: "adminScammerPatch",
          reason: body!.verificationNote,
        },
        scammer,
      );
      return successResponse({ id }, "Scammer profile updated");
    },
  }),
);

// Hard delete — admin only; employees may only update status (PATCH above).
const __DELETE__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: ROLES_ADMIN_ONLY,
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const scammer = await scammerRepository.findById(id);
      if (!scammer) return errorResponse(MSG_SCAMMER_NOT_FOUND, 404);
      await scammerRepository.delete(id);
      return successResponse({ id }, "Scammer profile deleted");
    },
  }),
);

export const GET = withFeatureGuard("SCAM_REGISTRY", __GET__g);
export const PATCH = withFeatureGuard("SCAM_REGISTRY", __PATCH__g);
export const DELETE = withFeatureGuard("SCAM_REGISTRY", __DELETE__g);
