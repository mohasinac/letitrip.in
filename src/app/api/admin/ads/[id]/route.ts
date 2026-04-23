import { withProviders } from "@/providers.config";

import { z } from "zod";
import {
  createApiHandler as createRouteHandler,
  errorResponse,
  siteSettingsRepository,
  successResponse,
} from "@mohasinac/appkit";
import {
  defaultPlacements,
  getPublishValidation,
  normalizeProviderCredentials,
  type AdInventoryRecord,
  type PlacementRecord,
} from "../validation";

const adPatchSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    provider: z.enum(["manual", "adsense", "thirdParty"]).optional(),
    status: z.enum(["draft", "active", "scheduled", "paused"]).optional(),
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

function normalizeAdSettings(settings: Record<string, unknown>) {
  const adSettingsRaw = (settings.adSettings as Record<string, unknown> | undefined) ?? {};
  const inventory = Array.isArray(adSettingsRaw.inventory)
    ? (adSettingsRaw.inventory as Array<Record<string, unknown>>)
    : [];
  const placements = Array.isArray(adSettingsRaw.placements)
    ? (adSettingsRaw.placements as Array<Record<string, unknown>>)
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
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id?: string } | undefined)?.id;
      if (!id) {
        return errorResponse("Ad id is required", 400);
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, unknown>;
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
    roles: ["admin"],
    schema: adPatchSchema,
    handler: async ({ params, body, user }) => {
      const id = (params as { id?: string } | undefined)?.id;
      if (!id) {
        return errorResponse("Ad id is required", 400);
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, unknown>;
      const normalized = normalizeAdSettings(settings);
      const placements = normalized.placements.length > 0 ? normalized.placements : defaultPlacements();
      const providerCredentials = normalizeProviderCredentials(normalized.providerCredentials);
      const existing = normalized.inventory.find((entry) => String(entry.id) === id);
      if (!existing) {
        return errorResponse("Ad not found", 404);
      }

      const nowIso = new Date().toISOString();
      const prevStatus = String((existing as Record<string, unknown>).status ?? "draft");
      const nextStatus = body?.status ?? prevStatus;

      // Audit trail — track every status transition
      const existingHistory = Array.isArray((existing as Record<string, unknown>).statusHistory)
        ? ((existing as Record<string, unknown>).statusHistory as Array<unknown>)
        : [];

      const statusHistoryEntry =
        body?.status && body.status !== prevStatus
          ? { from: prevStatus, to: body.status, changedAt: nowIso, changedBy: user?.uid || "admin" }
          : null;

      const updated = {
        ...existing,
        ...(body ?? {}),
        creative: {
          ...((existing.creative as Record<string, unknown> | undefined) ?? {}),
          ...((body?.creative as Record<string, unknown> | undefined) ?? {}),
        },
        updatedAt: nowIso,
        updatedBy: user?.uid || "admin",
        lastStatusChange: statusHistoryEntry ? nowIso : (existing as Record<string, unknown>).lastStatusChange,
        statusHistory: statusHistoryEntry
          ? [...existingHistory.slice(-19), statusHistoryEntry]
          : existingHistory,
        // Set publishedAt / publishedBy on first activation
        publishedAt:
          body?.status === "active" && prevStatus !== "active"
            ? nowIso
            : (existing as Record<string, unknown>).publishedAt,
        publishedBy:
          body?.status === "active" && prevStatus !== "active"
            ? (user?.uid || "admin")
            : (existing as Record<string, unknown>).publishedBy,
      };

      if (nextStatus === "active" || nextStatus === "scheduled") {
        const publishValidation = getPublishValidation(
          updated as AdInventoryRecord,
          placements as PlacementRecord[],
          providerCredentials,
        );
        if (!publishValidation.isPublishable) {
          return errorResponse(
            `Ad cannot be ${updated.status === "active" ? "published" : "scheduled"}: ${publishValidation.issues.join("; ")}`,
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
    roles: ["admin"],
    handler: async ({ params }) => {
      const id = (params as { id?: string } | undefined)?.id;
      if (!id) {
        return errorResponse("Ad id is required", 400);
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, unknown>;
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
