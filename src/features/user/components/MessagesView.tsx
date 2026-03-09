"use client";

/**
 * MessagesView
 *
 * Responsive two-pane layout:
 *   - Left: ChatList (room list)
 *   - Right: ChatWindow (active chat)
 *
 * Both panes collapse to single-pane on mobile:
 *   - No chatId in URL → show ChatList
 *   - chatId in URL → show ChatWindow (with back button on mobile)
 */

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks";
import { Heading, Button } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";

const { spacing, flex, themed } = THEME_CONSTANTS;

export function MessagesView() {
  const t = useTranslations("chat");
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-4 h-full min-h-[600px]">
      {/* Room list — hidden on mobile when a chat is open */}
      <div
        className={`${chatId ? "hidden md:block" : "block"} ${spacing.stack}`}
      >
        <Heading level={3} className="mb-3">
          {t("title")}
        </Heading>
        <ChatList />
      </div>

      {/* Chat window — shown when chatId is in URL */}
      {chatId ? (
        <div className="flex flex-col gap-3">
          {/* Mobile back button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden self-start"
            onClick={() => router.push(ROUTES.USER.MESSAGES)}
          >
            ← {t("backToList")}
          </Button>
          <ChatWindow chatId={chatId} currentUserId={user?.uid ?? ""} />
        </div>
      ) : (
        /* Desktop: empty state when no chat selected */
        <div
          className={`hidden md:${flex.center} text-zinc-400 dark:text-zinc-600 border border-dashed ${themed.border} rounded-xl`}
        >
          {t("selectRoom")}
        </div>
      )}
    </div>
  );
}
