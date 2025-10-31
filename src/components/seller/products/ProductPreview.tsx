"use client";

import React from "react";
import {
  UnifiedCard,
  CardMedia,
  CardContent,
  UnifiedBadge,
  PrimaryButton,
} from "@/components/ui/unified";
import { ShoppingCart, Truck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPreviewProps {
  data: any;
}

export default function ProductPreview({ data }: ProductPreviewProps) {
  const mainImage = data.media?.images?.[0]?.url || "/assets/placeholder.png";
  const price = data.pricing?.price || 0;
  const compareAt = data.pricing?.compareAtPrice || 0;
  const discount =
    compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  // Custom star rating component
  const StarRating = ({ value }: { value: number }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              "w-4 h-4",
              star <= value
                ? "text-warning fill-warning"
                : "text-border fill-border"
            )}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="p-4 bg-surface rounded-lg sticky top-24">
      <h3 className="text-xl font-semibold mb-1 text-text">Product Preview</h3>
      <p className="text-xs text-textSecondary mb-4">
        How customers will see your product
      </p>

      <UnifiedCard variant="elevated" className="overflow-hidden">
        {/* Product Image */}
        <CardMedia
          className={cn(
            "h-60 bg-cover bg-center bg-surfaceVariant relative",
            !mainImage && "flex items-center justify-center"
          )}
          style={{
            backgroundImage: mainImage ? `url(${mainImage})` : undefined,
          }}
        >
          {discount > 0 && (
            <div className="absolute top-2 right-2">
              <UnifiedBadge variant="error" size="sm">
                -{discount}%
              </UnifiedBadge>
            </div>
          )}
        </CardMedia>

        <CardContent className="p-6">
          {/* Product Name */}
          <h3 className="text-xl font-semibold mb-2 text-text truncate">
            {data.name || "Product Name"}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <StarRating value={4.5} />
            <span className="text-xs text-textSecondary">(0 reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-primary">
              ₹{price.toLocaleString()}
            </span>
            {compareAt > price && (
              <span className="text-sm line-through text-textSecondary">
                ₹{compareAt.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          {data.shortDescription && (
            <p className="text-sm text-textSecondary mb-4 line-clamp-3">
              {data.shortDescription}
            </p>
          )}

          {/* Product Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {data.condition && (
              <UnifiedBadge variant="outline" size="sm">
                {data.condition.replace("_", " ").toUpperCase()}
              </UnifiedBadge>
            )}
            {data.shipping?.isFree && (
              <UnifiedBadge variant="success" size="sm">
                <Truck className="w-3 h-3 mr-1" />
                Free Shipping
              </UnifiedBadge>
            )}
            {data.returnable && (
              <UnifiedBadge variant="info" size="sm">
                <RotateCcw className="w-3 h-3 mr-1" />
                {data.returnPeriod || 7} Days Return
              </UnifiedBadge>
            )}
          </div>

          {/* Add to Cart Button */}
          <PrimaryButton
            fullWidth
            leftIcon={<ShoppingCart className="w-4 h-4" />}
            disabled
            className="mb-4"
          >
            Add to Cart
          </PrimaryButton>

          {/* SEO Preview */}
          {data.seo?.title && (
            <>
              <div className="border-t border-border my-4"></div>
              <h4 className="text-sm font-semibold text-primary mb-2">
                SEO Preview
              </h4>
              <div className="p-3 bg-surfaceVariant rounded">
                <p className="text-xs font-semibold text-primary">
                  {data.seo.title}
                </p>
                <p className="text-xs text-success">
                  hobbiesspot.com › {data.seo.slug}
                </p>
                <p className="text-xs text-textSecondary mt-1">
                  {data.seo.description}
                </p>
              </div>
            </>
          )}

          {/* Product Status & Info */}
          {(data.status || data.inventory?.quantity !== undefined) && (
            <>
              <div className="border-t border-border my-4"></div>
              <div className="space-y-2">
                {data.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-textSecondary">Status:</span>
                    <UnifiedBadge
                      variant={data.status === "active" ? "success" : "default"}
                      size="sm"
                    >
                      {data.status.toUpperCase()}
                    </UnifiedBadge>
                  </div>
                )}
                {data.inventory?.quantity !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-textSecondary">Stock:</span>
                    <span className="text-xs font-semibold text-text">
                      {data.inventory.quantity} units
                    </span>
                  </div>
                )}
                {data.inventory?.sku && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-textSecondary">SKU:</span>
                    <span className="text-xs font-semibold text-text">
                      {data.inventory.sku}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </UnifiedCard>
    </div>
  );
}
