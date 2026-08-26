import { withProviders } from "@/providers.config";

import { z } from "zod";
import {
  AD_FIELDS,
  ROLES_ADMIN_ONLY,
} from "@/constants";
import {
  AD_TRACKED_FIELDS,
  withHistory,
  createApiHandler as createRouteHandler,
  errorResponse,
  siteSettingsRepository,
  successResponse,
} from "@mohasinac/appkit";
import type { JsonValue } from "@mohasinac/appkit";
import {
  defaultPlacements,
  getPublishValidation,
  normalizeProviderCredentials,
  type AdInventoryRecord,
  type PlacementRecord,
} from "../validation";

const MSG_AD_ID_REQUIRED = "Ad ID is required.";

const adPatchSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    provider: z.enum(["manual", "adsense", "thirdParty"]).optional(),
    status: z.enum(Object.values(AD_FIELDS.STATUS_VALUES) as [string, ...string[]]).optional(),
    placementIds: z.array(z.string().min(1).max(80)).min(1).optional(),
    requiresConsent: z.boolean().optional(),
    priority: z.number().int().min(0).max(1000).optional(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    creative: z
      .object({
        title: z.string().max(140).optional(),
        body: z.string().max(500).optional(),
        imageUrl: z.string().optional(),
        ctaLabel: z.string().max(40).optional(),
        ctaHref: z.string().optional(),
        adsenseSlot: z.string().optional(),
        thirdPartyUrl: z.string().optional(),
      })
      .optional(),
  })
  .strict();

