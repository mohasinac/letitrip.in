/**
 * `/admin/pricing` — read every rate and its history; change exactly one.
 *
 * ## 🛑 Why GET is here rather than on `/api/admin/site`
 *
 * That route returns the settings document (minus credentials), and a rate
 * page fed from it would have to re-derive, in the browser, which of ~200
 * fields are rates and what tier each one is. The registry already knows, and
 * it lives server-side. So this endpoint returns the JOIN — descriptor plus
 * current value plus last change — which is the only shape the page renders.
 *
 * POST is narrower than the page: one rate per request. See `applyRateChange`.
 */

import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { siteSettingsRepository } from "@mohasinac/appkit/features/admin/repository/site-settings.repository";
/*
 * 🛑 From `@mohasinac/appkit/server`, not a deep `_internal/...` path. appkit's
 * `exports` map has no `./_internal/*` key, so the deep spelling resolves to
 * nothing — and the failure arrives as an unresolved module at BUILD time, not
 * as a type error here.
 */
import { RATE_REGISTRY, canEditRate, applyRateChange } from "@mohasinac/appkit/server";
import { isAdminUser } from "@mohasinac/appkit/features/auth/role-predicates";
/*
 * 🛑 `@/constants/api-roles`, the DEFINING module — never the `@/constants`
 * barrel. That barrel re-exports `navigation.tsx`, which imports appkit's
 * `"use client"` entry, so touching it from a route pulls a SECOND appkit
 * instance into the server graph with an empty provider registry and the route
 * then answers 401 to every valid session.
 */
import { ROLES_ADMIN_ONLY, ROLES_BACK_OFFICE } from "@/constants/api-roles";
import { z } from "zod";

function readRate(settings: unknown, path: string): number | null {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined,
      settings,
    );
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:site:read",
    handler: async ({ user }) => {
      const settings = await siteSettingsRepository.getSingleton();
      const log = settings.rateChanges ?? [];
      const isAdmin = isAdminUser(user);

      const rates = RATE_REGISTRY.map((descriptor) => {
        /*
         * Newest first, so the FIRST match is the latest change — no sort
         * needed here, and none should be added: re-sorting would hide a log
         * whose order had been corrupted rather than surface it.
         */
        const last = log.find((entry) => entry.path === descriptor.path);
        return {
          ...descriptor,
          value: readRate(settings, descriptor.path),
          editable: canEditRate(descriptor.tier, isAdmin),
          lastChange: last
            ? {
                previousValue: last.previousValue,
                newValue: last.newValue,
                effectiveFrom: last.effectiveFrom,
                changedAt: last.changedAt,
                changedByName: last.changedByName,
                reason: last.reason ?? null,
              }
            : null,
        };
      });

      return successResponse({ rates });
    },
  }),
);

const rateChangeSchema = z.object({
  path: z.string().min(1).max(120),
  newValue: z.number().finite().min(0),
  effectiveFrom: z.coerce.date().optional(),
  reason: z.string().trim().max(300).optional(),
});

export const POST = withProviders(
  createRouteHandler<z.infer<typeof rateChangeSchema>>({
    auth: true,
    /*
     * 🛑 Admin-only at the ROUTE, even though `canEditRate` lets back-office
     * staff change an operational rate. The route gate is the coarse one; the
     * registry's tier check is the fine one and still runs. Widening this to
     * `ROLES_BACK_OFFICE` is a real decision about who may reprice, not a
     * consistency fix — make it deliberately or not at all.
     */
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:site:write",
    schema: rateChangeSchema,
    handler: async ({ user, body }) => {
      const result = await applyRateChange(
        {
          path: body!.path,
          newValue: body!.newValue,
          ...(body!.effectiveFrom ? { effectiveFrom: body!.effectiveFrom } : {}),
          ...(body!.reason ? { reason: body!.reason } : {}),
        },
        { uid: user!.uid, name: user!.name, isAdmin: isAdminUser(user) },
      );
      return successResponse(result, "Rate updated.");
    },
  }),
);
