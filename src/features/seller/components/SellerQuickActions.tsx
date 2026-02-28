"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, Button } from "@/components/ui";
import { Heading } from "@/components/typography";
import { ROUTES } from "@/constants";

export function SellerQuickActions() {
  const router = useRouter();
  const t = useTranslations("sellerDashboard");

  const ACTIONS = [
    {
      label: t("addProduct"),
      href: ROUTES.SELLER.PRODUCTS_NEW,
      icon: "➕",
      variant: "primary" as const,
    },
    {
      label: t("viewProducts"),
      href: ROUTES.SELLER.PRODUCTS,
      icon: "📋",
      variant: "outline" as const,
    },
    {
      label: t("viewAuctions"),
      href: ROUTES.SELLER.AUCTIONS,
      icon: "🔨",
      variant: "outline" as const,
    },
    {
      label: t("viewSales"),
      href: ROUTES.SELLER.ORDERS,
      icon: "💰",
      variant: "outline" as const,
    },
  ];

  return (
    <Card className="p-5">
      <Heading level={4} variant="primary" className="mb-4">
        {t("quickActions")}
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
