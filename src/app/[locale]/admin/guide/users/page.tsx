import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminUsersGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Users & Accounts Guide — Admin | LetItRip",
  description: "Admin guide: user roles, search, editor, sessions management, employee accounts, and PII handling on LetItRip.",
  path: "/admin/guide/users",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminUsersGuideView />;
}
