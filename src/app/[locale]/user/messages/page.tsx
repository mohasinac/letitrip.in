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
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";
import { Spinner } from "@/components";
import { ROUTES } from "@/constants";
import { MessagesView } from "@/features/user";

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
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <Suspense fallback={<Spinner />}>
      <MessagesView />
    </Suspense>
  );
}
