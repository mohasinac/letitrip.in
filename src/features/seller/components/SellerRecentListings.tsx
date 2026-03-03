"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Card, Button } from "@/components/ui";
import { Heading, Text } from "@/components/typography";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import type { ProductDocument } from "@/db/schema";
import { Span } from "@/components";

const { themed, spacing, flex } = THEME_CONSTANTS;

type RecentProduct = Pick<
  ProductDocument,
  "id" | "title" | "status" | "isAuction" | "price" | "mainImage"
>;

interface SellerRecentListingsProps {
  products: RecentProduct[];
  loading: boolean;
}

export function SellerRecentListings({
  products,
  loading,
}: SellerRecentListingsProps) {
  const router = useRouter();
  const t = useTranslations("sellerDashboard");

  if (loading || products.length === 0) return null;

  return (
    <Card className="p-5">
      <div className={`${flex.between} mb-4`}>
        <Heading level={4} variant="primary">
          {t("recentListings")}
        </Heading>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.SELLER.PRODUCTS)}
        >
          {t("viewAll")}
        </Button>
      </div>
      <div className={spacing.stack}>
        {products.slice(0, 5).map((product) => (
          <div
            key={product.id}
            className={`${flex.between} py-2 border-b last:border-0 ${themed.borderColor}`}
          >
            <Text className={themed.textPrimary}>{product.title}</Text>
            <Span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                product.status === "published"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : product.status === "draft"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {product.status}
            </Span>
          </div>
        ))}
      </div>
    </Card>
  );
}
