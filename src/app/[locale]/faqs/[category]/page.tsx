import { FAQPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return <FAQPageView category={category} />;
}
