"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  useUserOffers,
  useAcceptCounter,
  useWithdrawOffer,
} from "../hooks/useUserOffers";
import { useMessage } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { checkoutOfferAction } from "@/actions";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import {
  Button,
  Caption,
  DataTable,
  EmptyState,
  Heading,
  Spinner,
  StatusBadge,
  Text,
} from "@/components";
import type { DataTableColumn } from "@/components";
import { formatCurrency, formatDate } from "@/utils";
import type { OfferDocument } from "@/db/schema";

const { flex } = THEME_CONSTANTS;

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

  const { mutateAsync: checkoutOffer, isPending: checkingOut } = useMutation({
    mutationFn: (offerId: string) => checkoutOfferAction(offerId),
    onSuccess: () => {
      showSuccess(t("addedToCart"));
      router.push(ROUTES.USER.CART);
    },
    onError: (err: Error) => showError(err.message ?? t("actionFailed")),
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const columns: DataTableColumn<OfferDocument>[] = [
    {
      key: "productTitle",
      header: t("colProduct"),
      render: (o) => <Text className="font-medium">{o.productTitle}</Text>,
    },
    {
      key: "offerAmount",
      header: t("colYourOffer"),
      render: (o) => (
        <Text>{formatCurrency(o.offerAmount, o.currency ?? "INR")}</Text>
      ),
    },
    {
      key: "counterAmount",
      header: t("colCounter"),
      render: (o) =>
        o.counterAmount ? (
          <Text className="font-semibold text-amber-600 dark:text-amber-400">
            {formatCurrency(o.counterAmount, o.currency ?? "INR")}
          </Text>
        ) : (
          <Caption>&#8212;</Caption>
        ),
    },
    {
      key: "lockedPrice",
      header: t("colLockedPrice"),
      render: (o) =>
        o.lockedPrice ? (
          <Text className="font-semibold text-green-700">
            {formatCurrency(o.lockedPrice, o.currency ?? "INR")}
          </Text>
        ) : (
          <Caption>&#8212;</Caption>
        ),
    },
    {
      key: "status",
      header: t("colStatus"),
      render: (o) => (
        <StatusBadge
          status={STATUS_VARIANT[o.status] ?? "info"}
          label={t(`status_${o.status}`)}
        />
      ),
    },
    {
      key: "createdAt",
      header: t("colDate"),
      render: (o) => <Caption>{formatDate(o.createdAt)}</Caption>,
    },
    {
      key: "actions",
      header: "",
      render: (o) => {
        const busy =
          pendingId === o.id && (accepting || withdrawing || checkingOut);

        if (o.status === "accepted") {
          return (
            <Button
              size="sm"
              disabled={busy}
              onClick={async () => {
                setPendingId(o.id);
                try {
                  await checkoutOffer(o.id);
                } finally {
                  setPendingId(null);
                }
              }}
            >
              {t("checkoutNow")}
            </Button>
          );
        }

        if (o.status === "countered") {
          return (
            <div className={`${flex.rowCenter} gap-2`}>
              <Button
                size="sm"
                disabled={busy}
                onClick={async () => {
                  setPendingId(o.id);
                  try {
                    await acceptCounter({ offerId: o.id });
                  } finally {
                    setPendingId(null);
                  }
                }}
              >
                {t("acceptCounter")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  setPendingId(o.id);
                  try {
                    await withdraw({ offerId: o.id });
                  } finally {
                    setPendingId(null);
                  }
                }}
              >
                {tActions("decline")}
              </Button>
            </div>
          );
        }

        if (o.status === "pending") {
          return (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                setPendingId(o.id);
                try {
                  await withdraw({ offerId: o.id });
                } finally {
                  setPendingId(null);
                }
              }}
            >
              {t("withdraw")}
            </Button>
          );
        }
        return null;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className={`${flex.center} p-10`}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Heading level={2}>{t("pageTitle")}</Heading>

      {offers.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDesc")} />
      ) : (
        <DataTable
          columns={columns as DataTableColumn<Record<string, any>>[]}
          data={offers}
          keyExtractor={(o) => o.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      )}
    </div>
  );
}
