import { BecomeSellerView } from "@/features/user";

export const metadata = {
  title: "Become a Seller - LetItRip",
  description:
    "Read the seller guide and apply to sell on LetItRip marketplace.",
  robots: { index: false, follow: false },
};

export default function BecomeSellerPage() {
  return <BecomeSellerView />;
}
