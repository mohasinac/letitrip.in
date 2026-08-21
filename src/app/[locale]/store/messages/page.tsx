"use client";
/**
 * /store/messages — seller-side conversation list + chat window (P-11).
 *
 * Mirrors /user/messages but scoped to the seller's store via
 * /api/store/conversations (listConversationsForStore) and the seller's own
 * unread counter (unreadSeller). Per-conversation send/read/detail reuse the
 * same role-agnostic /api/user/conversations/[id]/* routes the buyer page
 * uses — resolveConversationRole already grants the store owner access.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, Link as I18nLink } from "@/i18n/navigation";
import {
  ChatList,
  ChatWindow,
  Div,
  Heading,
  MessagesView,
  Row,
  Stack,
  Text,
  Button,
  Textarea,
  ROUTES,
  useUrlTable,
  type ConversationDocument,
  type ConversationMessage,
  useConversation,
  useConversations,
  useSession,
  Skeleton,
  SELLER_ENDPOINTS,
} from "@mohasinac/appkit/client";
import { Span } from "@mohasinac/appkit/ui";

const PAGE_CONTAINER = "w-full max-w-6xl mx-auto h-full min-h-[600px]";
const ITEM_BASE =
  "w-full rounded-lg border border-[var(--appkit-color-border-subtle)] p-[var(--appkit-space-3)] text-left transition-colors";
const ITEM_IDLE = "bg-[var(--appkit-color-surface)] hover:bg-[var(--appkit-color-surface)]";
const ITEM_ACTIVE = "bg-primary/10 border-primary";
const UNREAD_DOT =
  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-error-solid px-[var(--appkit-space-1-5)] text-[length:var(--appkit-text-xs)] font-semibold text-error-on-solid";
const MESSAGE_LIST_CLASS =
  "flex flex-1 flex-col gap-[var(--appkit-space-2)] overflow-y-auto py-[var(--appkit-space-3)] min-h-[300px]";
const BUBBLE_MINE =
  "self-end rounded-2xl rounded-br-sm bg-primary px-[var(--appkit-space-3)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] text-white max-w-[80%] whitespace-pre-wrap";
const BUBBLE_THEIRS =
  "self-start rounded-2xl rounded-bl-sm bg-[var(--appkit-color-surface)] px-[var(--appkit-space-3)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] text-[var(--appkit-color-text)] max-w-[80%] whitespace-pre-wrap";
const INPUT_ROW =
  "flex items-end gap-[var(--appkit-space-2)] border-t border-[var(--appkit-color-border-subtle)] pt-[var(--appkit-space-3)]";

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
  mobileHref: string;
}

function ConversationListItem({ conversation, active, onSelect, mobileHref }: ConversationListItemProps) {
  return (
    <I18nLink
      href={mobileHref}
      onClick={(e) => {
        if (typeof window !== "undefined" && window.matchMedia?.("(min-width: 1024px)")?.matches) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`${ITEM_BASE} block ${active ? ITEM_ACTIVE : ITEM_IDLE}`}
    >
      <Row justify="between" align="start" gap="sm">
        <Div className="min-w-0 flex-1">
          <Text className="line-clamp-1" color="primary" size="sm" weight="semibold">
            {conversation.buyerDisplayName || "Buyer"}
          </Text>
          {conversation.productTitle && (
            <Text variant="secondary" className="line-clamp-1" size="xs">
              {conversation.productTitle}
            </Text>
          )}
          <Text variant="secondary" className="line-clamp-1 mt-1" size="xs">
            {conversation.lastMessage}
          </Text>
        </Div>
        <Stack gap="xs" className="shrink-0" align="end">
          <Text variant="secondary" size="xs">
            {relativeTime(conversation.lastMessageAt)}
          </Text>
          {conversation.unreadSeller > 0 && (
            <Span className={UNREAD_DOT}>{conversation.unreadSeller}</Span>
          )}
        </Stack>
      </Row>
    </I18nLink>
  );
}

interface MessageBubbleProps {
  message: ConversationMessage;
  isMine: boolean;
}

function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <Stack align={isMine ? "end" : "start"}>
      <Div className={isMine ? BUBBLE_MINE : BUBBLE_THEIRS}>{message.body}</Div>
      <Text variant="secondary" className="text-[10px] mt-0.5 px-[0.25rem]">
        {relativeTime(message.sentAt)}
      </Text>
    </Stack>
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
      <Textarea
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
        className="flex-1 resize-none rounded-lg border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-3)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] focus:border-primary focus:outline-none"
      />
      <Button rounded="lg"
        type="button"
        onClick={() => void handleSubmit()}
        disabled={disabled || submitting || draft.trim().length === 0}
        className="bg-primary px-[var(--appkit-space-4)] py-[var(--appkit-space-2)] text-[length:var(--appkit-text-sm)] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sendLabel}
      </Button>
    </Row>
  );
}

export default function StoreMessagesPage() {
  const { user } = useSession();
  const userId = user?.uid ?? null;
  const { conversations, isLoading, refetch } = useConversations(userId, {
    endpoint: SELLER_ENDPOINTS.CONVERSATIONS,
    unreadField: "unreadSeller",
  });
  const table = useUrlTable({ defaults: {} });
  const router = useRouter();
  const urlActive = table.get("c") ?? null;
  const [activeId, setActiveIdState] = useState<string | null>(urlActive ?? null);
  const { conversation, sendMessage, markRead, isConnected } = useConversation(activeId);
  const messageListRef = useRef<HTMLDivElement | null>(null);

  const setActiveId = (id: string | null) => {
    setActiveIdState(id);
    table.set("c", id ?? "");
  };

  useEffect(() => {
    if (urlActive !== activeId) setActiveIdState(urlActive);
  }, [urlActive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeId || conversations.length === 0) return;
    if (!window.matchMedia?.("(min-width: 1024px)")?.matches) return;
    setActiveId(conversations[0].id);
  }, [activeId, conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  const messageCount = conversation?.messages.length ?? 0;
  useEffect(() => {
    if (!activeId || !conversation) return;
    if (conversation.unreadSeller > 0) {
      void markRead();
      void refetch();
    }
  }, [activeId, conversation, markRead, refetch, messageCount]);

  useEffect(() => {
    const el = messageListRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messageCount]);

  const totalUnread = useMemo(
    () => conversations.reduce((s, c) => s + (c.unreadSeller ?? 0), 0),
    [conversations],
  );

  if (!userId) {
    return (
      <Div className={PAGE_CONTAINER}>
        <Text paddingY="3xl" variant="secondary" align="center">
          Sign in to view your conversations.
        </Text>
      </Div>
    );
  }

  return (
    <Div className={PAGE_CONTAINER}>
      <Row justify="between" align="end" wrap gap="3" className="mb-4">
        <Div>
          <Heading level={1} weight="semibold" size="2xl">
            Messages
          </Heading>
          <Text variant="secondary" className="mt-0.5" size="sm">
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
              <Stack gap="sm" padding="y-xs">
                <Skeleton variant="rectangular" height="56px" />
                <Skeleton variant="rectangular" height="56px" />
                <Skeleton variant="rectangular" height="56px" />
              </Stack>
            )}
            renderEmptyState={() => (
              <Stack padding="y-lg" align="center">
                <Text variant="secondary" size="sm" align="center">
                  No buyer conversations yet.
                </Text>
              </Stack>
            )}
            renderList={() => (
              <Stack gap="sm">
                {conversations.map((c) => (
                  <ConversationListItem
                    key={c.id}
                    conversation={c}
                    active={activeId === c.id}
                    onSelect={() => setActiveId(c.id)}
                    mobileHref={`${String(ROUTES.STORE.MESSAGES)}?c=${c.id}`}
                  />
                ))}
              </Stack>
            )}
          />
        )}
        renderMobileBack={() => (
          <Button
            type="button"
            onClick={() => {
              setActiveId(null);
              router.push(String(ROUTES.STORE.MESSAGES));
            }}
            className="md:hidden self-start text-[length:var(--appkit-text-sm)] text-primary hover:underline pb-[var(--appkit-space-2)]"
          >
            ← Back to conversations
          </Button>
        )}
        renderChatWindow={() =>
          conversation ? (
            <ChatWindow
              isConnected={isConnected}
              labels={{
                title: conversation.buyerDisplayName || "Buyer",
                connected: "Live",
                disconnected: "Reconnecting…",
              }}
              renderMessages={() => (
                <Div ref={messageListRef} className={MESSAGE_LIST_CLASS}>
                  {conversation.messages.length === 0 ? (
                    <Stack padding="y-lg" align="center">
                      <Text variant="secondary" size="sm" align="center">
                        No messages yet — say hello!
                      </Text>
                    </Stack>
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
            <Text paddingY="lg" variant="secondary" size="sm" align="center">
              Loading conversation…
            </Text>
          )
        }
      />
    </Div>
  );
}
