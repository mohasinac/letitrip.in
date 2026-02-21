"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES, THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { ProductDocument } from "@/db/schema";

const { themed, borderRadius } = THEME_CONSTANTS;

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
  const isOutOfStock =
    product.status === "out_of_stock" || product.status === "sold";
  const displayPrice = product.isAuction
    ? (product.currentBid ?? product.price)
    : product.price;

  return (
    <Link
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
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-4xl">
            📦
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {UI_LABELS.PRODUCTS_PAGE.FEATURED_BADGE}
            </span>
          )}
          {product.isAuction && (
            <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {UI_LABELS.PRODUCTS_PAGE.AUCTION}
            </span>
          )}
          {product.isPromoted && !product.isAuction && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {UI_LABELS.PRODUCTS_PAGE.PROMOTED_BADGE}
            </span>
          )}
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-3">
            <span className="bg-black/70 text-white text-xs font-medium px-3 py-1 rounded-full">
              {product.status === "sold"
                ? UI_LABELS.PRODUCTS_PAGE.SOLD
                : UI_LABELS.PRODUCTS_PAGE.OUT_OF_STOCK}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p
          className={`text-sm font-medium ${themed.textPrimary} line-clamp-2 leading-snug mb-1`}
        >
          {product.title}
        </p>
        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
          {formatCurrency(displayPrice)}
        </p>
      </div>
    </Link>
  );
}