function normalizeAdSettings(settings: Record<string, JsonValue>) {
  const adSettingsRaw = (settings.adSettings as Record<string, JsonValue> | undefined) ?? {};
  const inventory = Array.isArray(adSettingsRaw.inventory)
    ? (adSettingsRaw.inventory as Array<Record<string, JsonValue>>)
    : [];
  const placements = Array.isArray(adSettingsRaw.placements)
    ? (adSettingsRaw.placements as Array<Record<string, JsonValue>>)
    : [];

  return {
    inventory,
    placements,
    consentRequired: Boolean(adSettingsRaw.consentRequired),
    providerCredentials: (adSettingsRaw.providerCredentials as Record<string, string> | undefined) ?? {},
  };
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:ads:read",
    handler: async ({ params }) => {
      const id = (params as { id?: string } | undefined)?.id;
      if (!id) {
        return errorResponse(MSG_AD_ID_REQUIRED, 400);
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, JsonValue>;
      const normalized = normalizeAdSettings(settings);
      const placements = normalized.placements.length > 0 ? normalized.placements : defaultPlacements();
      const item = normalized.inventory.find((entry) => String(entry.id) === id);
      if (!item) {
        return errorResponse("Ad not found", 404);
      }

      return successResponse({ item, placements, consentRequired: normalized.consentRequired });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof adPatchSchema)["_output"]>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:ads:write",
    schema: adPatchSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id?: string } | undefined)?.id;
      if (!id) {
        return errorResponse(MSG_AD_ID_REQUIRED, 400);
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, JsonValue>;
      const normalized = normalizeAdSettings(settings);
      const placements = normalized.placements.length > 0 ? normalized.placements : defaultPlacements();
      const providerCredentials = normalizeProviderCredentials(normalized.providerCredentials);
      const existing = normalized.inventory.find((entry) => String(entry.id) === id);
      if (!existing) {
        return errorResponse("Ad not found", 404);
      }

      const nowIso = new Date().toISOString();
      const prevStatus = String((existing as Record<string, JsonValue>).status ?? "draft");
      const nextStatus = body?.status ?? prevStatus;

      /*
       * ── Status history, on the SHARED primitive ────────────────────────
       *
       * This was hand-rolled here and diverged from `StatusChangeEntry` in six
       * ways: a `{from,to,changedAt,changedBy}` shape typed `Array<unknown>`,
       * a cap of 20 via `slice(-19)` instead of 50, silent truncation with no
       * counter, and no `actorRole`, `trigger` or `reason` at all — so an ad
       * paused by a scheduled job and one paused by an admin were
       * indistinguishable.
       *
       * `withHistory` is a PURE FUNCTION, which is what makes it usable here:
       * ads live inside the `siteSettings` singleton and have no repository of
       * their own, so there is no write primitive to hook. The date fields are
       * ISO strings rather than Timestamps for the same reason — the whole
       * inventory is serialised into one settings document.
       */
      const historyPatch = withHistory(
        existing as never,
        {
          ...(body?.status !== undefined ? { status: body.status } : {}),
          ...(body?.startAt !== undefined ? { startAt: body.startAt } : {}),
          ...(body?.endAt !== undefined ? { endAt: body.endAt } : {}),
        } as never,
        {
          tracked: AD_TRACKED_FIELDS,
          actor: { role: "admin", uid: user?.uid },
          trigger: "adminAdPatch",
          // No PII on an ad record — but the parameter is passed explicitly
          // rather than omitted, so the next field added here has to be
          // triaged rather than defaulting into the history silently.
          piiFields: [],
        },
      ) as { statusHistory?: unknown[]; statusHistoryTruncated?: number } | null;

      const statusChanged = Boolean(body?.status && body.status !== prevStatus);

      const updated = {
        ...existing,
        ...(body ?? {}),
        creative: {
          ...((existing.creative as Record<string, JsonValue> | undefined) ?? {}),
          ...((body?.creative as Record<string, JsonValue> | undefined) ?? {}),
        },
        updatedAt: nowIso,
        updatedBy: user?.uid || "admin",
        lastStatusChange: statusChanged ? nowIso : (existing as Record<string, JsonValue>).lastStatusChange,
        ...(historyPatch
          ? {
              statusHistory: historyPatch.statusHistory,
              ...(historyPatch.statusHistoryTruncated !== undefined
                ? { statusHistoryTruncated: historyPatch.statusHistoryTruncated }
                : {}),
            }
          : {}),
        // Set publishedAt / publishedBy on first activation
        publishedAt:
          body?.status === AD_FIELDS.STATUS_VALUES.ACTIVE && prevStatus !== AD_FIELDS.STATUS_VALUES.ACTIVE
            ? nowIso
            : (existing as Record<string, JsonValue>).publishedAt,
        publishedBy:
          body?.status === AD_FIELDS.STATUS_VALUES.ACTIVE && prevStatus !== AD_FIELDS.STATUS_VALUES.ACTIVE
            ? (user?.uid || "admin")
            : (existing as Record<string, JsonValue>).publishedBy,
      };

      if (nextStatus === AD_FIELDS.STATUS_VALUES.ACTIVE || nextStatus === AD_FIELDS.STATUS_VALUES.SCHEDULED) {
        const publishValidation = getPublishValidation(
          updated as AdInventoryRecord,
          placements as PlacementRecord[],
          providerCredentials,
        );
        if (!publishValidation.isPublishable) {
          return errorResponse(
            `Ad cannot be ${updated.status === AD_FIELDS.STATUS_VALUES.ACTIVE ? "published" : "scheduled"}: ${publishValidation.issues.join("; ")}`,
            400,
          );
        }
      }

      const nextInventory = normalized.inventory.map((entry) =>
        String(entry.id) === id ? updated : entry,
      );

      await siteSettingsRepository.updateSingleton({
        adSettings: {
          inventory: nextInventory,
          placements,
          consentRequired: normalized.consentRequired,
          providerCredentials,
        },
      } as never);

      return successResponse(updated, "Ad updated");
    },
  }),
);

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:ads:delete",
    handler: async ({ params }) => {
      const id = (params as { id?: string } | undefined)?.id;
      if (!id) {
        return errorResponse(MSG_AD_ID_REQUIRED, 400);
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, JsonValue>;
      const normalized = normalizeAdSettings(settings);
      const placements = normalized.placements.length > 0 ? normalized.placements : defaultPlacements();
      const providerCredentials = normalizeProviderCredentials(normalized.providerCredentials);
      const nextInventory = normalized.inventory.filter((entry) => String(entry.id) !== id);
      if (nextInventory.length === normalized.inventory.length) {
        return errorResponse("Ad not found", 404);
      }

      await siteSettingsRepository.updateSingleton({
        adSettings: {
          inventory: nextInventory,
          placements,
          consentRequired: normalized.consentRequired,
          providerCredentials,
        },
      } as never);

      return successResponse({ id, deleted: true }, "Ad deleted");
    },
  }),
);
