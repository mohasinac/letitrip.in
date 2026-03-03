"use client";

/**
 * ChatWindow
 *
 * Real-time buyer↔seller chat for a single room.
 * Subscribes to RTDB /chat/{chatId}/messages via useChat().
 * Messages are sent through POST /api/chat/{chatId}/messages (server write).
 *
 * @example
 * ```tsx
 * <ChatWindow chatId="chat_buyerUid_sellerUid_orderId" currentUserId={uid} />
 * ```
 */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import {
  Card,
  Heading,
  Text,
  Caption,
  Button,
  Spinner,
  Alert,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useChat } from "@/hooks";

const { spacing, themed } = THEME_CONSTANTS;

interface Props {
  chatId: string;
  currentUserId: string;
  /** Shown in the header — e.g. seller display name or buyer display name */
  participantName?: string;
}

export function ChatWindow({ chatId, currentUserId, participantName }: Props) {
  const t = useTranslations("chat");
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, isConnected, isLoading, error } =
    useChat(chatId);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    setText("");
    setIsSending(true);
    try {
      await sendMessage(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card
      className={`flex flex-col h-full min-h-[420px] max-h-[700px] ${spacing.padding.md}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between pb-3 border-b ${themed.border} mb-3`}
      >
        <div className="flex items-center gap-2">
          <Heading level={4}>{participantName ?? t("chat")}</Heading>
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-gray-400"}`}
            aria-label={isConnected ? t("connected") : t("disconnected")}
          />
        </div>
        {isLoading && <Spinner size="sm" />}
      </div>

      {/* Error */}
      {error && (
        <Alert variant="warning" className="mb-3">
          {error}
        </Alert>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <Caption>{t("noMessages")}</Caption>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.userId === currentUserId;
          const time = new Date(msg.timestamp);
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isMine
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-gray-100 dark:bg-gray-800 rounded-bl-sm"
                }`}
              >
                {!isMine && (
                  <Caption className="text-xs font-semibold mb-0.5 text-indigo-600 dark:text-indigo-400">
                    {msg.userName}
                  </Caption>
                )}
                <Text size="sm" className={isMine ? "text-white" : undefined}>
                  {msg.message}
                </Text>
                <Caption
                  className={`text-xs mt-0.5 ${isMine ? "text-indigo-200" : "text-gray-400"}`}
                >
                  {formatDate(time)}
                </Caption>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className={`mt-3 pt-3 border-t ${themed.border} flex gap-2 items-end`}
      >
        <textarea
          className={`flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 ${themed.bgPrimary} px-3 py-2 text-sm ${themed.textPrimary} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[40px] max-h-[120px]`}
          rows={1}
          placeholder={t("inputPlaceholder")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isConnected || isSending}
          aria-label={t("inputPlaceholder")}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          isLoading={isSending}
          disabled={!text.trim() || !isConnected || isSending}
          aria-label={t("send")}
        >
          {t("send")}
        </Button>
      </div>
    </Card>
  );
}
