import { MarketplaceHomepageView } from "@mohasinac/appkit/features/homepage";

export const revalidate = 120;

export default async function Page() {
  return <MarketplaceHomepageView />;
}