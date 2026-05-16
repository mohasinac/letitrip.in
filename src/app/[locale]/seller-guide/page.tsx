import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { SellerGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Seller Guide — LetItRip",
  description: "Everything you need to know to start selling collectibles on LetItRip. List products, manage orders, run auctions and grow your store.",
  path: "/seller-guide",
  keywords: ["sell collectibles india", "become a seller letitrip", "marketplace seller guide"],
});

export const revalidate = 3600;

export default function Page() {
  return <SellerGuideView />;
}
