"use client";

import { useApiMutation } from "./useApiMutation";
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
  return useApiMutation<VoteFaqResult, VoteFaqInput>({
    mutationFn: (data) => voteFaqAction(data),
  });
}
