import { FAQPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page({ params }: { params: { category: string } }) {
  return <FAQPageView category={params.category} />;
}
