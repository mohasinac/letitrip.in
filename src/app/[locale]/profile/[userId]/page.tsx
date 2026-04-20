import { PublicProfileView } from "@mohasinac/appkit";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <PublicProfileView userId={userId} />;
}