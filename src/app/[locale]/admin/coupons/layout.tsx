import { makeAdminSectionLayout } from "@mohasinac/appkit/server";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { requireFeatureFlag } from "@/lib/features";

const AdminCouponsSection = makeAdminSectionLayout("admin:coupons:read", { getUser: getServerSessionUser });

export default async function Layout({ children }: { children: React.ReactNode }) {
  requireFeatureFlag("COUPONS");
  return <AdminCouponsSection>{children}</AdminCouponsSection>;
}
