import { UserCatalogueView, isSellerUser } from "@mohasinac/appkit";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export default async function Page() {
  const user = await getServerSessionUser();
  return <UserCatalogueView isSeller={isSellerUser(user)} />;
}
