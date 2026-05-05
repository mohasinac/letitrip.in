import { AuctionsListView } from "@mohasinac/appkit";

export const revalidate = 60;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return <AuctionsListView searchParams={resolvedSearchParams} />;
}
