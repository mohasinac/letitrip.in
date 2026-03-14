/**
 * User Messages Page
 *
 * Route: /user/messages
 * Route: /user/messages?chatId=xxx  (open a specific chat)
 *
 * Thin shell — auth-gated by UserLayout, logic lives in MessagesView.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyState, Spinner } from "@/components";
import { FEATURE_FLAGS, SITE_CONFIG, THEME_CONSTANTS } from "@/constants";
import { MessagesView } from "@/features/user";
import { getTranslations } from "next-intl/server";

const { flex, page } = THEME_CONSTANTS;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("chat");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

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
