import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  productRepository,
  normalizeError,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * POST /api/admin/products/bulk — set one boolean flag across a bounded set.
 *
 * 🛑 WHY THIS EXISTS: the admin products view used to do this CLIENT-side as
 * `selectedIds.forEach((id) => void handleToggle(id, field, value))` — a
 * fire-and-forget `forEach` of single-row PATCHes, unawaited and unthrottled.
 * Selecting 200 products and clicking "Feature" fired **200 concurrent
 * requests**, which is three separate problems:
 *
 *   - COST. 200 function invocations from one click, on a plan whose
 *     invocation cap the project has already exceeded (Rule #6). This is a
 *     budget item, not only a UX one.
 *   - NO PARTIAL-FAILURE REPORT. Each promise was discarded with `void`, so
 *     a row that 403'd or 500'd showed its own toast — up to 200 of them —
 *     and `clearSelection()` ran immediately regardless, so the admin could
 *     not tell which rows actually changed.
 *   - NO PROGRESS. The selection cleared before any request resolved, which
 *     reads as "done" the instant it is clicked.
 *
 * One request, one invocation, one result object naming every failure.
 *
 * Bounded at 50 to stay well inside the 10s sync ceiling — the same bound and
 * the same reasoning as `/api/admin/users/bulk`, which this mirrors
 * deliberately rather than inventing a second bulk shape. Heavier work belongs
 * in the async job primitive; 50 flag writes do not.
 */

const BULK_MAX = 50;

/**
 * The three flags the bulk bar offers. A closed enum on purpose: accepting an
 * arbitrary field name here would let any admin-writable boolean be set in
 * bulk without a per-field decision, and `featured`/`isPromoted`/`isOnSale`
 * are the three the UI actually exposes.
 */
const schema = z.object({
  field: z.enum(["featured", "isPromoted", "isOnSale"]),
  value: z.boolean(),
  ids: z.array(z.string().min(1)).min(1).max(BULK_MAX),
});

export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:products:write",
    schema,
    handler: async ({ body }) => {
      const { field, value, ids } = body!;
      // De-duplicate: a double-click or a stale selection can repeat an id,
      // and writing the same document twice in one batch is wasted budget.
      const unique = [...new Set(ids)];

      const updated: string[] = [];
      const failed: { id: string; reason: string }[] = [];

      /*
       * Sequential, deliberately. These are single-field writes on a bounded
       * set, so the wall-clock saving from parallelism is small, while a
       * `Promise.all` of 50 writes is exactly the unthrottled fan-out this
       * route exists to remove — moving it from the browser to the server
       * would not make it cheaper.
       *
       * Per-row try/catch so one bad id cannot discard the other 49: the
       * admin gets a list of what changed and a list of what did not.
       */
      for (const id of unique) {
        try {
          await productRepository.update(id, { [field]: value });
          updated.push(id);
        } catch (err) {
          const e = normalizeError(err);
          failed.push({ id, reason: e.message });
        }
      }

      return successResponse(
        {
          field,
          value,
          updated,
          failed,
          summary: {
            requested: unique.length,
            updated: updated.length,
            failed: failed.length,
          },
        },
        failed.length === 0
          ? `Updated ${updated.length} product${updated.length === 1 ? "" : "s"}.`
          : `Updated ${updated.length} of ${unique.length}; ${failed.length} failed.`,
      );
    },
  }),
);
