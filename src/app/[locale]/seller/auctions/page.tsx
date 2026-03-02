import { SellerAuctionsView } from "@/features/seller";
import { AdminPageHeader } from "@/components";

export const metadata = {
  title: "My Auctions - Seller Dashboard",
  description: "Manage your auction listings",
  robots: { index: false, follow: false },
};

export default function SellerAuctionsPage() {
  return (
    <>
      <AdminPageHeader
        title="My Auctions"
        subtitle="View and manage your active and closed auction listings"
      />
      <SellerAuctionsView />
    </>
  );
}
