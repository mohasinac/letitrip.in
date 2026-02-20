"use client";

import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { Heading } from "@/components/typography";
import { UI_LABELS, ROUTES } from "@/constants";

export function SellerQuickActions() {
  const router = useRouter();

  const ACTIONS = [
    {
      label: UI_LABELS.SELLER_PAGE.ADD_PRODUCT,
      href: ROUTES.SELLER.PRODUCTS_NEW,
      icon: "➕",
      variant: "primary" as const,
    },
    {
      label: UI_LABELS.SELLER_PAGE.VIEW_PRODUCTS,
      href: ROUTES.SELLER.PRODUCTS,
      icon: "📋",
      variant: "outline" as const,
    },
    {
      label: UI_LABELS.SELLER_PAGE.VIEW_AUCTIONS,
      href: ROUTES.SELLER.AUCTIONS,
      icon: "🔨",
      variant: "outline" as const,
    },
    {
      label: UI_LABELS.SELLER_PAGE.VIEW_SALES,
      href: ROUTES.SELLER.ORDERS,
      icon: "💰",
      variant: "outline" as const,
    },
  ];

  return (
    <Card className="p-5">
      <Heading level={4} variant="primary" className="mb-4">
        {UI_LABELS.SELLER_PAGE.QUICK_ACTIONS}
      </Heading>
      <div className="flex flex-wrap gap-3">
        {ACTIONS.map(({ label, href, icon, variant }) => (
          <Button
            key={href}
            variant={variant}
            onClick={() => router.push(href)}
            className="flex items-center gap-2"
          >
            <span>{icon}</span>
            {label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
