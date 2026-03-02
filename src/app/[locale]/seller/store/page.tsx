import { SellerStoreView } from "@/features/seller";
import { AdminPageHeader } from "@/components";

export const metadata = {
  title: "Store Settings - Seller Dashboard",
  description: "Manage your store profile, policies, and visibility",
  robots: { index: false, follow: false },
};

export default function SellerStorePage() {
  return (
    <>
      <AdminPageHeader
        title="Store Settings"
        subtitle="Manage your public store profile, policies, and visibility"
      />
      <SellerStoreView />
    </>
  );
}
