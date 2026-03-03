"use client";

/**
 * ChatList
 *
 * Lists all chat rooms the authenticated user participates in, ordered by
 * most recent message. Clicking a room navigates to that chat via the
 * ?chatId= query param on the messages page.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  Heading,
  Text,
  Caption,
  Skeleton,
  EmptyState,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useChatRooms } from "@/hooks";
import { useAuth } from "@/hooks";

const { spacing, themed } = THEME_CONSTANTS;

export function ChatList() {
  const t = useTranslations("chat");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chatId");
  const { user } = useAuth();

  const { data, isLoading } = useChatRooms();
  const rooms = (data?.rooms ?? []) as unknown as Array<{
    id: string;
    buyerId: string;
    sellerId: string;
    buyerName?: string;
    sellerName?: string;
    lastMessage?: string;
    lastMessageAt?: { _seconds: number } | string;
    updatedAt?: { _seconds: number } | string;
  }>;

  if (isLoading) {
    return (
      <div className={spacing.stack}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return <EmptyState title={t("noRooms")} description={t("noRoomsDesc")} />;
  }

  return (
    <div className={`${spacing.stack} gap-2`}>
      {rooms.map((room) => {
        const isActive = room.id === activeChatId;
        const isBuyer = room.buyerId === user?.uid;
        const participantName = isBuyer
          ? (room.sellerName ?? t("seller"))
          : (room.buyerName ?? t("buyer"));

        const rawTime = room.lastMessageAt ?? room.updatedAt;
        const lastTime = rawTime
          ? typeof rawTime === "object" && "_seconds" in rawTime
            ? formatDate(new Date(rawTime._seconds * 1000))
            : formatDate(new Date(rawTime as string))
          : "";

        return (
          <button
            key={room.id}
            onClick={() =>
              router.push(`${ROUTES.USER.MESSAGES}?chatId=${room.id}`)
            }
            className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
              isActive
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700"
                : `${themed.bgPrimary} ${themed.border} hover:bg-gray-50 dark:hover:bg-gray-800`
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <Text weight="medium" size="sm">
                {participantName}
              </Text>
              {lastTime && (
                <Caption className="text-xs shrink-0">{lastTime}</Caption>
              )}
            </div>
            {room.lastMessage && (
              <Caption className="truncate mt-0.5">{room.lastMessage}</Caption>
            )}
          </button>
        );
      })}
    </div>
  );
}
