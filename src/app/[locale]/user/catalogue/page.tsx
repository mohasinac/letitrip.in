import { UserCatalogueView, isAdminUser, isSellerUser } from "@mohasinac/appkit";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export default async function Page() {
  const user = await getServerSessionUser();
  return <UserCatalogueView canListDirectly={isSellerUser(user) || isAdminUser(user)} />;
}
