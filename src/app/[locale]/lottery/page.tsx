import { Suspense } from "react";
import type { Metadata } from "next";
import { LotteryListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";
import { listLotteryEvents } from "@mohasinac/appkit/server";

export const metadata: Metadata = _gm({
  title: "Lotteries — LetItRip",
  description:
    "Enter numbered-slot lotteries on LetItRip. Submit your entry, get a randomly assigned prize slot instantly.",
  path: "/lottery",
  keywords: ["lottery india", "collectibles lottery", "prize draw india"],
});

export const revalidate = 120;

export default async function Page() {
  const items = await listLotteryEvents({ status: "active", pageSize: 50 });
  return (
    <Suspense>
      <LotteryListView items={items} adminMode={false} />
    </Suspense>
  );
}
