/**
 * useCopilotChat
 *
 * Hook for the staff AI copilot chat interface.
 * Sends prompts to /api/copilot/chat and manages local message state.
 */

"use client";

import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
import type { CopilotMessage, CopilotChatResponse } from "../types";

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useCopilotChat() {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [conversationId, setConversationId] = useState(generateConversationId);

  const mutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await apiClient.post<{
        success: boolean;
        data: CopilotChatResponse;
      }>(API_ENDPOINTS.COPILOT.CHAT, { prompt, conversationId });
      return res.data;
    },
    onMutate: (prompt) => {
      const userMsg: CopilotMessage = {
        id: `user_${Date.now()}`,
        role: "user",
        content: prompt,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
    },
    onSuccess: (data) => {
      const aiMsg: CopilotMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: data.response,
        createdAt: new Date().toISOString(),
        durationMs: data.durationMs,
      };
      setMessages((prev) => [...prev, aiMsg]);
    },
  });

  const sendMessage = useCallback(
    (prompt: string) => {
      if (!prompt.trim()) return;
      mutation.mutate(prompt);
    },
    [mutation],
  );

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(generateConversationId());
  }, []);

  return {
    messages,
    conversationId,
    sendMessage,
    startNewConversation,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
