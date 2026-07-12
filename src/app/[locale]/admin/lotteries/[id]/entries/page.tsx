import { notFound } from "next/navigation";
import { getLotteryEventCached, getLotteryEntriesForAdmin } from "@mohasinac/appkit/server";
import { LotteryEntriesView } from "@mohasinac/appkit/client";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminLotteryEntriesPage({ params }: Props) {
  const { id } = await params;
  const [event, entriesResult] = await Promise.all([
    getLotteryEventCached(id),
    getLotteryEntriesForAdmin("event", id, { page: 1, pageSize: 20 }),
  ]);

  if (!event) notFound();

  const entries = (entriesResult.items ?? []).map((e) => ({
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

  return (
    <LotteryEntriesView
      sourceType="event"
      sourceId={id}
      entries={entries}
      isAdmin
    />
  );
}
