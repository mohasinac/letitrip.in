"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
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
import { ERR_RATE_LIMIT, ERR_INVALID_UPDATE } from "./_constants";


const sectionIdSchema = z.object({ id: z.string().min(1, "id is required") });

export async function createHomepageSectionAction(
  input: CreateHomepageSectionInput,
): Promise<ActionResult<HomepageSectionDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
    
      const rl = await rateLimitByIdentifier(
        `sections:create:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = createSectionSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid section data",
        );
    
      return createHomepageSection(parsed.data, admin.uid);
  });
}

export async function updateHomepageSectionAction(
  id: string,
  input: UpdateHomepageSectionInput,
): Promise<ActionResult<HomepageSectionDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
    
      const rl = await rateLimitByIdentifier(
        `sections:update:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const idParsed = sectionIdSchema.safeParse({ id });
      if (!idParsed.success) throw new ValidationError("Invalid id");
    
      const parsed = updateSectionSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE,
        );
    
      const existing = await getHomepageSectionById(id);
      if (!existing) throw new NotFoundError("Section not found");
    
      return updateHomepageSection(id, parsed.data);
  });
}

export async function deleteHomepageSectionAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `sections:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(ERR_RATE_LIMIT);

  const idParsed = sectionIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await getHomepageSectionById(id);
  if (!existing) throw new NotFoundError("Section not found");

  return deleteHomepageSection(id);
}

export async function reorderHomepageSectionsAction(
  sectionIds: string[],
): Promise<ActionResult<HomepageSectionDocument[]>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
    
      const rl = await rateLimitByIdentifier(
        `sections:reorder:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = z
        .object({ sectionIds: z.array(z.string().min(1)).min(1) })
        .safeParse({ sectionIds });
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid order",
        );
    
      return reorderHomepageSections(parsed.data.sectionIds);
  });
}

export async function listHomepageSectionsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<HomepageSectionDocument>>> {
  return wrapAction(async () => {
    return listHomepageSections(params);
  });
}

export async function listEnabledHomepageSectionsAction(): Promise<ActionResult<HomepageSectionDocument[]>> {
  return wrapAction(async () => {
    return listEnabledHomepageSections();
  });
}

export async function getHomepageSectionByIdAction(
  id: string,
): Promise<ActionResult<HomepageSectionDocument | null>> {
  return wrapAction(async () => {
    return getHomepageSectionById(id);
  });
}
