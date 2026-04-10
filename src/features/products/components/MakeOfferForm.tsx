"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import { useMessage } from "@/hooks";
import { makeOfferAction } from "@/actions";
import { Label, Span, Text } from "@mohasinac/appkit/ui";
import { Button, Card, FormGroup, Input, Textarea } from "@/components";
import type { ProductItem } from "@mohasinac/appkit/features/products";

const { themed } = THEME_CONSTANTS;

interface MakeOfferFormProps {
  product: Pick<
    ProductItem,
    "id" | "price" | "currency" | "title" | "minOfferPercent"
  >;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const buildSchema = (minAmount: number) =>
  z.object({
    offerAmount: z
      .number({ message: "Enter a valid amount" })
      .int("Amount must be a whole number")
      .min(minAmount, `Minimum offer is ₹${minAmount}`),
    buyerNote: z.string().max(300).optional(),
  });

type FormValues = { offerAmount: number; buyerNote?: string };

export function MakeOfferForm({
  product,
  onSuccess,
  onCancel,
}: MakeOfferFormProps) {
  const t = useTranslations("offers");
  const tActions = useTranslations("actions");
  const { showError } = useMessage();
  const [submitted, setSubmitted] = useState(false);

  const minOfferPercent = product.minOfferPercent ?? 70;
  const minAmount = Math.ceil(product.price * (minOfferPercent / 100));

  const schema = buildSchema(minAmount);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { offerAmount: minAmount, buyerNote: "" },
  });

  const { mutateAsync: makeOffer, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      makeOfferAction({
        productId: product.id,
        offerAmount: values.offerAmount,
        buyerNote: values.buyerNote || undefined,
      }),
    onSuccess: () => {
      setSubmitted(true);
      onSuccess?.();
    },
    onError: (err: unknown) => {
      showError((err as Error).message ?? t("offerFailed"));
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await makeOffer(values);
  });

  if (submitted) {
    return (
      <Card className={`p-4 text-center ${themed.bgPrimary}`}>
        <Text className="font-semibold text-green-600 dark:text-green-400">
          {t("offerSentTitle")}
        </Text>
        <Text className="mt-1 text-sm">{t("offerSentDesc")}</Text>
      </Card>
    );
  }

  return (
    <Card className="p-6 w-full max-w-sm">
      <form onSubmit={handleSubmit} className={THEME_CONSTANTS.spacing.stack}>
        <div>
          <Text className="text-sm">
            {t("listedPrice", {
              price: formatCurrency(product.price, product.currency ?? "INR"),
            })}
          </Text>
          <Text className="text-xs text-neutral-500">
            {t("minOfferHint", { min: minOfferPercent })}
          </Text>
        </div>

        <FormGroup columns={2}>
          {/* Offer amount */}
          <div>
            <Label
              htmlFor="offerAmount"
              className="block text-sm font-medium mb-1.5"
            >
              {t("offerAmountLabel")}
            </Label>
            <div className="relative">
              <Span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-500">
                ₹
              </Span>
              <Input
                id="offerAmount"
                type="number"
                min={minAmount}
                max={product.price - 1}
                step={1}
                className="pl-7"
                {...form.register("offerAmount", { valueAsNumber: true })}
              />
            </div>
            {form.formState.errors.offerAmount && (
              <Text className="mt-1 text-xs text-red-500 dark:text-red-400">
                {form.formState.errors.offerAmount.message}
              </Text>
            )}
          </div>

          {/* Buyer note */}
          <div>
            <Label
              htmlFor="buyerNote"
              className="block text-sm font-medium mb-1.5"
            >
              {t("buyerNoteLabel")}
            </Label>
            <Textarea
              id="buyerNote"
              rows={2}
              placeholder={t("buyerNotePlaceholder")}
              {...form.register("buyerNote")}
            />
          </div>
        </FormGroup>
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isPending}
            isLoading={isPending}
            className="flex-1"
          >
            {t("sendOffer")}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {tActions("cancel")}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
