import { notFound } from "next/navigation";
import { getLotteryEntriesForAdmin } from "@mohasinac/appkit/server";
import { productRepository } from "@mohasinac/appkit";
import { LotteryEntriesView } from "@mohasinac/appkit/client";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function StorePrizeDrawEntriesPage({ params }: Props) {
  const { id } = await params;
  const [user, product, entriesResult] = await Promise.all([
    getServerSessionUser().catch(() => null),
    productRepository.findById(id).catch(() => null),
    getLotteryEntriesForAdmin("product", id, { page: 1, pageSize: 20 }),
  ]);

  if (!product || product.prizeDrawMode !== "lottery") notFound();

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
      sourceType="product"
      sourceId={id}
      entries={entries}
      isAdmin={false}
      isStoreOwner
    />
  );
}
