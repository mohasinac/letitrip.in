import { withProviders } from "@/providers.config";
import { z } from "zod";
import { createRouteHandler, successResponse } from "@mohasinac/appkit";
import { scammerRepository } from "@mohasinac/appkit";

const createReportSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(200),
  phones: z.string().optional().default(""),
  upiIds: z.string().optional().default(""),
  emails: z.string().optional().default(""),
  scamType: z.string().min(1, "Scam type is required"),
  scamPlatform: z.string().min(1, "Platform is required"),
  amountLost: z.number().min(0).optional(),
  itemInvolved: z.string().optional().default(""),
  description: z
    .string()
    .min(100, "Description must be at least 100 characters")
    .max(5000),
  reportedByAnon: z.boolean().default(false),
});

function parseCommaSeparated(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const POST = withProviders(
  createRouteHandler<(typeof createReportSchema)["_output"]>({
    auth: true,
    schema: createReportSchema,
    handler: async ({ body, user }) => {
      const {
        displayName,
        phones: rawPhones,
        upiIds: rawUpiIds,
        emails: rawEmails,
        scamType,
        scamPlatform,
        amountLost,
        itemInvolved,
        description,
        reportedByAnon,
      } = body!;

      const phones = parseCommaSeparated(rawPhones);
      const upiIds = parseCommaSeparated(rawUpiIds);
      const emails = parseCommaSeparated(rawEmails);

      // Basic rate-limit: check pending reports count for this user.
      // Full enforcement (querying Firestore for pending count) is deferred.
      // For now we validate fields and create the document.

      const amountLostPaise =
        amountLost !== undefined && amountLost > 0
          ? Math.round(amountLost * 100)
          : undefined;

      const scammer = await scammerRepository.create({
        displayNames: [displayName],
        phones,
        upiIds,
        emails,
        socialMedia: [],
        scamType: scamType as Parameters<typeof scammerRepository.create>[0]["scamType"],
        scamPlatform:
          scamPlatform as Parameters<typeof scammerRepository.create>[0]["scamPlatform"],
        description,
        ...(amountLostPaise !== undefined && { amountLost: amountLostPaise }),
        ...(itemInvolved && itemInvolved.trim() && { itemInvolved: itemInvolved.trim() }),
        evidence: [],
        reportedBy: user!.uid,
        reportedByAnon,
      });

      return successResponse(
        { id: scammer.id },
        "Report submitted successfully",
        201,
      );
    },
  }),
);
