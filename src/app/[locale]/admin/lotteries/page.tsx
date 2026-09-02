import { Suspense } from "react";
import { LotteryListView } from "@mohasinac/appkit";
import { listLotteryEvents } from "@mohasinac/appkit/server";

export default async function Page() {
  const items = await listLotteryEvents({ pageSize: 100 });
  return (
    <Suspense>
      <LotteryListView items={items} adminMode={true} />
    </Suspense>
  );
}
