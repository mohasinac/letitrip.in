"use client";
/* eslint-disable lir/no-raw-html-elements, lir/no-raw-media-elements -- LR1-13: legacy raw HTML — migration tracked in crud-tracker.md Tier LR (row LR1-13) */
/**
 * /user/messages — buyer-side conversation list + chat window (D5 + VC7).
 *
 * Wires the appkit shells (MessagesView, ChatList, ChatWindow) to live data
 * via `useConversations` + `useConversation`. Realtime via RTDB ping paths
 * (`chats/{convId}/lastUpdate`, `chats/user/{uid}/lastUpdate`) — no polling.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChatList,
  ChatWindow,
  Div,
  Heading,
  MessagesView,
  Row,
  Stack,
  Text,
  type ConversationDocument,
  type ConversationMessage,
  useConversation,
  useConversations,
  useSession,
} from "@mohasinac/appkit/client";

const PAGE_CONTAINER = "w-full max-w-6xl mx-auto h-full min-h-[600px]";
const ITEM_BASE =
  "w-full rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-left transition-colors";
const ITEM_IDLE = "bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800";
const ITEM_ACTIVE = "bg-primary/10 border-primary";
const UNREAD_DOT =
  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white";
const MESSAGE_LIST_CLASS =
  "flex flex-1 flex-col gap-2 overflow-y-auto py-3 min-h-[300px]";
const BUBBLE_MINE =
  "self-end rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-white max-w-[80%] whitespace-pre-wrap";
const BUBBLE_THEIRS =
  "self-start rounded-2xl rounded-bl-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 max-w-[80%] whitespace-pre-wrap";
const INPUT_ROW =
  "flex items-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3";

function relativeTime(d: Date | string): string {
  const t = d instanceof Date ? d.getTime() : new Date(d).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.round(h / 24);
  return `${days}d`;
}

interface ConversationListItemProps {
  conversation: ConversationDocument;
  active: boolean;
  onSelect: () => void;
}

function ConversationListItem({ conversation, active, onSelect }: ConversationListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${ITEM_BASE} ${active ? ITEM_ACTIVE : ITEM_IDLE}`}
    >
      <Row justify="between" align="start" gap="sm">
        <Div className="min-w-0 flex-1">
          <Text className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {conversation.storeName || conversation.sellerDisplayName}
          </Text>
          {conversation.productTitle && (
            <Text variant="secondary" className="text-xs line-clamp-1">
              {conversation.productTitle}
            </Text>
          )}
          <Text variant="secondary" className="text-xs line-clamp-1 mt-1">
            {conversation.lastMessage}
          </Text>
        </Div>
        <Stack gap="xs" className="items-end shrink-0">
          <Text variant="secondary" className="text-xs">
            {relativeTime(conversation.lastMessageAt)}
          </Text>
          {conversation.unreadBuyer > 0 && (
            <span className={UNREAD_DOT}>{conversation.unreadBuyer}</span>
          )}
        </Stack>
      </Row>
    </button>
  );
}

interface MessageBubbleProps {
  message: ConversationMessage;
  isMine: boolean;
}

function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <Div className="flex flex-col" style={{ alignItems: isMine ? "flex-end" : "flex-start" }}>
      <Div className={isMine ? BUBBLE_MINE : BUBBLE_THEIRS}>{message.body}</Div>
      <Text variant="secondary" className="text-[10px] mt-0.5 px-1">
        {relativeTime(message.sentAt)}
      </Text>
    </Div>
  );
}

interface MessageInputProps {
  disabled: boolean;
  onSend: (body: string) => Promise<void>;
  placeholder: string;
  sendLabel: string;
}

function MessageInput({ disabled, onSend, placeholder, sendLabel }: MessageInputProps) {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = draft.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSend(trimmed);
      setDraft("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Row className={INPUT_ROW} gap="sm">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void handleSubmit();
          }
        }}
        placeholder={placeholder}
        rows={2}
        disabled={disabled || submitting}
        className="flex-1 resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={disabled || submitting || draft.trim().length === 0}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sendLabel}
      </button>
    </Row>
  );
}

export default function UserMessagesPage() {
  const { user } = useSession();
  const userId = user?.uid ?? null;
  const { conversations, isLoading, refetch } = useConversations(userId);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { conversation, sendMessage, markRead, isConnected } = useConversation(activeId);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  // Auto-select first conversation on first load.
  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);

  // Mark read whenever the active conversation has unread messages from the seller.
  const messageCount = conversation?.messages.length ?? 0;
  useEffect(() => {
    if (!activeId || !conversation) return;
    if (conversation.unreadBuyer > 0) {
      void markRead();
      void refetch();
    }
  }, [activeId, conversation, markRead, refetch, messageCount]);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    const el = messageListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messageCount]);

  const totalUnread = useMemo(
    () => conversations.reduce((s, c) => s + (c.unreadBuyer ?? 0), 0),
    [conversations],
  );

  if (!userId) {
    return (
      <Div className={PAGE_CONTAINER}>
        <Text variant="secondary" className="py-12 text-center">
          Sign in to view your conversations.
        </Text>
      </Div>
    );
  }

  return (
    <Div className={PAGE_CONTAINER}>
      <Row justify="between" align="end" wrap gap="3" className="mb-4">
        <Div>
          <Heading level={1} className="text-2xl font-semibold">
            Messages
          </Heading>
          <Text variant="secondary" className="text-sm mt-0.5">
            {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
            {totalUnread > 0 ? ` · ${totalUnread} unread` : ""}
          </Text>
        </Div>
      </Row>

      <MessagesView
        chatId={activeId}
        labels={{ title: "Conversations", selectRoom: "Select a conversation to start chatting" }}
        renderChatList={() => (
          <ChatList
            isLoading={isLoading}
            hasItems={conversations.length > 0}
            renderLoading={() => (
              <Text variant="secondary" className="text-sm py-6 text-center">
                Loading…
              </Text>
            )}
            renderEmptyState={() => (
              <Text variant="secondary" className="text-sm py-6 text-center">
                You haven't started any conversations yet.
              </Text>
            )}
            renderList={() => (
              <Stack gap="sm">
                {conversations.map((c) => (
                  <ConversationListItem
                    key={c.id}
                    conversation={c}
                    active={activeId === c.id}
                    onSelect={() => setActiveId(c.id)}
                  />
                ))}
              </Stack>
            )}
          />
        )}
        renderMobileBack={() => (
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="md:hidden self-start text-sm text-primary hover:underline pb-2"
          >
            ← Back to conversations
          </button>
        )}
        renderChatWindow={() =>
          conversation ? (
            <ChatWindow
              isConnected={isConnected}
              labels={{
                title: conversation.storeName || conversation.sellerDisplayName,
                connected: "Live",
                disconnected: "Reconnecting…",
              }}
              renderMessages={() => (
                <Div ref={messageListRef} className={MESSAGE_LIST_CLASS}>
                  {conversation.messages.length === 0 ? (
                    <Text variant="secondary" className="text-sm py-6 text-center">
                      No messages yet — say hello!
                    </Text>
                  ) : (
                    conversation.messages.map((m) => (
                      <MessageBubble
                        key={m.id}
                        message={m}
                        isMine={m.senderId === userId}
                      />
                    ))
                  )}
                </Div>
              )}
              renderInput={() => (
                <MessageInput
                  disabled={false}
                  onSend={sendMessage}
                  placeholder="Type a message…"
                  sendLabel="Send"
                />
              )}
            />
          ) : (
            <Text variant="secondary" className="text-sm py-6 text-center">
              Loading conversation…
            </Text>
          )
        }
      />
    </Div>
  );
}
