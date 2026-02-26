/**
 * Admin Blog Page
 *
 * Route: /admin/blog/[[...action]]
 * Thin wrapper — all logic lives in AdminBlogView.
 */

import { AdminBlogView } from "@/features/admin";

export default function AdminBlogPage() {
  return <AdminBlogView />;
}
