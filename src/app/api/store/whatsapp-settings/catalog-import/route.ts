/**
 * POST /api/store/whatsapp-settings/catalog-import
 *
 * Enqueues an import of the seller's WhatsApp Business Catalog into LetItRip as
 * draft standard products. Items whose WA description/retailer_id is already a
 * LetItRip slug (starts with "product-") are skipped — those were pushed FROM
 * here by catalog-sync.
 *
 * This route does NO importing itself. The old inline version ran up to 2
 * Firestore reads + 1 write per item sequentially for up to 250 items, which is
 * a 10s-timeout risk on Vercel Hobby (CLAUDE.md Rule #6), and never followed
 * Meta's `paging.next` so larger catalogs silently truncated. The work now runs
 * in the `whatsappCatalogImport` job runner under the Firebase Function's 300s
 * budget, which is what makes full pagination safe.
 *
 * Client subscribes to progress with
 * `useBulkEvent({ rtdbPath: RTDB_PATHS.BULK_EVENTS })` using the returned ids.
 */

import { withProviders } from "@/providers.config";
import {
  storeRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import { enqueueJob } from "@mohasinac/appkit/server";
import { ROLES_STORE_WRITE } from "@/constants";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return errorResponse("Store not found", 404);

      const capabilities = store.capabilities ?? [];
      if (!capabilities.includes("whatsapp_catalog_sync")) {
        return errorResponse(
          "WhatsApp catalog sync is not enabled for your store.",
          403,
        );
      }

      // Fail fast on an obviously-unconfigured store rather than enqueueing a
      // job that can only fail. The runner re-checks, since the seller could
      // disconnect between enqueue and execution.
      const cfg = store.whatsappConfig;
      if (!cfg?.connected || !cfg.catalogId || !cfg.accessToken) {
        return errorResponse(
          "WhatsApp Business account is not connected. Save your credentials first.",
          400,
        );
      }

      const { jobId, customToken } = await enqueueJob({
        jobType: "whatsappCatalogImport",
        payload: { storeSlug: store.storeSlug },
        requestedBy: user!.uid,
      });

      return successResponse(
        { jobId, customToken },
        "Catalog import started — this runs in the background.",
      );
    },
  }),
);
