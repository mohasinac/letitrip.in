import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LotteryEntriesView, sortBy } from "@mohasinac/appkit";
import {
  getLotteryEventCached,
  getLotteryEntriesForAdmin,
  flagLotteryEntryAction,
  reopenLotterySlotAction,
} from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const [event, user] = await Promise.all([
    getLotteryEventCached(id),
    getServerSessionUser(),
  ]);
  if (!event) notFound();

  const result = await getLotteryEntriesForAdmin("event", id, { sorts: sortBy("submittedAt"), page: 1, pageSize: 50 });
  const entries = (result.items ?? []).map((e) => ({
    id: e.id,
    userLotteryNumber: e.userLotteryNumber,
    userDisplayName: e.userDisplayName,
    userId: e.userId,
    transactionId: e.transactionId,
    userPhone: e.userPhone,
    assignedPrizeSlotNumber: e.assignedPrizeSlotNumber,
    status: e.status,
    isFlagged: e.isFlagged,
    submittedAt: e.submittedAt,
  }));

  async function handleFlag(entryId: string, flagNote: string): Promise<void> {
    "use server";
    await flagLotteryEntryAction({ entryId, flagNote, flaggedByUserId: user?.uid ?? "unknown" });
  }

  async function handleReopen(slotNumber: number): Promise<void> {
    "use server";
    await reopenLotterySlotAction({ sourceType: "event", sourceId: id, slotNumber });
  }

  return (
    <Suspense>
      <LotteryEntriesView
        sourceType="event"
        sourceId={id}
        entries={entries}
        isAdmin={true}
        isStoreOwner={false}
        onFlagEntry={handleFlag}
        onReopenSlot={handleReopen}
      />
    </Suspense>
  );
}
