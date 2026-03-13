"use client";

/**
 * ChatList
 *
 * Lists all chat rooms the authenticated user participates in, ordered by
 * most recent message. Clicking a room navigates to that chat via the
 * ?chatId= query param on the messages page.
 */

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Button,
  Heading,
  Text,
  Caption,
  Skeleton,
  EmptyState,
  ConfirmDeleteModal,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useChatRooms, useDeleteChatRoom, useIsAdmin } from "@/hooks";
import { useAuth } from "@/hooks";

const { spacing, themed, flex } = THEME_CONSTANTS;

export function ChatList() {
  const t = useTranslations("chat");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chatId");
  const { user } = useAuth();
  const isAdmin = useIsAdmin();

  const { data, isLoading, refetch } = useChatRooms();
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteChatRoom();

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const rooms = (data ?? []) as unknown as Array<{
    id: string;
    buyerId: string;
    sellerId: string;
    isGroup?: boolean;
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

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    try {
      await deleteRoom(id);
    } finally {
      setConfirmDeleteId(null);
      refetch();
    }
  };

  return (
    <>
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
            <div key={room.id} className="relative group">
              <Button
                variant="ghost"
                onClick={() =>
                  router.push(`${ROUTES.USER.MESSAGES}?chatId=${room.id}`)
                }
                className={`w-full text-left rounded-xl border px-4 py-3 pr-10 transition-colors ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700"
                    : `${themed.bgPrimary} ${themed.border} hover:bg-zinc-50 dark:hover:bg-slate-800`
                }`}
              >
                <div className={`${flex.betweenStart} gap-2`}>
                  <Text weight="medium" size="sm">
                    {participantName}
                  </Text>
                  {lastTime && (
                    <Caption className="text-xs shrink-0">{lastTime}</Caption>
                  )}
                </div>
                {room.lastMessage && (
                  <Caption className="truncate mt-0.5">
                    {room.lastMessage}
                  </Caption>
                )}
              </Button>

              {/* Delete button — visible on hover (or always on touch devices) */}
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("deleteRoom")}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDeleteId(room.id);
                }}
                className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          );
        })}
      </div>

      <ConfirmDeleteModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title={t("deleteRoomConfirmTitle")}
        message={t("deleteRoomConfirmMessage")}
        isDeleting={isDeleting}
        variant={
          isAdmin && rooms.find((r) => r.id === confirmDeleteId)?.isGroup
            ? "danger"
            : "warning"
        }
      />
    </>
  );
}
