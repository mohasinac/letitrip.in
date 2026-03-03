"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useUrlTable } from "@/hooks";
import { EmptyState, Spinner, TablePagination, Card, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useStoreAuctions } from "../hooks";

const { spacing, flex } = THEME_CONSTANTS;

interface StoreAuctionsViewProps {
  storeSlug: string;
}

export function StoreAuctionsView({ storeSlug }: StoreAuctionsViewProps) {
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

  const { data, isLoading, error } = useStoreAuctions(storeSlug, params);

  const items = (data as { items?: unknown[] } | undefined)?.items ?? [];
  const total = (data as { total?: number } | undefined)?.total ?? 0;
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
          title={t("auctions.empty.title")}
          description={t("auctions.empty.description")}
        />
      )}
      {!isLoading && !error && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {(items as Record<string, unknown>[]).map((item) => (
              <Card key={item.id as string} className="p-4">
                <Text weight="medium" className="truncate">
                  {item.title as string}
                </Text>
              </Card>
            ))}
          </div>
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
