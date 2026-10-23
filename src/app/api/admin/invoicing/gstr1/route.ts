import { withProviders } from "@/providers.config";
import { z } from "zod";
import { buildGstr1Export, gstr1ToCsv } from "@mohasinac/appkit/server";
import { ApiErrors } from "@mohasinac/appkit/next/api/api-response";
import { ValidationError } from "@mohasinac/appkit";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * GSTR-1 export (Phase 7d)
 *
 * GET /api/admin/invoicing/gstr1?from=2026-04-01&to=2026-06-30 → CSV
 *
 * ## 🛑 This is the INPUT to a human filing, never a filing
 *
 * Nothing here talks to the GST portal — there is no webhook facility in
 * existence and no GSP contract. The CSV is what an accountant opens, checks
 * against their own figures and uses. The filename and the file's own warning
 * rows say so; labelling it "filed" anywhere would be the most consequential
 * lie in this codebase.
 *
 * ## Admin only, and not granted to `maintenance_employee`
 *
 * It exports every buyer's place of supply and every invoice number for a
 * quarter. That is not a maintenance diagnostic — it is the company's tax
 * position plus a slice of customer data, and the distinction is the same one
 * that put `/admin/money-cases` under Finance rather than Maintenance.
 */
const windowSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
});

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "settings:write",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const parsed = windowSchema.safeParse({
        from: url.searchParams.get("from") ?? "",
        to: url.searchParams.get("to") ?? "",
      });
      if (!parsed.success) {
        /*
         * `throw new ValidationError(message, issues)` rather than a bare
         * `badRequest` string: `mapToHttpError` recognises it, maps it to a
         * 400 carrying `issues`, and the caller gets the FIELD that failed
         * instead of one sentence covering both. Discarding `parsed.error`
         * threw away the only part of the result worth having.
         */
        throw new ValidationError(
          "`from` and `to` dates are required (YYYY-MM-DD).",
          parsed.error.issues,
        );
      }

      const from = new Date(`${parsed.data.from}T00:00:00.000Z`);
      /*
       * 🛑 The `to` day is INCLUSIVE, to the last millisecond. A quarter-end
       * export run with `to=2026-06-30` must include everything invoiced on
       * 30 June — a midnight boundary would silently drop that whole day from
       * the return, which is the kind of error that is invisible until an
       * assessment.
       */
      const to = new Date(`${parsed.data.to}T23:59:59.999Z`);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return ApiErrors.badRequest("Dates must be YYYY-MM-DD.");
      }
      if (from > to) {
        return ApiErrors.badRequest("`from` must not be after `to`.");
      }

      const data = await buildGstr1Export(from, to);
      const csv = gstr1ToCsv(data);

      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          // Named for what it is — a draft an accountant works from.
          "Content-Disposition": `attachment; filename="gstr1-draft-${parsed.data.from}-to-${parsed.data.to}.csv"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    },
  }),
);
