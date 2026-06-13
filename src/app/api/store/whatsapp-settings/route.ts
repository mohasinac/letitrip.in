/**
 * GET /api/store/whatsapp-settings
 *   Returns the seller's WhatsApp Business config with accessToken masked.
 *
 * PUT /api/store/whatsapp-settings
 *   Saves WhatsApp Business connection details. accessToken is encrypted at rest.
 *   Requires store capability: whatsapp_catalog_sync
 */

import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  storeRepository,
  encryptPii,

  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";
import type { StoreDocument } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

type WhatsAppConfig = NonNullable<StoreDocument["whatsappConfig"]>;

function maskConfig(
  config: WhatsAppConfig | undefined,
): WhatsAppConfig | null {
  if (!config) return null;
  return {
    ...config,
    // Never return the raw encrypted token to the client
    accessToken: config.accessToken ? "••••••" : undefined,
  };
}

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return errorResponse("Store not found", 404);
      return successResponse({ whatsappConfig: maskConfig(store.whatsappConfig) });
    },
  }),
);

const putSchema = z.object({
  phoneNumber: z.string().regex(/^\d{7,15}$/, "Must be digits-only, 7-15 characters").optional(),
  wabaId: z.string().min(1).optional(),
  catalogId: z.string().min(1).optional(),
  accessToken: z.string().min(10).optional(),
  catalogSyncEnabled: z.boolean().optional(),
});

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const PUT = withProviders(
  createRouteHandler<(typeof putSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_STORE_WRITE],
    schema: putSchema,
    handler: async ({ user, body }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return errorResponse("Store not found", 404);

      // RBAC: only stores with whatsapp_catalog_sync capability can configure this
      const capabilities = store.capabilities ?? [];
      if (!capabilities.includes("whatsapp_catalog_sync")) {
        return errorResponse(
          "WhatsApp catalog sync is not enabled for your store. Contact support to request access.",
          403,
        );
      }

      const existing = store.whatsappConfig;
      const {
        phoneNumber,
        wabaId,
        catalogId,
        accessToken: rawToken,
        catalogSyncEnabled,
      } = body!;

      // Resolve the stored token: use the incoming value if provided,
      // otherwise keep the existing encrypted value unchanged.
      const resolvedToken =
        rawToken != null
          ? (encryptPii(rawToken) as string)
          : existing?.accessToken;

      const connected = !!(
        (wabaId ?? existing?.wabaId) &&
        (catalogId ?? existing?.catalogId) &&
        resolvedToken
      );

      const updated: WhatsAppConfig = {
        catalogSyncEnabled: catalogSyncEnabled ?? existing?.catalogSyncEnabled ?? false,
        connected,
        ...(existing ?? {}),
        ...(phoneNumber != null ? { phoneNumber } : {}),
        ...(wabaId != null ? { wabaId } : {}),
        ...(catalogId != null ? { catalogId } : {}),
        accessToken: resolvedToken,
        ...(connected && !existing?.connected ? { connectedAt: new Date() } : {}),
      };

      await storeRepository.updateStore(store.storeSlug, {
        whatsappConfig: updated,
      });

      return successResponse(
        { whatsappConfig: maskConfig(updated) },
        "WhatsApp settings saved",
      );
    },
  }),
);
