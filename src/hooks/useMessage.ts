"use client";
/**
 * useMessage Hook
 *
 * Manage temporary success/error messages
 */

import { useState, useCallback, useRef, useEffect } from "react";

type MessageType = "success" | "error";

export function useMessage() {
  const [message, setMessage] = useState<{
    type: MessageType;
    text: string;
  } | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showSuccess = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage({ type: "success", text });
    timerRef.current = setTimeout(() => setMessage(null), 5000);
  }, []);

  const showError = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage({ type: "error", text });
    timerRef.current = setTimeout(() => setMessage(null), 5000);
  }, []);

  const clearMessage = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(null);
  }, []);

  return { message, showSuccess, showError, clearMessage };
}
