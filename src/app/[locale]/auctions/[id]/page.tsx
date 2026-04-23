import { AuctionDetailPageView } from "@mohasinac/appkit";

export const revalidate = 30;

export default function Page({ params }: { params: { id: string } }) {
  return <AuctionDetailPageView id={params.id} />;
}
