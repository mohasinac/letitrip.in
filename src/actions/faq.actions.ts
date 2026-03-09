"use server";

/**
 * FAQ Server Actions
 *
 * Vote on a FAQ as helpful or not-helpful, bypassing the
 * service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { faqsRepository } from "@/repositories";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { ERROR_MESSAGES } from "@/constants";

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
