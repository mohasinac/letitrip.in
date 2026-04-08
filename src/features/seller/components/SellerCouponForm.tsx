"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  FormGroup,
  Heading,
  Select,
  Text,
  Label,
  Input,
  Span,
} from "@/components";
import { useMessage } from "@/hooks";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { sellerCreateCouponAction } from "@/actions";
import { nowISO } from "@/utils";

const { themed, spacing } = THEME_CONSTANTS;

// ─── Local schema (mirrors server-side zod without the server-only transform) ──

const schema = z.object({
  sellerCode: z
    .string()
    .min(3, "At least 3 characters")
    .max(15, "At most 15 characters")
    .regex(/^[A-Z0-9]+$/i, "Only letters and numbers"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["percentage", "fixed", "free_shipping", "buy_x_get_y"]),
  applicableToAuctions: z.boolean(),
  discount: z.object({
    value: z.coerce.number().min(0),
    maxDiscount: z.coerce.number().optional(),
    minPurchase: z.coerce.number().optional(),
  }),
  usage: z.object({
    totalLimit: z.coerce.number().int().optional(),
    perUserLimit: z.coerce.number().int().optional(),
    currentUsage: z.number().default(0),
  }),
  validity: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    isActive: z.boolean(),
  }),
});

type FormValues = z.infer<typeof schema>;

