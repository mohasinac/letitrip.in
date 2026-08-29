import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  userRepository,
  isAdminUser,
  normalizeError,
  serverLogger,
} from "@mohasinac/appkit";
import { getAdminAuth } from "@mohasinac/appkit/server";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * POST /api/admin/users/bulk
 *
 * Bounded (<=50 rows) two-pass bulk action — well under the Vercel Hobby 10s
 * sync ceiling, so this stays a plain route (not the async job primitive;
 * see CLAUDE.md Rule #6 and the async-jobs primitive used by
 * hard-ban/payouts-weekly for the heavier cascades).
 *
 * "suspend" and "delete" are the same operation today (soft-disable via
 * Firebase Auth `disabled: true` + Firestore `isDisabled: true` — no
 * cascade, no real data deletion). "restore" re-enables. Skips (never
 * fails the batch) targets that are the acting admin or another admin.
 */

const BULK_MAX = 50;

const schema = z.object({
  action: z.enum(["suspend", "restore", "delete"]),
  ids: z.array(z.string()).min(1).max(BULK_MAX),
});

export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:users:write",
    schema,
    handler: async ({ body, user }) => {
      const { action, ids } = body!;
      const disabled = action !== "restore";

      const targets = await Promise.all(ids.map((id) => userRepository.findById(id)));

      const succeeded: string[] = [];
      const skipped: string[] = [];
      const failed: { id: string; reason: string }[] = [];

      await Promise.all(
        ids.map(async (id, i) => {
          const target = targets[i];
          if (!target) {
            skipped.push(id);
            return;
          }
          if (id === user!.uid || isAdminUser(target)) {
            skipped.push(id);
            return;
          }
          try {
            try {
              await getAdminAuth().updateUser(id, { disabled });
            } catch (err) {
              void normalizeError(err);
              serverLogger.warn("users/bulk: Auth disable/enable failed (user may lack Auth record)", {
                id,
                error: err instanceof Error ? err.message : String(err),
              });
            }
            // BOTH fields — `disabled` is what every session guard reads, and
            // this route only ever wrote `isDisabled`, so a bulk suspend never
            // ended an existing session.
            await userRepository.update(id, { disabled, isDisabled: disabled } as never);
            succeeded.push(id);
          } catch (err) {
            void normalizeError(err);
            failed.push({ id, reason: err instanceof Error ? err.message : String(err) });
          }
        }),
      );

      return successResponse({
        action,
        summary: {
          total: ids.length,
          succeeded: succeeded.length,
          skipped: skipped.length,
          failed: failed.length,
        },
        succeeded,
        skipped,
        failed,
      });
    },
  }),
);
