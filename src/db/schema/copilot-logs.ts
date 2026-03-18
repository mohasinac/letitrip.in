/**
 * Copilot Chat Logs Collection Schema
 *
 * Firestore schema for staff AI copilot conversation logs.
 * Each document represents a single message exchange (user prompt + AI response).
 * Grouped by conversationId for session threading.
 */

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================

export interface CopilotLogDocument {
  id: string;
  /** Firebase UID of the staff member */
  userId: string;
  /** Staff member display name (denormalized for quick reads) */
  userName: string;
  /** Groups messages into a single conversation thread */
  conversationId: string;
  /** The user's prompt */
  prompt: string;
  /** The AI model's response */
  response: string;
  /** Model used (e.g. "gemini-2.0-flash") */
  model: string;
  /** Prompt token count */
  promptTokens?: number;
  /** Response token count */
  responseTokens?: number;
  /** Latency in ms */
  durationMs?: number;
  /** Whether the response was rated helpful by the user */
  feedback?: "positive" | "negative" | null;
  createdAt: Date;
}

export interface CopilotLogCreateInput {
  userId: string;
  userName: string;
  conversationId: string;
  prompt: string;
  response: string;
  model: string;
  promptTokens?: number;
  responseTokens?: number;
  durationMs?: number;
}

export const COPILOT_LOGS_COLLECTION = "copilotLogs" as const;
