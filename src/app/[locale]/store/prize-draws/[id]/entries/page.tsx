import { Suspense } from "react";
import { LotteryEntriesView, sortBy } from "@mohasinac/appkit";
import { getLotteryEntriesForAdmin } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  const result = await getLotteryEntriesForAdmin("product", id, { sorts: sortBy("submittedAt"), page: 1, pageSize: 50 });
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

  return (
    <Suspense>
      <LotteryEntriesView
        sourceType="product"
        sourceId={id}
        entries={entries}
        isAdmin={false}
        isStoreOwner={true}
      />
    </Suspense>
  );
}
