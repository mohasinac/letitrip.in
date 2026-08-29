import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

const AdminCouponsSection = makeAdminSectionLayout("admin:coupons:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  return <AdminCouponsSection>{children}</AdminCouponsSection>;
}
