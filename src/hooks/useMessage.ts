/**
 * useMessage Hook
 *
 * Manage temporary success/error messages
 */

import { useState, useCallback } from "react";

type MessageType = "success" | "error";

export function useMessage() {
  const [message, setMessage] = useState<{
    type: MessageType;
    text: string;
  } | null>(null);

  const showSuccess = useCallback((text: string) => {
    setMessage({ type: "success", text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const showError = useCallback((text: string) => {
    setMessage({ type: "error", text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, showSuccess, showError, clearMessage };
}
