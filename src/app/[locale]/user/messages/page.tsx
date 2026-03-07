/**
 * User Messages Page
 *
 * Route: /user/messages
 * Route: /user/messages?chatId=xxx  (open a specific chat)
 *
 * Two-pane layout: room list on the left, active chat on the right.
 * On mobile, shows one pane at a time.
 */

"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks";
import { Spinner, EmptyState } from "@/components";
import { ROUTES, THEME_CONSTANTS, FEATURE_FLAGS } from "@/constants";
import { MessagesView } from "@/features/user";

const { flex, page } = THEME_CONSTANTS;

export default function UserMessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={`${flex.hCenter} ${page.empty}`}>
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  if (!FEATURE_FLAGS.CHAT_ENABLED) {
    return (
      <div className={`${flex.hCenter} ${page.empty}`}>
        <EmptyState
          title="Chat Coming Soon"
          description="Messaging between buyers and sellers will be available shortly."
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
