"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * FAQ Server Actions -- thin entrypoints.
 * Business logic lives in @mohasinac/appkit/features/faq/actions.
 */

import { requireAuthUser, requireRoleUser } from "@mohasinac/appkit";
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
  voteFaq,
  createFaq,
  updateFaq,
  deleteFaq,
  listFaqs,
  listPublicFaqs,
  getFaqById,
  faqCreateSchema,
  faqUpdateSchema,
  type VoteFaqActionInput,
  type VoteFaqActionResult,
  type FaqCreateInput,
  type FaqUpdateInput,
} from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import type { FAQDocument } from "@mohasinac/appkit";
import type { FirebaseSieveResult } from "@mohasinac/appkit";
import { ERR_RATE_LIMIT, ERR_INVALID_UPDATE } from "./_constants";

export type AdminCreateFaqInput = FaqCreateInput;
export type AdminUpdateFaqInput = FaqUpdateInput;

export async function voteFaqAction(
  input: VoteFaqActionInput,
): Promise<ActionResult<VoteFaqActionResult>> {
  return wrapAction(async () => {
    const user = await requireAuthUser();
    
      const rl = await rateLimitByIdentifier(
        `faq:vote:${user.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(
          "Too many requests. Please wait before trying again.",
        );
    
      const faq = await getFaqById(input.faqId);
      if (!faq) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);
    
      return voteFaq(input);
  });
}

export async function adminCreateFaqAction(
  input: AdminCreateFaqInput,
): Promise<ActionResult<FAQDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin", "moderator"]);
    
      const rl = await rateLimitByIdentifier(
        `faq:create:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const parsed = faqCreateSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? "Invalid FAQ data",
        );
    
      return createFaq(parsed.data, admin.uid);
  });
}

export async function adminUpdateFaqAction(
  id: string,
  input: AdminUpdateFaqInput,
): Promise<ActionResult<FAQDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin", "moderator"]);
    
      const rl = await rateLimitByIdentifier(
        `faq:update:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      if (!id?.trim()) throw new ValidationError("id is required");
    
      const parsed = faqUpdateSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE,
        );
    
      const existing = await getFaqById(id);
      if (!existing) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);
    
      return updateFaq(id, parsed.data);
  });
}

export async function adminDeleteFaqAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `faq:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(ERR_RATE_LIMIT);

  if (!id?.trim()) throw new ValidationError("id is required");

  const existing = await getFaqById(id);
  if (!existing) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);

  return deleteFaq(id);
}

export async function listFaqsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<FAQDocument>>> {
  return wrapAction(async () => {
    return listFaqs(params);
  });
}

export async function listPublicFaqsAction(
  category?: string,
  limit = 20,
): Promise<ActionResult<FAQDocument[]>> {
  return wrapAction(async () => {
    return listPublicFaqs(category, limit);
  });
}

export async function getFaqByIdAction(
  id: string,
): Promise<ActionResult<FAQDocument | null>> {
  return wrapAction(async () => {
    return getFaqById(id);
  });
}
