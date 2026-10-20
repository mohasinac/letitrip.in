import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

/**
 * Legacy order-detail path — permanently moved to `/user/orders/[id]`.
 *
 * 🛑 This file exists ONLY so old links keep working. The same order used to
 * present two unrelated-looking URL shapes: the detail page lived at
 * `/user/orders/view/{id}` while every action on it — cancel, invoice,
 * payment, return, track — lived at `/user/orders/{id}/…`. A buyer who
 * shortened the URL by removing a trailing segment landed on a 404, and the
 * two shapes made the route set read as two different features.
 *
 * Kept rather than deleted because the old path is in the wild: order
 * confirmation and shipping emails carry it, and so does anything a buyer
 * bookmarked. Deleting it would turn every one of those into a 404 — the
 * cost of the redirect is one file.
 *
 * 🛑 Next resolves a STATIC segment before a dynamic one, so `view` here wins
 * over `[id]` and this route is reachable; `/user/orders/{realId}` is not
 * swallowed by it.
 */
export default async function LegacyOrderDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(String(ROUTES.USER.ORDER_DETAIL(id)));
}
