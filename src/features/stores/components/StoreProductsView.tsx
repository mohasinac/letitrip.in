"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useUrlTable } from "@/hooks";
import {
  EmptyState,
  Spinner,
  TablePagination,
  ProductGrid,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useStoreProducts } from "../hooks";

const { spacing, flex } = THEME_CONSTANTS;

interface StoreProductsViewProps {
  storeSlug: string;
}

export function StoreProductsView({ storeSlug }: StoreProductsViewProps) {
  const t = useTranslations("storePage");
  const table = useUrlTable({
    defaults: { pageSize: "24", sorts: "-createdAt" },
  });

  const params = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("page", table.get("page") || "1");
    sp.set("pageSize", table.get("pageSize") || "24");
    sp.set("sorts", table.get("sorts") || "-createdAt");
    return sp.toString();
  }, [table]);

  const { data, isLoading, error } = useStoreProducts(storeSlug, params);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", 24);

  return (
    <div className={spacing.stack}>
      {isLoading && (
        <div className={`${flex.hCenter} ${THEME_CONSTANTS.page.empty}`}>
          <Spinner />
        </div>
      )}
      {!!error && !isLoading && (
        <EmptyState
          title={t("error.title")}
          description={t("error.description")}
        />
      )}
      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          title={t("products.empty.title")}
          description={t("products.empty.description")}
        />
      )}
      {!isLoading && !error && items.length > 0 && (
        <>
          <ProductGrid products={items} />
          <TablePagination
            total={total}
            currentPage={page}
            totalPages={Math.ceil(total / pageSize) || 1}
            pageSize={pageSize}
            onPageChange={(p) => table.setPage(p)}
            onPageSizeChange={(n) => table.set("pageSize", String(n))}
          />
        </>
      )}
    </div>
  );
}
