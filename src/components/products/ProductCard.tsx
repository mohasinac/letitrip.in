"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Span, Text, TextLink } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { ProductDocument } from "@/db/schema";

const { themed, borderRadius, flex, position } = THEME_CONSTANTS;

interface ProductCardProps {
  product: Pick<
    ProductDocument,
    | "id"
    | "title"
    | "price"
    | "currency"
    | "mainImage"
    | "status"
    | "featured"
    | "isAuction"
    | "currentBid"
    | "isPromoted"
    | "slug"
  >;
  className?: string;
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const t = useTranslations("products");
  const isOutOfStock =
    product.status === "out_of_stock" || product.status === "sold";
  const displayPrice = product.isAuction
    ? (product.currentBid ?? product.price)
    : product.price;

  return (
    <TextLink
      href={ROUTES.PUBLIC.PRODUCT_DETAIL(product.slug ?? product.id)}
      className={`group block ${themed.bgPrimary} ${borderRadius.lg} overflow-hidden hover:shadow-xl transition-all duration-300 ${isOutOfStock ? "opacity-70" : ""} ${className}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className={`${position.fill} ${flex.center} text-gray-400 text-4xl`}
          >
            📦
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <Span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("featured")}
            </Span>
          )}
          {product.isAuction && (
            <Span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("auction")}
            </Span>
          )}
          {product.isPromoted && !product.isAuction && (
            <Span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {t("promoted")}
            </Span>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div
            className={`${position.fill} bg-black/40 flex items-end justify-center pb-3`}
          >
            <Span className="bg-black/70 text-white text-xs font-medium px-3 py-1 rounded-full">
              {product.status === "sold" ? t("sold") : t("outOfStock")}
            </Span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <Text
          size="sm"
          weight="medium"
          className={`${themed.textPrimary} line-clamp-2 leading-snug mb-1`}
        >
          {product.title}
        </Text>
        <Text className="text-base font-bold text-indigo-600 dark:text-indigo-400">
          {formatCurrency(displayPrice)}
        </Text>
      </div>
    </TextLink>
  );
}
