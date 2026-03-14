"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSellerOffers, useRespondToOffer } from "../hooks/useSellerOffers";
import { useMessage } from "@/hooks";
import {
  Button,
  Caption,
  Card,
  DataTable,
  EmptyState,
  Heading,
  Input,
  Label,
  Spinner,
  StatusBadge,
  Text,
  Textarea,
} from "@/components";
import type { DataTableColumn } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import type { OfferDocument } from "@/db/schema";

const { flex, position } = THEME_CONSTANTS;

const STATUS_VARIANT: Record<
  string,
  "pending" | "active" | "success" | "danger" | "info"
> = {
  pending: "pending",
  countered: "active",
  accepted: "success",
  declined: "danger",
  expired: "danger",
  withdrawn: "info",
};

const counterSchema = z.object({
  counterAmount: z.number({ message: "Enter an amount" }).int().positive(),
  sellerNote: z.string().max(300).optional(),
});

type CounterForm = z.infer<typeof counterSchema>;

export function SellerOffersView() {
  const t = useTranslations("offers");
  const tActions = useTranslations("actions");
  const { offers, isLoading, refetch } = useSellerOffers();
  const { showSuccess, showError } = useMessage();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [respondingTo, setRespondingTo] = useState<OfferDocument | null>(null);
  const [counterModalOpen, setCounterModalOpen] = useState(false);

  const { mutateAsync: respond, isPending: responding } = useRespondToOffer(
    () => {
      showSuccess(t("responseRecorded"));
      refetch();
      setRespondingTo(null);
      setCounterModalOpen(false);
    },
    (err: { message?: string }) => showError(err.message ?? t("actionFailed")),
  );

  const counterForm = useForm<CounterForm>({
    resolver: zodResolver(counterSchema),
  });

  const handleAccept = async (offer: OfferDocument) => {
    await respond({ offerId: offer.id, action: "accept" });
  };

  const handleDecline = async (offer: OfferDocument) => {
    await respond({ offerId: offer.id, action: "decline" });
  };

  const handleCounterSubmit = counterForm.handleSubmit(async (values) => {
    if (!respondingTo) return;
    await respond({
      offerId: respondingTo.id,
      action: "counter",
      counterAmount: values.counterAmount,
      sellerNote: values.sellerNote,
    });
  });

  const columns: DataTableColumn<OfferDocument>[] = [
    {
      key: "buyerName",
      header: t("colBuyer"),
      render: (o) => <Text className="font-medium">{o.buyerName}</Text>,
    },
    {
      key: "productTitle",
      header: t("colProduct"),
      render: (o) => <Text>{o.productTitle}</Text>,
    },
    {
      key: "offerAmount",
      header: t("colOffer"),
      render: (o) => (
        <Text className="font-semibold">
          {formatCurrency(o.offerAmount, o.currency)}
        </Text>
      ),
    },
    {
      key: "listedPrice",
      header: t("colListed"),
      render: (o) => (
        <Caption>{formatCurrency(o.listedPrice, o.currency)}</Caption>
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
        if (o.status !== "pending") return null;
        return (
          <div className={`${flex.rowCenter} gap-2`}>
            <Button
              size="sm"
              disabled={responding}
              onClick={() => handleAccept(o)}
            >
              {tActions("accept")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={responding}
              onClick={() => {
                setRespondingTo(o);
                counterForm.reset({
                  counterAmount: Math.ceil(o.offerAmount * 1.05),
                });
                setCounterModalOpen(true);
              }}
            >
              {t("counter")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={responding}
              onClick={() => handleDecline(o)}
            >
              {tActions("decline")}
            </Button>
          </div>
        );
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
    <>
      <div className="space-y-6">
        <Heading level={2}>{t("sellerPageTitle")}</Heading>

        {offers.length === 0 ? (
          <EmptyState
            title={t("sellerEmptyTitle")}
            description={t("sellerEmptyDesc")}
          />
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

      {/* Counter-offer inline modal */}
      {counterModalOpen && (
        <div
          className={`${position.fixedFill} z-50 ${flex.center} p-4 bg-black/50 backdrop-blur-sm`}
          onClick={() => setCounterModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
            <Card className={`p-6 ${THEME_CONSTANTS.spacing.stack}`}>
              <Heading level={3}>{t("counterModalTitle")}</Heading>

              <form
                onSubmit={handleCounterSubmit}
                className={THEME_CONSTANTS.spacing.stack}
              >
                {respondingTo && (
                  <Text className="text-sm">
                    {t("buyerOffered")}:{" "}
                    <span className="font-semibold">
                      {formatCurrency(
                        respondingTo.offerAmount,
                        respondingTo.currency,
                      )}
                    </span>
                  </Text>
                )}

                <div className="space-y-1">
                  <Label htmlFor="counterAmount">
                    {t("counterAmountLabel")}
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
                      ₹
                    </span>
                    <Input
                      id="counterAmount"
                      type="number"
                      min={1}
                      step={1}
                      className="pl-7"
                      {...counterForm.register("counterAmount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  {counterForm.formState.errors.counterAmount && (
                    <Text className="text-sm text-red-600">
                      {counterForm.formState.errors.counterAmount.message}
                    </Text>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sellerNote">{t("sellerNoteLabel")}</Label>
                  <Textarea
                    id="sellerNote"
                    rows={2}
                    placeholder={t("sellerNotePlaceholder")}
                    {...counterForm.register("sellerNote")}
                  />
                </div>

                <div className={`${flex.rowCenter} gap-2 justify-end`}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCounterModalOpen(false)}
                  >
                    {tActions("cancel")}
                  </Button>
                  <Button type="submit" disabled={responding}>
                    {responding ? tActions("submitting") : t("sendCounter")}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
