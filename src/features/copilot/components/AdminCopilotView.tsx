/**
 * AdminCopilotView
 *
 * Tier 2 — feature component.
 * Staff AI copilot chat interface in the admin panel.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import {
  AdminPageHeader,
  Button,
  Card,
  Heading,
  Span,
  Text,
} from "@/components";
import { useCopilotChat } from "../hooks";
import type { CopilotMessage } from "../types";

const { themed, spacing, typography, flex } = THEME_CONSTANTS;

export function AdminCopilotView() {
  const t = useTranslations("copilot");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, startNewConversation, isLoading, error } =
    useCopilotChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <section className={spacing.page}>
      <AdminPageHeader
        title={t("title")}
        actions={
          <Button variant="outline" size="sm" onClick={startNewConversation}>
            {t("newConversation")}
          </Button>
        }
      />

      <Card className="flex flex-col h-[calc(100vh-220px)] xl:h-[calc(100vh-180px)]">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className={`${flex.center} flex-col h-full text-center`}>
              <Heading as="h3" className={typography.heading.sm}>
                {t("noMessages")}
              </Heading>
              <Text className="text-muted-foreground mt-2">
                {t("noMessagesDesc")}
              </Text>
            </div>
          )}

          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-3 ${themed.surface}`}>
                <Span className="text-muted-foreground animate-pulse">
                  {t("thinking")}
                </Span>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg p-3 bg-destructive/10 text-destructive">
              <Text>{t("errorGeneration")}</Text>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t p-4 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            disabled={isLoading}
            className={`flex-1 rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${themed.input}`}
            maxLength={4000}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {t("send")}
          </Button>
        </form>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ChatBubble — renders a single message
// ---------------------------------------------------------------------------

function ChatBubble({ message }: { message: CopilotMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : `${themed.surface} border`
        }`}
      >
        <Text className="whitespace-pre-wrap text-sm">{message.content}</Text>
        {message.durationMs != null && !isUser && (
          <Span className="text-xs text-muted-foreground mt-1 block">
            {message.durationMs}ms
          </Span>
        )}
      </div>
    </div>
  );
}
