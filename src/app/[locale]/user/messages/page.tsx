/**
 * User Messages Page
 *
 * Route: /user/messages
 * Route: /user/messages?chatId=xxx  (open a specific chat)
 *
 * Thin shell — auth-gated by UserLayout, logic lives in MessagesView.
 */

import { Suspense } from "react";
import { EmptyState, Spinner } from "@/components";
import { FEATURE_FLAGS, THEME_CONSTANTS } from "@/constants";
import { MessagesView } from "@/features/user";
import { getTranslations } from "next-intl/server";

const { flex, page } = THEME_CONSTANTS;

export default async function UserMessagesPage() {
  if (!FEATURE_FLAGS.CHAT_ENABLED) {
    const t = await getTranslations("nav");
    return (
      <div className={`${flex.hCenter} ${page.empty}`}>
        <EmptyState
          title={t("chatComingSoon")}
          description={t("chatComingSoonDesc")}
        />
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <MessagesView />
    </Suspense>
  );
}
