"use client";
import { UserOrdersView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <UserOrdersView
      onOrderClick={(order) => router.push(String(ROUTES.USER.ORDER_DETAIL(order.id)))}
    />
  );
}
