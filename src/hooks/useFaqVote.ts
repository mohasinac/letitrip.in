"use client";

import { useApiMutation } from "./useApiMutation";
import { faqService } from "@/services";

interface FaqVotePayload {
  faqId: string;
  vote: "helpful" | "not-helpful";
}

/**
 * useFaqVote
 *
 * Mutation hook for voting an FAQ as helpful or not-helpful.
 * Wraps faqService.vote() to keep client components free of @/services imports (Rule 20).
 *
 * @example
 * const mutation = useFaqVote();
 * mutation.mutate({ faqId, vote: "helpful" });
 */
export function useFaqVote() {
  return useApiMutation<void, FaqVotePayload>({
    mutationFn: (d) => faqService.vote(d.faqId, { vote: d.vote }),
  });
}
