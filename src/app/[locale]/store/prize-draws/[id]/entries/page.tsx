import { Suspense } from "react";
import { LotteryEntriesView, PrizeDrawWinnerMappingView, sortBy } from "@mohasinac/appkit";
import { getLotteryEntriesForAdmin } from "@mohasinac/appkit/server";
import { getSellerProductAction } from "@/actions/seller.actions";
import { notFound } from "@/i18n/navigation";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  // getSellerProductAction returns null when the requesting seller doesn't
  // own this product (or it doesn't exist) — the ownership check no other
  // part of this route previously had.
  const result = await getSellerProductAction(id);
  const product = result.ok ? result.data : null;
  if (!product || product.listingType !== "prize-draw") notFound();

  if (product.prizeDrawMode === "lottery") {
    const entriesResult = await getLotteryEntriesForAdmin("product", id, { sorts: sortBy("submittedAt"), page: 1, pageSize: 50 });
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

  const items = ((product as { prizeDrawItems?: Array<{ itemNumber: number; title: string; images?: string[]; isWon: boolean; wonByOrderId?: string }> }).prizeDrawItems ?? []).map((it) => ({
    itemNumber: it.itemNumber,
    title: it.title,
    image: it.images?.[0],
    isWon: it.isWon,
    wonByOrderId: it.wonByOrderId,
  }));

  return (
    <Suspense>
      <PrizeDrawWinnerMappingView title={`${product.title} — Winner Mapping`} items={items} isAdmin={false} />
    </Suspense>
  );
}
