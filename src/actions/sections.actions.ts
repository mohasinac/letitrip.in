"use server";

/**
 * Homepage Sections Server Actions (admin only)
 *
 * CRUD mutations for homepage sections — call homepageSectionsRepository directly,
 * bypassing the service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireRole } from "@/lib/firebase/auth-server";
import { homepageSectionsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import type {
  HomepageSectionDocument,
  HomepageSectionCreateInput,
  HomepageSectionUpdateInput,
} from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@/lib/query";

// ─── Schemas ──────────────────────────────────────────────────────────────

const sectionIdSchema = z.object({ id: z.string().min(1, "id is required") });

const createSectionSchema = z.object({
  type: z.string().min(1),
  enabled: z.boolean().default(true),
  order: z.number().int().default(0),
  config: z.record(z.string(), z.unknown()).optional(),
});

const updateSectionSchema = z.object({
  order: z.number().int().optional(),
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export type CreateHomepageSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateHomepageSectionInput = z.infer<typeof updateSectionSchema>;

// ─── Server Actions ────────────────────────────────────────────────────────

export async function createHomepageSectionAction(
  input: CreateHomepageSectionInput,
): Promise<HomepageSectionDocument> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `sections:create:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = createSectionSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid section data",
    );

  const section = await homepageSectionsRepository.create(
    parsed.data as unknown as HomepageSectionCreateInput,
  );

  serverLogger.info("createHomepageSectionAction", {
    adminId: admin.uid,
    sectionId: section.id,
  });
  return section;
}

export async function updateHomepageSectionAction(
  id: string,
  input: UpdateHomepageSectionInput,
): Promise<HomepageSectionDocument> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `sections:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = sectionIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const parsed = updateSectionSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const existing = await homepageSectionsRepository.findById(id);
  if (!existing) throw new NotFoundError("Section not found");

  const updated = await homepageSectionsRepository.update(
    id,
    parsed.data as HomepageSectionUpdateInput,
  );

  serverLogger.info("updateHomepageSectionAction", {
    adminId: admin.uid,
    sectionId: id,
  });
  return updated;
}

export async function deleteHomepageSectionAction(id: string): Promise<void> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `sections:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = sectionIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await homepageSectionsRepository.findById(id);
  if (!existing) throw new NotFoundError("Section not found");

  await homepageSectionsRepository.delete(id);

  serverLogger.info("deleteHomepageSectionAction", {
    adminId: admin.uid,
    sectionId: id,
  });
}

export async function reorderHomepageSectionsAction(
  sectionIds: string[],
): Promise<HomepageSectionDocument[]> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `sections:reorder:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = z
    .object({ sectionIds: z.array(z.string().min(1)).min(1) })
    .safeParse({ sectionIds });
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid order",
    );

  await homepageSectionsRepository.reorderSections(
    parsed.data.sectionIds.map((id, index) => ({ id, order: index + 1 })),
  );

  const updatedSections = await homepageSectionsRepository.findAll();
  updatedSections.sort((a, b) => (a.order || 0) - (b.order || 0));

  serverLogger.info("reorderHomepageSectionsAction", {
    adminId: admin.uid,
    count: parsed.data.sectionIds.length,
  });
  return updatedSections;
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listHomepageSectionsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<HomepageSectionDocument>> {
  const sieve: SieveModel = {
    filters: params?.filters,
    sorts: params?.sorts ?? "order",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  };
  return homepageSectionsRepository.list(sieve);
}

export async function listEnabledHomepageSectionsAction(): Promise<
  HomepageSectionDocument[]
> {
  return homepageSectionsRepository.getEnabledSections();
}

export async function getHomepageSectionByIdAction(
  id: string,
): Promise<HomepageSectionDocument | null> {
  return homepageSectionsRepository.findById(id);
}
