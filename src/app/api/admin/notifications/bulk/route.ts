import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  notificationRepository,
  normalizeError,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";

/**
 * POST /api/admin/notifications/bulk
 *
 * Bounded (<=50 rows) two-pass bulk action — well under the Vercel Hobby 10s
 * sync ceiling, so this stays a plain route (CLAUDE.md Rule #6).
 */

const BULK_MAX = 50;

const schema = z.object({
  action: z.enum(["mark_read", "delete"]),
  ids: z.array(z.string()).min(1).max(BULK_MAX),
});

export const POST = withProviders(
  createRouteHandler<(typeof schema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:notifications:write",
    schema,
    handler: async ({ body }) => {
      const { action, ids } = body!;

      const existing = await Promise.all(ids.map((id) => notificationRepository.findById(id)));

      const succeeded: string[] = [];
      const skipped: string[] = [];
      const failed: { id: string; reason: string }[] = [];

      await Promise.all(
        ids.map(async (id, i) => {
          if (!existing[i]) {
            skipped.push(id);
            return;
          }
          try {
            if (action === "mark_read") {
              await notificationRepository.markAsRead(id);
            } else {
              await notificationRepository.delete(id);
            }
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
