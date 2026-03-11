/**
 * Order Tracking Page
 *
 * Route: /user/orders/[id]/track
 * Thin shell — auth-gated by UserLayout, logic lives in UserOrderTrackView.
 */
import { UserOrderTrackView } from "@/features/user";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackPage({ params }: PageProps) {
  const { id } = await params;
  return <UserOrderTrackView orderId={id} />;
}
