/**
 * SellerAuctionsView
 *
 * Feature view for the seller's auction listings.
 * Calls /api/seller/products with filters=isAuction==true so results are
 * automatically scoped to the authenticated seller.
 */

"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Spinner,
  Input,
  DataTable,
  AdminFilterBar,
  TablePagination,
} from "@/components";
import { Gavel } from "lucide-react";
import { useAuth, useApiQuery, useUrlTable } from "@/hooks";
import { sellerService } from "@/services";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { SellerProductCard } from "./SellerProductCard";
import type { AdminProduct } from "@/components";

const { spacing, flex } = THEME_CONSTANTS;

interface AuctionsResponse {
  products: AdminProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function SellerAuctionsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("sellerAuctions");

  const table = useUrlTable({
    defaults: { pageSize: "24", sorts: "-createdAt" },
  });

  useEffect(() => {
    if (!authLoading && !user) router.push(ROUTES.AUTH.LOGIN);
  }, [user, authLoading, router]);

  const q = table.get("q");
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 24);
  const sorts = table.get("sorts") || "-createdAt";

  const filtersArr = ["isAuction==true"];
  if (q) filtersArr.push(`title_=${q}`);
  const params = new URLSearchParams({
    filters: filtersArr.join(","),
    sorts,
    page: String(page),
    pageSize: String(pageSize),
  }).toString();

  const { data, isLoading } = useApiQuery<AuctionsResponse>({
    queryKey: ["seller-auctions", params],
    queryFn: () => sellerService.listMyProducts(params),
    enabled: !authLoading && !!user,
  });

  const items = data?.products ?? [];
  const total = data?.meta?.total ?? 0;

  const columns = [
    { key: "title" as const, header: t("colTitle"), sortable: true },
    { key: "status" as const, header: t("colStatus") },
    { key: "auctionEndDate" as const, header: t("colEnds") },
    { key: "price" as const, header: t("colStartingBid"), sortable: true },
  ];

  return (
    <div className={spacing.stack}>
      <AdminFilterBar withCard={false}>
        <Input
          type="search"
          value={q}
          onChange={(e) => table.set("q", e.target.value)}
          placeholder={t("searchPlaceholder")}
        />
      </AdminFilterBar>

      <DataTable
        columns={columns}
        data={items}
        keyExtractor={(item) => item.id}
        loading={isLoading || authLoading}
        emptyIcon={<Gavel className="w-16 h-16" />}
        emptyTitle={t("noAuctions")}
        showViewToggle
        viewMode={(table.get("view") || "grid") as "table" | "grid" | "list"}
        onViewModeChange={(m) => table.set("view", m)}
        mobileCardRender={(item) => (
          <SellerProductCard
            product={item as any}
            onEdit={(p) =>
              router.push(`${ROUTES.SELLER.PRODUCTS}/${p.id}/edit`)
            }
            onDelete={() => {}}
          />
        )}
      />

      {total > 0 && (
        <TablePagination
          total={total}
          currentPage={page}
          totalPages={Math.ceil(total / pageSize)}
          pageSize={pageSize}
          onPageChange={(p) => table.setPage(p)}
          onPageSizeChange={(n) => table.set("pageSize", String(n))}
        />
      )}
    </div>
  );
}

export function SellerAuctionsView() {
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} py-20`}>
          <Spinner size="lg" />
        </div>
      }
    >
      <SellerAuctionsContent />
    </Suspense>
  );
}
