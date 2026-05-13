import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  errorResponse,
  scammerRepository,
} from "@mohasinac/appkit";

const patchSchema = z.object({
  status: z.enum(["pending_review", "verified", "rejected", "removed"]).optional(),
  verificationNote: z.string().optional(),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "employee"],
    permission: "admin:scammers:read",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const scammer = await scammerRepository.findById(id);
      if (!scammer) return errorResponse("Scammer profile not found", 404);
      return successResponse(scammer);
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof patchSchema)["_output"]>({
    auth: true,
    roles: ["admin", "employee"],
    permission: "admin:scammers:write",
    schema: patchSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id: string }).id;
      const scammer = await scammerRepository.findById(id);
      if (!scammer) return errorResponse("Scammer profile not found", 404);

      const updates: Record<string, unknown> = {};
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
      updates.updatedAt = new Date();

      await scammerRepository.update(id, updates as any);
      return successResponse({ id }, "Scammer profile updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    permission: "admin:scammers:delete",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const scammer = await scammerRepository.findById(id);
      if (!scammer) return errorResponse("Scammer profile not found", 404);
      await scammerRepository.delete(id);
      return successResponse({ id }, "Scammer profile deleted");
    },
  }),
);
