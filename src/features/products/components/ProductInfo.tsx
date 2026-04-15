"use client";

import { useTranslations } from "next-intl";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import {
  formatCurrency,
  formatDate,
  resolveDate,
  capitalizeWords,
} from "@/utils";

function formatCategoryLabel(label: string): string {
  if (label.startsWith("category-")) {
    return capitalizeWords(label.slice("category-".length).replace(/-/g, " "));
  }
  return label;
}
import {
  Heading,
  Li,
  Text,
  Ul,
  Divider,
  Span,
  Badge,
  Row,
  Stack,
  Accordion,
  AccordionItem,
} from "@mohasinac/appkit/ui";
import { TextLink } from "@/components";
import { ProductFeatureBadges } from "./ProductFeatureBadges";
import type { ProductStatus } from "@mohasinac/appkit/features/products";
import { Store, Tag, Eye, Clock, Truck, RotateCcw } from "lucide-react";

const { themed, flex } = THEME_CONSTANTS;

interface ProductInfoProps {
  title: string;
  description: string;
  price: number;
  currency: string;
  status: ProductStatus;
  featured: boolean;
  isAuction?: boolean;
  currentBid?: number;
  startingBid?: number;
  bidCount?: number;
  auctionEndDate?: Date;
  stockQuantity: number;
  availableQuantity: number;
  brand?: string;
  category: string;
  subcategory?: string;
  sellerName: string;
  sellerId?: string;
  tags: string[];
  specifications?: { name: string; value: string; unit?: string }[];
  features?: string[];
  shippingInfo?: string;
  returnPolicy?: string;
  viewCount?: number;
  slug?: string;
  isPromoted?: boolean;
  condition?: string;
}

