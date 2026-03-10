"use client";

import { useMutation } from "@tanstack/react-query";
import {
  voteFaqAction,
  type VoteFaqInput,
  type VoteFaqResult,
} from "@/actions";

/**
 * useFaqVote
 *
 * Mutation hook for voting an FAQ as helpful or not-helpful.
 * Wraps `voteFaqAction` (Server Action) to keep client components free of
 * @/services imports (Rule 20).
 *
 * @example
 * const mutation = useFaqVote();
 * mutation.mutate({ faqId, vote: "helpful" });
 */
export function useFaqVote() {
  return useMutation<VoteFaqResult, Error, VoteFaqInput>({
    mutationFn: (data) => voteFaqAction(data),
  });
}
