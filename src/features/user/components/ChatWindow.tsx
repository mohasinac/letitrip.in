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
import { ChatWindow as AppkitChatWindow } from "@mohasinac/appkit/features/account";
import {
  Caption,
  Heading,
  Text,
  Spinner,
  Span,
  Button,
} from "@mohasinac/appkit/ui";
import { Alert, Card, Textarea } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useChat } from "@/hooks";

const { spacing, themed, card, flex, overflow } = THEME_CONSTANTS;

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
    <Card className="flex flex-col h-full min-h-[360px] sm:min-h-[420px] xl:min-h-[540px] max-h-[600px] xl:max-h-[760px] 2xl:max-h-[840px] p-4">
      <AppkitChatWindow
        labels={{
          title: participantName ?? t("chat"),
          connected: t("connected"),
          disconnected: t("disconnected"),
        }}
        isConnected={isConnected}
        isLoading={isLoading}
        renderLoadingIndicator={() => <Spinner size="sm" />}
        error={
          error ? (
            <Alert variant="warning" className="mb-3">
              {error}
            </Alert>
          ) : undefined
        }
        renderMessages={() => (
          <div
            className={`${flex.growMinH} ${overflow.yAuto} flex flex-col gap-3 pr-1`}
          >
            {messages.length === 0 && !isLoading && (
              <div className={`${flex.center} h-full`}>
                <Caption>{t("noMessages")}</Caption>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.userId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 ${
                      isMine ? card.chatBubble.mine : card.chatBubble.theirs
                    }`}
                  >
                    {!isMine && (
                      <Caption variant="accent" className="mb-0.5">
                        {msg.userName}
                      </Caption>
                    )}
                    <Text
                      size="sm"
                      className={isMine ? "text-white" : undefined}
                    >
                      {msg.message}
                    </Text>
                    <Caption
                      variant={isMine ? "inverse" : "default"}
                      className="mt-0.5"
                    >
                      {formatDate(msg.timestamp)}
                    </Caption>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
        renderInput={() => (
          <div
            className={`mt-3 pt-3 border-t ${themed.border} flex gap-2 items-end`}
          >
            <div className="flex-1">
              <Textarea
                className="resize-none min-h-[40px] max-h-[120px]"
                rows={1}
                placeholder={t("inputPlaceholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!isConnected || isSending}
                aria-label={t("inputPlaceholder")}
              />
            </div>
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
        )}
      />
    </Card>
  );
}
