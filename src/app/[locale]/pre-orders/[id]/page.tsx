import { PreOrderDetailPageView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page({ params }: { params: { id: string } }) {
  return <PreOrderDetailPageView id={params.id} />;
}
