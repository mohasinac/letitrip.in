/**
 * Copilot Feature Types
 */

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  durationMs?: number;
  feedback?: "positive" | "negative" | null;
}

export interface CopilotChatResponse {
  response: string;
  conversationId: string;
  model: string;
  durationMs: number;
}

export interface CopilotHistoryResponse {
  messages: Array<{
    id: string;
    prompt: string;
    response: string;
    createdAt: string;
    durationMs?: number;
    feedback?: "positive" | "negative" | null;
  }>;
}