export function SellerCouponForm() {
  const router = useRouter();
  const { showError, showSuccess } = useMessage();
  const t = useTranslations("sellerCoupons");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      type: "percentage",
      applicableToAuctions: false,
      usage: { currentUsage: 0 },
      validity: {
        startDate: nowISO().slice(0, 10),
        isActive: true,
      },
    },
  });

  const couponType = watch("type");
  const applicableToAuctions = watch("applicableToAuctions");
  const sellerCode = watch("sellerCode");

  const onSubmit = async (values: FormValues) => {
    try {
      await sellerCreateCouponAction({
        ...values,
        description: values.description ?? "",
        restrictions: {
          firstTimeUserOnly: false,
          combineWithSellerCoupons: false,
        },
      });
      showSuccess(t("successCreated"));
      router.push(ROUTES.SELLER.COUPONS);
    } catch (e) {
      showError((e as Error).message ?? t("errorCreate"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={spacing.stack}>
      <Card className="p-6">
        <Accordion
          type="multiple"
          defaultValue={["seller-coupon-basic", "seller-coupon-discount"]}
          className="rounded-2xl border border-zinc-200 dark:border-slate-700 overflow-hidden"
        >
          <AccordionItem
            value="seller-coupon-basic"
            title={<Text className="font-semibold">{t("formSectionBasic")}</Text>}
          >
            <FormGroup columns={2} className="pt-3">
          {/* Short code */}
          <div>
            <Label
              htmlFor="sellerCode"
              className="block text-sm font-medium mb-1.5"
            >
              {t("fieldSellerCode")}
            </Label>
            <Input
              id="sellerCode"
              {...register("sellerCode")}
              placeholder={t("fieldSellerCodePlaceholder")}
              className="uppercase"
            />
            {sellerCode && (
              <Text className="mt-1 text-xs text-primary dark:text-primary/80">
                {t("codePreviewLabel")}{" "}
                <Span className="font-mono font-bold">
                  STORE-{sellerCode.toUpperCase()}
                </Span>
              </Text>
            )}
            {errors.sellerCode && (
              <Text className="mt-1 text-xs text-red-500 dark:text-red-400">
                {errors.sellerCode.message}
              </Text>
            )}
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-1.5">
              {t("fieldName")}
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder={t("fieldNamePlaceholder")}
            />
            {errors.name && (
              <Text className="mt-1 text-xs text-red-500 dark:text-red-400">
                {errors.name.message}
              </Text>
            )}
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <Label
              htmlFor="description"
              className="block text-sm font-medium mb-1.5"
            >
              {t("fieldDescription")}
            </Label>
            <Input
              id="description"
              {...register("description")}
              placeholder={t("fieldDescriptionPlaceholder")}
            />
          </div>
            </FormGroup>
          </AccordionItem>

          <AccordionItem
            value="seller-coupon-discount"
            title={<Text className="font-semibold">{t("formSectionDiscount")}</Text>}
          >
            <FormGroup columns={2} className="pt-3">
          {/* Type */}
          <div>
            <Label htmlFor="type" className="block text-sm font-medium mb-1.5">
              {t("fieldType")}
            </Label>
            <Select
              id="type"
              {...register("type")}
              className={`w-full rounded-lg border ${themed.border} ${themed.bgPrimary} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
              options={[
                { value: "percentage", label: t("typePercentage") },
                { value: "fixed", label: t("typeFixed") },
                { value: "free_shipping", label: t("typeFreeShipping") },
              ]}
            />
          </div>

          {/* Value */}
          {couponType !== "free_shipping" && (
            <div>
              <Label
                htmlFor="discount.value"
                className="block text-sm font-medium mb-1.5"
              >
                {couponType === "percentage"
                  ? t("fieldDiscountPercent")
                  : t("fieldDiscountAmount")}
              </Label>
              <Input
                id="discount.value"
                type="number"
                min={0}
                {...register("discount.value")}
                placeholder={couponType === "percentage" ? "10" : "100"}
              />
            </div>
          )}

          {/* Max discount (percentage only) */}
          {couponType === "percentage" && (
            <div>
              <Label
                htmlFor="discount.maxDiscount"
                className="block text-sm font-medium mb-1.5"
              >
                {t("fieldMaxDiscount")}
              </Label>
              <Input
                id="discount.maxDiscount"
                type="number"
                min={0}
                {...register("discount.maxDiscount")}
                placeholder={t("fieldMaxDiscountPlaceholder")}
              />
            </div>
          )}

          {/* Min purchase */}
          <div>
            <Label
              htmlFor="discount.minPurchase"
              className="block text-sm font-medium mb-1.5"
            >
              {t("fieldMinPurchase")}
            </Label>
            <Input
              id="discount.minPurchase"
              type="number"
              min={0}
              {...register("discount.minPurchase")}
              placeholder={t("fieldMinPurchasePlaceholder")}
            />
          </div>

          {/* Applicable to auctions */}
          <div className="sm:col-span-2">
            <Label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("applicableToAuctions")}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Span className="text-sm">{t("fieldApplicableToAuctions")}</Span>
            </Label>
            <Text className={`mt-1 text-xs ${themed.textSecondary}`}>
              {applicableToAuctions
                ? t("hintAuctionsOnly")
                : t("hintRegularOnly")}
            </Text>
            <Text
              className={`mt-0.5 text-xs text-amber-600 dark:text-amber-400`}
            >
              {t("hintPreordersNever")}
            </Text>
          </div>
            </FormGroup>
          </AccordionItem>

          <AccordionItem
            value="seller-coupon-usage"
            title={<Text className="font-semibold">{t("formSectionUsage")}</Text>}
          >
            <FormGroup columns={2} className="pt-3">
          <div>
            <Label
              htmlFor="usage.totalLimit"
              className="block text-sm font-medium mb-1.5"
            >
              {t("fieldTotalLimit")}
            </Label>
            <Input
              id="usage.totalLimit"
              type="number"
              min={1}
              {...register("usage.totalLimit")}
              placeholder={t("fieldTotalLimitPlaceholder")}
            />
          </div>
          <div>
            <Label
              htmlFor="usage.perUserLimit"
              className="block text-sm font-medium mb-1.5"
            >
              {t("fieldPerUserLimit")}
            </Label>
            <Input
              id="usage.perUserLimit"
              type="number"
              min={1}
              {...register("usage.perUserLimit")}
              placeholder={t("fieldPerUserLimitPlaceholder")}
            />
          </div>
            </FormGroup>
          </AccordionItem>

          <AccordionItem
            value="seller-coupon-validity"
            title={<Text className="font-semibold">{t("formSectionValidity")}</Text>}
          >
            <FormGroup columns={2} className="pt-3">
          <div>
            <Label
              htmlFor="validity.startDate"
              className="block text-sm font-medium mb-1.5"
            >
              {t("fieldStartDate")}
            </Label>
            <Input
              id="validity.startDate"
              type="date"
              {...register("validity.startDate")}
            />
            {errors.validity?.startDate && (
              <Text className="mt-1 text-xs text-red-500 dark:text-red-400">
                {errors.validity.startDate.message}
              </Text>
            )}
          </div>
          <div>
            <Label
              htmlFor="validity.endDate"
              className="block text-sm font-medium mb-1.5"
            >
              {t("fieldEndDate")}
            </Label>
            <Input
              id="validity.endDate"
              type="date"
              {...register("validity.endDate")}
            />
          </div>
          <div>
            <Label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("validity.isActive")}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Span className="text-sm">{t("fieldIsActive")}</Span>
            </Label>
          </div>
            </FormGroup>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Submit */}
      <div className="flex gap-3 justify-start">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push(ROUTES.SELLER.COUPONS)}
          disabled={isSubmitting}
        >
          {t("actionCancel")}
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          {t("actionCreate")}
        </Button>
      </div>
    </form>
  );
}