export function ProductInfo({
  title,
  description,
  price,
  currency,
  status,
  featured,
  isAuction,
  currentBid,
  startingBid,
  bidCount,
  auctionEndDate,
  stockQuantity,
  availableQuantity,
  brand,
  category,
  subcategory,
  sellerName,
  sellerId,
  tags,
  specifications,
  features,
  shippingInfo,
  returnPolicy,
  viewCount,
  slug,
  isPromoted,
  condition,
}: ProductInfoProps) {
  const t = useTranslations("products");
  const isOutOfStock =
    status === "out_of_stock" || status === "sold" || availableQuantity === 0;
  const displayPrice = isAuction ? (currentBid ?? startingBid ?? price) : price;

    return (
      <Stack gap="md" className="gap-5">
      {/* ——— Product Name ——— */}
      <div>
        <Heading
          level={1}
          className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight"
        >
          {title}
        </Heading>

        {/* Badge row */}
        <Row wrap gap="sm" className="mt-2">
          {featured && <Badge variant="warning">{t("featured")}</Badge>}
          {isAuction && <Badge variant="info">{t("auction")}</Badge>}
          {isPromoted && <Badge variant="primary">{t("promoted")}</Badge>}
          {isOutOfStock && (
            <Badge variant="danger">
              {status === "sold" ? t("sold") : t("outOfStock")}
            </Badge>
          )}
          {!isOutOfStock && availableQuantity > 0 && (
            <Badge variant="success">{t("inStock")}</Badge>
          )}
        </Row>
      </div>

      {/* ——— Store + Category row ——— */}
      <div className={`${flex.rowCenter} flex-wrap gap-x-4 gap-y-1.5 text-sm`}>
        {sellerName && (
          <TextLink
            href={
              sellerId
                ? ROUTES.PUBLIC.STORE_DETAIL(sellerId)
                : ROUTES.PUBLIC.STORES
            }
            className={`${flex.rowCenter} gap-1.5 font-medium text-primary hover:underline`}
          >
            <Store className="w-4 h-4" aria-hidden="true" />
            {sellerName}
          </TextLink>
        )}
        {category && (
          <TextLink
            href={`${ROUTES.PUBLIC.PRODUCTS}?filters=category==${encodeURIComponent(category)}`}
            className={`${flex.rowCenter} gap-1.5 ${themed.textSecondary} hover:text-primary transition-colors`}
          >
            <Tag className="w-3.5 h-3.5" aria-hidden="true" />
            {subcategory
              ? `${formatCategoryLabel(category)} › ${formatCategoryLabel(subcategory)}`
              : formatCategoryLabel(category)}
          </TextLink>
        )}
        {brand && (
          <Span variant="secondary" size="sm">
            <Span weight="medium">{t("brand")}:</Span> {brand}
          </Span>
        )}
      </div>

      {/* ——— Price section ——— */}
      <div className={`p-4 rounded-xl ${themed.bgSecondary}`}>
        {isAuction ? (
          <div className="space-y-1">
            <Text size="sm" variant="secondary">
              {currentBid ? t("currentBid") : t("startingBid")}
            </Text>
            <Text className="text-3xl sm:text-4xl font-bold text-primary">
              {formatCurrency(displayPrice ?? price)}
            </Text>
            <div className={`${flex.rowCenter} gap-4 mt-1`}>
              {bidCount !== undefined && (
                <Text size="sm" variant="secondary">
                  {t("totalBids", { count: bidCount })}
                </Text>
              )}
              {auctionEndDate && (
                <Text
                  size="sm"
                  variant="secondary"
                  className={`${flex.rowCenter} gap-1`}
                >
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  {t("auctionEnds")}{" "}
                  <time
                    dateTime={resolveDate(auctionEndDate)?.toISOString() ?? ""}
                  >
                    <Span variant="primary" weight="medium">
                      {formatDate(auctionEndDate)}
                    </Span>
                  </time>
                </Text>
              )}
            </div>
          </div>
        ) : (
          <div className={`${flex.rowCenter} gap-3`}>
            <Text className="text-3xl sm:text-4xl font-bold text-primary">
              {formatCurrency(price)}
            </Text>
            {!isOutOfStock && availableQuantity > 0 && (
              <Text
                size="sm"
                className="text-emerald-600 dark:text-emerald-400 font-medium"
              >
                {t("availableStock", { qty: availableQuantity })}
              </Text>
            )}
          </div>
        )}
        {viewCount !== undefined && viewCount > 0 && (
          <Text
            size="xs"
            variant="muted"
            className={`${flex.rowCenter} gap-1 mt-2`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            {t("viewCount", { count: viewCount })}
          </Text>
        )}
      </div>

      {/* ——— Feature Badges (highlight section) ——— */}
      <ProductFeatureBadges
        featured={featured}
        fasterDelivery={Boolean(shippingInfo)}
        ratedSeller={false}
        condition={condition}
        returnable={Boolean(returnPolicy)}
        freeShipping={shippingInfo?.toLowerCase().includes("free") ?? false}
        codAvailable={false}
        isAuction={isAuction}
      />

      <Divider />

      {/* ——— Short description ——— */}
      {description && (
        <div>
          <Heading level={2} className="text-base font-semibold mb-2">
            {t("shortDescription")}
          </Heading>
          <Text size="sm" variant="secondary" className="leading-relaxed">
            {description}
          </Text>
        </div>
      )}

      {/* ——— Features list ——— */}
      {features && features.length > 0 && (
        <div>
          <Heading level={2} className="text-base font-semibold mb-2">
            {t("productFeatures")}
          </Heading>
          <Ul className="space-y-1.5">
            {features.map((f, idx) => (
              <Li
                key={idx}
                className={`${flex.rowCenter} gap-2 text-sm ${themed.textSecondary}`}
              >
                <Span
                  className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
                  aria-hidden="true"
                />
                {f}
              </Li>
            ))}
          </Ul>
        </div>
      )}

      {/* ——— Specifications (collapsible) ——— */}
      {specifications && specifications.length > 0 && (
        <Accordion type="single" defaultValue="specs">
          <AccordionItem value="specs" title={t("specsTitle")}>
            <dl
              className={`rounded-xl border ${themed.border} divide-y divide-zinc-100 dark:divide-slate-800 overflow-hidden`}
            >
              {specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-4 py-2.5 text-sm ${
                    idx % 2 === 0 ? themed.bgSecondary : ""
                  }`}
                >
                  <dt className="w-2/5 shrink-0">
                    <Span weight="medium" variant="primary">
                      {spec.name}
                    </Span>
                  </dt>
                  <dd>
                    <Span variant="secondary">
                      {spec.value}
                      {spec.unit ? ` ${spec.unit}` : ""}
                    </Span>
                  </dd>
                </div>
              ))}
            </dl>
          </AccordionItem>
        </Accordion>
      )}

      {/* ——— Delivery & Returns (collapsible) ——— */}
      {(shippingInfo || returnPolicy) && (
        <Accordion type="single" defaultValue="delivery">
          <AccordionItem value="delivery" title={t("deliveryInfo")}>
            <div className="space-y-3">
              {shippingInfo && (
                <div className={`${flex.rowStart} gap-3`}>
                  <Truck
                    className="w-5 h-5 text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <Text weight="medium" size="sm">
                      {t("shipping")}
                    </Text>
                    <Text size="sm" variant="secondary">
                      {shippingInfo}
                    </Text>
                  </div>
                </div>
              )}
              {returnPolicy && (
                <div className={`${flex.rowStart} gap-3`}>
                  <RotateCcw
                    className="w-5 h-5 text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <Text weight="medium" size="sm">
                      {t("returnPolicy")}
                    </Text>
                    <Text size="sm" variant="secondary">
                      {returnPolicy}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      )}

      {/* ——— Tags ——— */}
      {tags && tags.length > 0 && (
        <Row wrap gap="sm">
          {tags.map((tag) => (
            <TextLink
              key={tag}
              href={`${ROUTES.PUBLIC.PRODUCTS}?filters=tags@=${encodeURIComponent(tag)}`}
              className={`px-2.5 py-1 text-xs rounded-full ${themed.bgSecondary} border ${themed.border} ${themed.textSecondary} hover:border-primary/40 hover:text-primary transition-colors`}
            >
              #{tag}
            </TextLink>
          ))}
        </Row>
      )}
      </Stack>
  );
}

