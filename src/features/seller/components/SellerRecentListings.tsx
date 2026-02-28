"use client";

import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { Heading, Text } from "@/components/typography";
import { UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";
import type { ProductDocument } from "@/db/schema";

const { themed, spacing } = THEME_CONSTANTS;

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

  if (loading || products.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <Heading level={4} variant="primary">
          {UI_LABELS.SELLER_PAGE.RECENT_LISTINGS}
        </Heading>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.SELLER.PRODUCTS)}
        >
          {UI_LABELS.ACTIONS.VIEW_ALL}
        </Button>
      </div>
      <div className={spacing.stack}>
        {products.slice(0, 5).map((product) => (
          <div
            key={product.id}
            className={`flex items-center justify-between py-2 border-b last:border-0 ${themed.borderColor}`}
          >
            <Text className={themed.textPrimary}>{product.title}</Text>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                product.status === "published"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : product.status === "draft"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {product.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
