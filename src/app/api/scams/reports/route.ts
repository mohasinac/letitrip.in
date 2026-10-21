import { withProviders } from "@/providers.config";
import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { scammerRepository, SCAM_TYPES, type ScamType } from "@mohasinac/appkit";

/*
 * The scam-type guard, derived from the one array that defines the ids.
 *
 * 🛑 This is a MIRROR of appkit's `isScamType`, and it is written out here only
 * because this route typechecks against the installed `dist/*.d.ts`, which does
 * not carry that export until appkit is next published. Collapse these two
 * lines to `import { isScamType }` at that point — the rule is one rule over
 * one data source (`SCAM_TYPES`), never a second list of literals, so the two
 * cannot disagree about which ids are real.
 */
const SCAM_TYPE_IDS: ReadonlySet<string> = new Set(SCAM_TYPES.map((t) => t.id));
const isScamTypeId = (value: string): value is ScamType => SCAM_TYPE_IDS.has(value);

const createReportSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(200),
  phones: z.string().optional().default(""),
  upiIds: z.string().optional().default(""),
  emails: z.string().optional().default(""),
  /*
   * One of the 27 documented ids, not any non-empty string.
   *
   * `min(1)` is what let the form's free-text input (it had no `kind: "select"`,
   * so the option list it was handed was ignored) persist whatever was typed.
   * Nothing downstream would have caught it: `scammerRepository.create` does no
   * enum check, so the value stored and then matched no chip in the registry
   * and no key in `SCAM_TYPE_LABELS` — a report filed under a type that does
   * not exist, invisible to every filter, with its profile showing no type.
   *
   * Narrowing here also retires the `as Parameters<…>` cast below: the cast was
   * asserting exactly the fact this refine now proves.
   */
  scamType: z
    .string()
    .trim()
    .refine(isScamTypeId, { message: "Scam type must be one of the documented patterns" }),
  scamPlatform: z.string().min(1, "Platform is required"),
  amountLost: z.number().min(0).optional(),
  itemInvolved: z.string().optional().default(""),
  description: z
    .string()
    .min(100, "Description must be at least 100 characters")
    .max(5000),
  reportedByAnon: z.boolean().default(false),
  /*
   * The truthfulness declaration.
   *
   * The form has always required it — a `z.literal(true)` and a hard submit
   * gate — and never sent it, so a direct call to this route bypassed the
   * attestation entirely and nothing recorded that it had been made. Required
   * here, not optional: a report that does not carry it should not be created.
   */
  agreed: z.literal(true, { message: "You must confirm this report is truthful." }),
});

function parseCommaSeparated(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const __POST__g = withProviders(
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
        agreed,
      } = body!;

      const phones = parseCommaSeparated(rawPhones);
      const upiIds = parseCommaSeparated(rawUpiIds);
      const emails = parseCommaSeparated(rawEmails);

      // Basic rate-limit: check pending reports count for this user.
      // Full enforcement (querying Firestore for pending count) is deferred.
      // For now we validate fields and create the document.

      const amountLostRupees =
        amountLost !== undefined && amountLost > 0
          ? Math.round(amountLost * 100) / 100
          : undefined;

      const scammer = await scammerRepository.create({
        displayNames: [displayName],
        phones,
        upiIds,
        emails,
        socialMedia: [],
        scamType,
        scamPlatform:
          scamPlatform as Parameters<typeof scammerRepository.create>[0]["scamPlatform"],
        description,
        ...(amountLostRupees !== undefined && { amountLost: amountLostRupees }),
        ...(itemInvolved && itemInvolved.trim() && { itemInvolved: itemInvolved.trim() }),
        evidence: [],
        reportedBy: user!.uid,
        reportedByAnon,
        // `z.literal(true)` narrows to the widened `Literal` type in zod 4, so
        // the boolean is asserted at the one place it is known to be `true`.
        reporterAttested: agreed === true,
      });

      return successResponse(
        { id: scammer.id },
        "Report submitted successfully",
        201,
      );
    },
  }),
);

export const POST = __POST__g;
