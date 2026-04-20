import { PublicProfileView } from "@mohasinac/appkit/features/about";

export default async function Page({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <PublicProfileView userId={userId} />;
}