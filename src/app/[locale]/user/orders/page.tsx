/**
 * User Orders Page
 *
 * Route: /user/orders
 * Thin orchestration layer — all logic in UserOrdersView.
 */

import { UserOrdersView } from "@/features/user";

export default function UserOrdersPage() {
  return <UserOrdersView />;
}
