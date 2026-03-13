"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  Caption,
  Grid,
  Heading,
  Label,
  Text,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { adminAdjustRipCoinsAction } from "@/actions";
import type { AdminUser } from "./User.types";

const adjustSchema = z.object({
  coins: z
    .number()
    .int("Must be a whole number")
    .positive("Must be greater than zero"),
  type: z.enum(["admin_grant", "admin_deduct"]),
  notes: z.string().max(500).optional(),
});

type AdjustFormData = z.infer<typeof adjustSchema>;

interface RipCoinAdjustModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

const { position, flex, themed, patterns } = THEME_CONSTANTS;

type AdjustType = AdjustFormData["type"];

const ADJUST_TYPE_CONFIG: Record<
  AdjustType,
  {
    labelKey: "credit" | "debit";
    activeClass: string;
    variant: "primary" | "danger";
  }
> = {
  admin_grant: {
    labelKey: "credit",
    activeClass:
      "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
    variant: "primary",
  },
  admin_deduct: {
    labelKey: "debit",
    activeClass:
      "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    variant: "danger",
  },
};

const ADJUST_TYPES: AdjustType[] = ["admin_grant", "admin_deduct"];

export function RipCoinAdjustModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: RipCoinAdjustModalProps) {
  const t = useTranslations("adminRipCoins");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AdjustFormData>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { type: "admin_grant", notes: "" },
  });

  const adjustMutation = useMutation({
    mutationFn: (data: AdjustFormData) =>
      adminAdjustRipCoinsAction({
        targetUid: user!.uid,
        coins: data.coins,
        type: data.type,
        notes: data.notes || undefined,
      }),
    onSuccess: ({ newBalance }) => {
      reset();
      onSuccess(newBalance);
      onClose();
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const selectedType = watch("type");
  const { variant: submitVariant } = ADJUST_TYPE_CONFIG[selectedType];

  return (
    <div
      className={`${position.fixedFill} z-[60] ${flex.center} p-4 bg-black/50 backdrop-blur-sm`}
      onClick={onClose}
    >
      <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Card className="w-full max-w-md p-6 space-y-4">
          {/* Header */}
          <div>
            <Heading level={4}>{t("title")}</Heading>
            <Text variant="secondary" size="sm">
              {user.displayName || user.email}
            </Text>
          </div>

          {/* Current balance */}
          <div
            className={`rounded-lg border ${themed.border} p-3 ${flex.between}`}
          >
            <Caption>{t("currentBalance")}</Caption>
            <Text weight="semibold">
              {(user.ripcoinBalance ?? 0).toLocaleString()} {t("coins")}
            </Text>
          </div>

          <form
            onSubmit={handleSubmit((data) => adjustMutation.mutate(data))}
            className="space-y-4"
          >
            {/* Credit / Debit toggle */}
            <div>
              <Label className="block mb-2">{t("adjustType")}</Label>
              <Grid className="grid-cols-2" gap="sm">
                {ADJUST_TYPES.map((v) => (
                  <Label key={v} className="cursor-pointer">
                    <input
                      type="radio"
                      value={v}
                      {...register("type")}
                      className="sr-only"
                    />
                    <div
                      className={`rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors ${
                        selectedType === v
                          ? ADJUST_TYPE_CONFIG[v].activeClass
                          : `border-transparent ${themed.bgTertiary} ${themed.textSecondary}`
                      }`}
                    >
                      {t(ADJUST_TYPE_CONFIG[v].labelKey)}
                    </div>
                  </Label>
                ))}
              </Grid>
            </div>

            {/* Coins amount */}
            <div>
              <Label className="block mb-1">{t("coinsLabel")}</Label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder={t("coinsPlaceholder")}
                {...register("coins", { valueAsNumber: true })}
                className={patterns.adminInput}
              />
              {errors.coins && (
                <Caption className="text-red-500 mt-1">
                  {errors.coins.message}
                </Caption>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label className="block mb-1">{t("notesLabel")}</Label>
              <textarea
                rows={2}
                placeholder={t("notesPlaceholder")}
                {...register("notes")}
                className={`${patterns.adminInput} resize-none`}
              />
            </div>

            {adjustMutation.isError && (
              <Caption className="text-red-500">
                {adjustMutation.error instanceof Error
                  ? adjustMutation.error.message
                  : t("adjustFailed")}
              </Caption>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                variant={submitVariant}
                disabled={adjustMutation.isPending}
                className="flex-1"
              >
                {adjustMutation.isPending ? t("saving") : t("confirm")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={adjustMutation.isPending}
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
