import { listLotteryEvents } from "@mohasinac/appkit/server";
import { LotteryListView } from "@mohasinac/appkit/client";

export const dynamic = "force-dynamic";

export default async function AdminLotteriesPage() {
  const events = await listLotteryEvents({}).catch(() => []);

  return (
    <LotteryListView
      items={events as Parameters<typeof LotteryListView>[0]["items"]}
      adminMode
    />
  );
}
