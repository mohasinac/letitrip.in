/**
 * useCopilotFeedback
 *
 * Hook to send thumbs-up / thumbs-down feedback on a copilot response.
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/classes";
import { API_ENDPOINTS } from "@/constants";

export function useCopilotFeedback() {
  return useMutation({
    mutationFn: async ({
      logId,
      feedback,
    }: {
      logId: string;
      feedback: "positive" | "negative";
    }) => {
      await apiClient.patch(API_ENDPOINTS.COPILOT.FEEDBACK(logId), {
        feedback,
      });
    },
  });
}
