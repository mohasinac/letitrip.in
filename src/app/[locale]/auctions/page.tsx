import { AuctionsListView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) {
  return <AuctionsListView searchParams={searchParams} />;
}
