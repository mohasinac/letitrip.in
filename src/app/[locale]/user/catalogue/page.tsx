import { isAdminUser, isSellerUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { UserCatalogueView } from "@mohasinac/appkit/features/catalogue/components/UserCatalogueView";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export default async function Page() {
  const user = await getServerSessionUser();
  return <UserCatalogueView canListDirectly={isSellerUser(user) || isAdminUser(user)} />;
}
