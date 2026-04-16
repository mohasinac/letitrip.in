"use client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  useUserOffers, useAcceptCounter, useWithdrawOffer, } from "../hooks/useUserOffers";
import { useMessage } from "@/hooks";
import { checkoutOfferAction } from "@/actions";
import { UserOffersView as AppkitUserOffersView } from "@mohasinac/appkit/features/account";
import { EmptyState } from "@/components";
import {
  Caption, Text, StatusBadge, Spinner, Button, DataTable, } from "@mohasinac/appkit/ui";
import type { DataTableColumn } from "@mohasinac/appkit/ui";
import { formatCurrency, formatDate } from "@mohasinac/appkit/utils";


import { ROUTES } from "@/constants";
import type { OfferDocument } from "@/db/schema";

const STATUS_VARIANT: Record<
  string,
  "pending" | "active" | "success" | "danger" | "info"
> = {
  pending: "pending",
  countered: "active",
  accepted: "success",
  paid: "success",
  declined: "danger",
  expired: "danger",
  withdrawn: "info",
};

export function UserOffersView() {
  const t = useTranslations("offers");
  const tActions = useTranslations("actions");
  const router = useRouter();
  const { offers, isLoading, refetch } = useUserOffers();
  const { showSuccess, showError } = useMessage();

  const { mutateAsync: acceptCounter, isPending: accepting } = useAcceptCounter(
    () => {
      showSuccess(t("counterAccepted"));
      refetch();
    },
    (err: { message?: string }) => showError(err.message ?? t("actionFailed")),
  );

  const { mutateAsync: withdraw, isPending: withdrawing } = useWithdrawOffer(
    () => {
      showSuccess(t("offerWithdrawn"));
      refetch();
    },
    (err: { message?: string }) => showError(err.message ?? t("actionFailed")),
  );

  const checkoutMutation = useMutation({
    mutationFn: (offerId: string) => checkoutOfferAction(offerId),
  });

  const columns: DataTableColumn<OfferDocument>[] = [
    { key: "productTitle", header: t("product") },
    {
      key: "offerAmount",
      header: t("offered"),
      render: (o: OfferDocument) => (
        <Text size="sm">{formatCurrency(o.offerAmount)}</Text>
      ),
    },
    {
      key: "counterAmount",
      header: t("counter"),
      render: (o: OfferDocument) =>
        o.counterAmount ? (
          <Text size="sm">{formatCurrency(o.counterAmount)}</Text>
        ) : (
          <Caption>�</Caption>
        ),
    },
    {
      key: "status",
      header: t("status"),
      render: (o: OfferDocument) => (
        <StatusBadge status={STATUS_VARIANT[o.status] ?? "pending"} />
      ),
    },
    {
      key: "createdAt",
      header: t("date"),
      render: (o: OfferDocument) => (
        <Caption>{formatDate(o.createdAt)}</Caption>
      ),
    },
    {
      key: "id",
      header: tActions("actions"),
      render: (o: OfferDocument) => (
        <div className="flex gap-2">
          {o.status === "countered" && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => acceptCounter({ offerId: o.id })}
              isLoading={accepting}
            >
              {t("acceptCounter")}
            </Button>
          )}
          {o.status === "accepted" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => checkoutMutation.mutate(o.id)}
              isLoading={checkoutMutation.isPending}
            >
              {tActions("checkout")}
            </Button>
          )}
          {(o.status === "pending" || o.status === "countered") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => withdraw({ offerId: o.id })}
              isLoading={withdrawing}
            >
              {t("withdraw")}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AppkitUserOffersView
      isEmpty={!isLoading && !offers?.length}
      renderTable={() =>
        isLoading ? (
          <Spinner />
        ) : (
          <DataTable<OfferDocument>
            columns={columns}
            data={offers ?? []}
            loading={isLoading}
            mobileCardRender={(o: OfferDocument) => (
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-slate-700">
                <Text size="sm" weight="medium">
                  {o.productTitle}
                </Text>
                <div className="flex justify-between mt-1">
                  <Caption>{formatCurrency(o.offerAmount)}</Caption>
                  <StatusBadge status={STATUS_VARIANT[o.status] ?? "pending"} />
                </div>
              </div>
            )}
          />
        )
      }
      renderEmpty={() => (
        <EmptyState
          title={t("noOffers")}
          description={t("noOffersDesc")}
          actionLabel={tActions("shopNow")}
          onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
        />
      )}
    />
  );
}

