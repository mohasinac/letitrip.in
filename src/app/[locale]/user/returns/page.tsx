"use client";
import { UserReturnsView, ROUTES } from "@mohasinac/appkit/client";
import { useRouter } from "@/i18n/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <UserReturnsView
      onOrderClick={(order) => router.push(String(ROUTES.USER.ORDER_DETAIL(order.id)))}
    />
  );
}
