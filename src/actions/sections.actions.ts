"use server";

/**
 * Homepage Sections Server Actions -- thin entrypoints.
 * Business logic lives in @mohasinac/appkit/features/homepage/actions.
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit";
import {
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  reorderHomepageSections,
  listHomepageSections,
  listEnabledHomepageSections,
  getHomepageSectionById,
  createSectionSchema,
  updateSectionSchema,
  type CreateHomepageSectionInput,
  type UpdateHomepageSectionInput,
} from "@mohasinac/appkit";
import type { HomepageSectionDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";

export type { CreateHomepageSectionInput, UpdateHomepageSectionInput };

const sectionIdSchema = z.object({ id: z.string().min(1, "id is required") });

export async function createHomepageSectionAction(
  input: CreateHomepageSectionInput,
): Promise<HomepageSectionDocument> {
  const admin = await requireRoleUser(["admin"]);

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

  return createHomepageSection(parsed.data, admin.uid);
}

export async function updateHomepageSectionAction(
  id: string,
  input: UpdateHomepageSectionInput,
): Promise<HomepageSectionDocument> {
  const admin = await requireRoleUser(["admin"]);

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

  const existing = await getHomepageSectionById(id);
  if (!existing) throw new NotFoundError("Section not found");

  return updateHomepageSection(id, parsed.data);
}

export async function deleteHomepageSectionAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `sections:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = sectionIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await getHomepageSectionById(id);
  if (!existing) throw new NotFoundError("Section not found");

  return deleteHomepageSection(id);
}

export async function reorderHomepageSectionsAction(
  sectionIds: string[],
): Promise<HomepageSectionDocument[]> {
  const admin = await requireRoleUser(["admin"]);

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

  return reorderHomepageSections(parsed.data.sectionIds);
}

export async function listHomepageSectionsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<HomepageSectionDocument>> {
  return listHomepageSections(params);
}

export async function listEnabledHomepageSectionsAction(): Promise<
  HomepageSectionDocument[]
> {
  return listEnabledHomepageSections();
}

export async function getHomepageSectionByIdAction(
  id: string,
): Promise<HomepageSectionDocument | null> {
  return getHomepageSectionById(id);
}
