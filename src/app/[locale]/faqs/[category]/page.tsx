import { FAQPageView } from "@mohasinac/appkit";

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <FAQPageView category={category} />;
}