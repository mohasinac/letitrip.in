import { PublicProfileView } from "@mohasinac/appkit";

export const revalidate = 120;

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string; tab: string }>;
}) {
  const { userId } = await params;
  return <PublicProfileView userId={userId} />;
}
