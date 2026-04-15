"use server";

/**
 * FAQ Server Actions
 *
 * Vote on a FAQ as helpful or not-helpful, bypassing the
 * service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireAuth, requireRole } from "@/lib/firebase/auth-server";
import { faqsRepository } from "@/repositories";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@mohasinac/appkit/errors";
import { ERROR_MESSAGES } from "@/constants";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { faqCreateSchema, faqUpdateSchema } from "@/lib/validation/schemas";
import type { FAQDocument } from "@/db/schema";
import type { FirebaseSieveResult, SieveModel } from "@mohasinac/appkit/providers/db-firebase";

// ─── Validation schema ────────────────────────────────────────────────────────

const voteSchema = z.object({
  faqId: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
  vote: z.enum(["helpful", "not-helpful"]),
});

export type VoteFaqInput = z.infer<typeof voteSchema>;

export interface VoteFaqResult {
  helpful: number;
  notHelpful: number;
}

// ─── Server Action ────────────────────────────────────────────────────────────

/**
 * Vote on a FAQ as helpful or not-helpful.
 * Requires authentication.
 * Rate-limited by uid (API: 60 req / 60 s).
 */
export async function voteFaqAction(
  input: VoteFaqInput,
): Promise<VoteFaqResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `faq:vote:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(
      "Too many requests. Please wait before trying again.",
    );

  const parsed = voteSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? ERROR_MESSAGES.VALIDATION.FAILED,
    );
  }

  const { faqId, vote } = parsed.data;
  const faq = await faqsRepository.findById(faqId);
  if (!faq) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);

  const helpful = vote === "helpful";
  const stats = faq.stats ?? { views: 0, helpful: 0, notHelpful: 0 };

  const updated = await faqsRepository.update(faqId, {
    stats: {
      ...stats,
      helpful: helpful ? (stats.helpful ?? 0) + 1 : (stats.helpful ?? 0),
      notHelpful: !helpful
        ? (stats.notHelpful ?? 0) + 1
        : (stats.notHelpful ?? 0),
    },
  });

  return {
    helpful: updated.stats?.helpful ?? 0,
    notHelpful: updated.stats?.notHelpful ?? 0,
  };
}

// ─── Admin CRUD ────────────────────────────────────────────────────────────────

export type AdminCreateFaqInput = {
  question: string;
  answer: FAQDocument["answer"];
  category?: FAQDocument["category"];
  isActive?: boolean;
  isPinned?: boolean;
  priority?: number;
  showOnHomepage?: boolean;
  showInFooter?: boolean;
  tags?: string[];
  order?: number;
};

export type AdminUpdateFaqInput = Partial<AdminCreateFaqInput>;

/**
 * Create a FAQ (admin only).
 */
export async function adminCreateFaqAction(
  input: AdminCreateFaqInput,
): Promise<FAQDocument> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `faq:create:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = faqCreateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid FAQ data",
    );

  const faq = await faqsRepository.createWithSlug({
    ...parsed.data,
    createdBy: admin.uid,
    showOnHomepage: parsed.data.showOnHomepage ?? false,
    showInFooter: parsed.data.showInFooter ?? false,
    isPinned: parsed.data.isPinned ?? false,
    order: parsed.data.order ?? 0,
    useSiteSettings: false,
    variables: {},
    isActive: parsed.data.isActive ?? true,
  } as any);

  serverLogger.info("adminCreateFaqAction", {
    adminId: admin.uid,
    faqId: faq.id,
  });
  return faq;
}

/**
 * Update a FAQ (admin only).
 */
export async function adminUpdateFaqAction(
  id: string,
  input: AdminUpdateFaqInput,
): Promise<FAQDocument> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `faq:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id?.trim()) throw new ValidationError("id is required");

  const parsed = faqUpdateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const existing = await faqsRepository.findById(id);
  if (!existing) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);

  const updated = await faqsRepository.update(id, parsed.data as any);

  serverLogger.info("adminUpdateFaqAction", { adminId: admin.uid, faqId: id });
  return updated;
}

/**
 * Delete a FAQ (admin only).
 */
export async function adminDeleteFaqAction(id: string): Promise<void> {
  const admin = await requireRole(["admin", "moderator"]);

  const rl = await rateLimitByIdentifier(
    `faq:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id?.trim()) throw new ValidationError("id is required");

  const existing = await faqsRepository.findById(id);
  if (!existing) throw new NotFoundError(ERROR_MESSAGES.FAQ.NOT_FOUND);

  await faqsRepository.delete(id);

  serverLogger.info("adminDeleteFaqAction", { adminId: admin.uid, faqId: id });
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listFaqsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<FAQDocument>> {
  const sieve: SieveModel = {
    filters: params?.filters,
    sorts: params?.sorts ?? "order",
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
  };
  return faqsRepository.list(sieve);
}

export async function listPublicFaqsAction(
  category?: string,
  limit = 20,
): Promise<FAQDocument[]> {
  const filters = ["isActive==true"];
  if (category) {
    filters.push(`category==${category}`);
  }
  const result = await faqsRepository.list({
    filters: filters.join(","),
    sorts: "-priority,order",
    page: 1,
    pageSize: limit,
  });
  return result.items;
}

export async function getFaqByIdAction(
  id: string,
): Promise<FAQDocument | null> {
  return faqsRepository.findById(id);
}

