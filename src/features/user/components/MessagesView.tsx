"use client";

import { Button } from "@mohasinac/appkit/ui";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks";
import { EmptyState } from "@/components";
import { MessagesView as AppkitMessagesView } from "@mohasinac/appkit/features/account";
import { ROUTES } from "@/constants";
import { ChatList } from "./ChatList";
import { ChatWindow } from "./ChatWindow";

export function MessagesView() {
  const t = useTranslations("chat");
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  const { user } = useAuth();

  return (
    <AppkitMessagesView
      chatId={chatId ?? undefined}
      renderChatList={() => <ChatList />}
      renderChatWindow={() =>
        chatId ? (
          <ChatWindow chatId={chatId} currentUserId={user?.uid ?? ""} />
        ) : null
      }
      renderMobileBack={() => (
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden self-start"
          onClick={() => router.push(ROUTES.USER.MESSAGES)}
        >
          â† {t("backToList")}
        </Button>
      )}
      renderEmptyState={() => (
        <EmptyState title={t("selectChat")} description={t("selectChatDesc")} />
      )}
    />
  );
}
