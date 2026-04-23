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
  getProviderCredentialIssues,
  getProviderCredentialStatus,
  getPublishValidation,
  normalizeProviderCredentials,
  type AdInventoryRecord,
  type PlacementRecord,
} from "./validation";

const placementIdSchema = z.string().min(1).max(80);
const adStatusSchema = z.enum(["draft", "active", "scheduled", "paused"]);
const adProviderSchema = z.enum(["manual", "adsense", "thirdParty"]);

const adInventoryItemSchema = z.object({
  id: z.string().min(1).max(120).optional(),
  name: z.string().min(2).max(120),
  provider: adProviderSchema,
  status: adStatusSchema,
  placementIds: z.array(placementIdSchema).min(1),
  requiresConsent: z.boolean().default(false),
  priority: z.number().int().min(0).max(1000).default(0),
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
    .default({}),
});

const adsConfigPatchSchema = z.object({
  consentRequired: z.boolean().optional(),
  placements: z
    .array(
      z.object({
        id: placementIdSchema,
        label: z.string().min(1).max(120),
        enabled: z.boolean().default(true),
        reservedHeight: z.number().int().min(0).max(2000).optional(),
      }),
    )
    .optional(),
  providerCredentials: z
    .object({
      adsenseClientId: z.string().optional(),
      thirdPartyScriptUrl: z.string().optional(),
    })
    .optional(),
});

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

function maskSecret(value: string | undefined): string {
  if (!value) return "";
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin"],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const q = (url.searchParams.get("q") || "").trim().toLowerCase();
      const status = (url.searchParams.get("status") || "all").trim();
      const provider = (url.searchParams.get("provider") || "all").trim();
      const placement = (url.searchParams.get("placement") || "all").trim();
      const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
      const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || "20")));

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, unknown>;
      const normalized = normalizeAdSettings(settings);
      const placements = normalized.placements.length > 0 ? normalized.placements : defaultPlacements();
      const providerCredentials = normalizeProviderCredentials(normalized.providerCredentials);
      const providerCredentialStatus = getProviderCredentialStatus(providerCredentials);

      let filtered = normalized.inventory;
      if (status !== "all") {
        filtered = filtered.filter((item) => String(item.status || "") === status);
      }
      if (provider !== "all") {
        filtered = filtered.filter((item) => String(item.provider || "") === provider);
      }
      if (placement !== "all") {
        filtered = filtered.filter((item) =>
          Array.isArray(item.placementIds)
            ? item.placementIds.map((v) => String(v)).includes(placement)
            : false,
        );
      }
      if (q) {
        filtered = filtered.filter((item) => {
          const name = String(item.name || "").toLowerCase();
          const id = String(item.id || "").toLowerCase();
          return name.includes(q) || id.includes(q);
        });
      }

      filtered = [...filtered].sort((a, b) => {
        const aUpdated = new Date(String(a.updatedAt || 0)).getTime();
        const bUpdated = new Date(String(b.updatedAt || 0)).getTime();
        return bUpdated - aUpdated;
      });

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const start = (page - 1) * pageSize;
      const items = filtered.slice(start, start + pageSize);

      const providerCredentialsMasked = {
        adsenseClientId: maskSecret(providerCredentials.adsenseClientId),
        thirdPartyScriptUrl: maskSecret(providerCredentials.thirdPartyScriptUrl),
      };

      const itemsWithValidation = items.map((item) => {
        const publishValidation = getPublishValidation(
          item as AdInventoryRecord,
          placements as PlacementRecord[],
          providerCredentials,
        );
        return {
          ...item,
          publishReady: publishValidation.isPublishable,
          publishIssues: publishValidation.issues,
        };
      });

      return successResponse({
        items: itemsWithValidation,
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
        placements,
        consentRequired: normalized.consentRequired,
        providerCredentialsMasked,
        providerCredentialStatus,
      });
    },
  }),
);

export const PATCH = withProviders(
  createRouteHandler<(typeof adsConfigPatchSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    schema: adsConfigPatchSchema,
    handler: async ({ body }) => {
      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, unknown>;
      const normalized = normalizeAdSettings(settings);
      const mergedCredentials = normalizeProviderCredentials({
        ...normalized.providerCredentials,
        ...(body?.providerCredentials ?? {}),
      });
      const credentialIssues = getProviderCredentialIssues(mergedCredentials);
      if (credentialIssues.length > 0) {
        return errorResponse(`Invalid provider credentials: ${credentialIssues.join("; ")}`, 400);
      }

      const nextAdSettings = {
        inventory: normalized.inventory,
        placements: body?.placements ?? (normalized.placements.length > 0 ? normalized.placements : defaultPlacements()),
        consentRequired: body?.consentRequired ?? normalized.consentRequired,
        providerCredentials: mergedCredentials,
      };

      await siteSettingsRepository.updateSingleton({ adSettings: nextAdSettings } as never);
      return successResponse(nextAdSettings);
    },
  }),
);

export const POST = withProviders(
  createRouteHandler<(typeof adInventoryItemSchema)["_output"]>({
    auth: true,
    roles: ["admin"],
    schema: adInventoryItemSchema,
    handler: async ({ body, user }) => {
      if (!body) {
        return errorResponse("Invalid request", 400);
      }

      const settings = (await siteSettingsRepository.getSingleton()) as unknown as Record<string, unknown>;
      const normalized = normalizeAdSettings(settings);
      const placements = normalized.placements.length > 0 ? normalized.placements : defaultPlacements();
      const providerCredentials = normalizeProviderCredentials(normalized.providerCredentials);

      const id = body.id?.trim() || `ad_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      if (normalized.inventory.some((item) => String(item.id) === id)) {
        return errorResponse("Ad id already exists", 409);
      }

      const nowIso = new Date().toISOString();
      const nextItem = {
        ...body,
        id,
        createdAt: nowIso,
        updatedAt: nowIso,
        updatedBy: user?.uid || "admin",
      };

      if (nextItem.status === "active" || nextItem.status === "scheduled") {
        const publishValidation = getPublishValidation(
          nextItem as AdInventoryRecord,
          placements as PlacementRecord[],
          providerCredentials,
        );
        if (!publishValidation.isPublishable) {
          return errorResponse(
            `Ad cannot be ${nextItem.status === "active" ? "published" : "scheduled"}: ${publishValidation.issues.join("; ")}`,
            400,
          );
        }
      }

      const nextAdSettings = {
        inventory: [...normalized.inventory, nextItem],
        placements,
        consentRequired: normalized.consentRequired,
        providerCredentials,
      };

      await siteSettingsRepository.updateSingleton({ adSettings: nextAdSettings } as never);
      return successResponse(nextItem, "Ad created", 201);
    },
  }),
);
