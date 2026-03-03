"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatRelativeTime, formatNumber } from "@/utils";
import {
  Alert,
  Button,
  FormField,
  Heading,
  HorizontalScroller,
  Label,
  Section,
  Span,
  Text,
} from "@/components";
import {
  useProductReviews,
  useAuth,
  useApiMutation,
  useMessage,
} from "@/hooks";
import { reviewService } from "@/services";
import type { ReviewDocument } from "@/db/schema";

const { themed, borderRadius, rating: ratingTokens, flex } = THEME_CONSTANTS;

interface ReviewsResponse {
  data: ReviewDocument[];
  meta: {
    total: number;
    totalPages: number;
    hasMore: boolean;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  };
}

interface ProductReviewsProps {
  productId: string;
}

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Span
          key={star}
          className={star <= rating ? "text-amber-400" : ratingTokens.empty}
        >
          ★
        </Span>
      ))}
    </div>
  );
}

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <Span className={`w-3 ${themed.textSecondary}`}>{star}</Span>
      <Span className="text-amber-400 text-xs">★</Span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-amber-400 h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <Span className={`w-6 text-right ${themed.textSecondary}`}>{count}</Span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interactive star picker used inside WriteReviewForm
// ---------------------------------------------------------------------------
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-colors focus:outline-none"
        >
          <Span
            className={
              star <= (hovered || value)
                ? "text-amber-400"
                : "text-gray-300 dark:text-gray-600"
            }
          >
            ★
          </Span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WriteReviewForm — integrated write-review form shown below the heading.
// Requires auth; 403 → "purchase required", 400 → "already reviewed".
// ---------------------------------------------------------------------------
interface WriteReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

function WriteReviewForm({ productId, onSuccess }: WriteReviewFormProps) {
  const t = useTranslations("products");
  const tActions = useTranslations("actions");
  const { user } = useAuth();
  const router = useRouter();
  const { message, showSuccess, showError } = useMessage();

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isLoading } = useApiMutation<
    unknown,
    {
      productId: string;
      rating: number;
      title: string;
      comment: string;
    }
  >({
    mutationFn: (data) => reviewService.create(data),
    onSuccess: () => {
      setSubmitted(true);
      showSuccess(t("reviewFormSuccess"));
      onSuccess();
    },
    onError: (err) => {
      if (err.status === 403) {
        setFormError(t("reviewFormPurchaseRequired"));
      } else if (err.status === 400) {
        setFormError(t("reviewFormAlreadyReviewed"));
      } else {
        showError(err.message ?? tActions("retry"));
      }
    },
  });

  if (submitted) {
    return (
      <Alert variant="success" className="mb-6">
        {t("reviewFormSuccess")}
      </Alert>
    );
  }

  if (!user) {
    return (
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 ${themed.bgSecondary} ${borderRadius.xl} mb-6`}
      >
        <Text size="sm" variant="secondary">
          {t("reviewFormLoginRequired")}
        </Text>
        <Button
          variant="primary"
          size="sm"
          onClick={() => router.push(ROUTES.AUTH.LOGIN)}
        >
          {t("reviewFormSignIn")}
        </Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (rating === 0) {
      setFormError(t("reviewFormRating") + " " + tActions("required"));
      return;
    }
    mutate({ productId, rating, title, comment });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-4 sm:p-6 ${themed.bgSecondary} ${borderRadius.xl} mb-6 space-y-4`}
    >
      <Heading level={4}>{t("reviewFormTitle")}</Heading>

      {/* Rating picker */}
      <div>
        <Label required>{t("reviewFormRating")}</Label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Title */}
      <FormField
        type="text"
        name="review-title"
        label={t("reviewFormTitleLabel")}
        placeholder={t("reviewFormTitlePlaceholder")}
        value={title}
        onChange={(v) => setTitle(v)}
      />

      {/* Comment */}
      <FormField
        type="textarea"
        name="review-comment"
        label={t("reviewFormComment")}
        placeholder={t("reviewFormCommentPlaceholder")}
        value={comment}
        onChange={(v) => setComment(v)}
        required
        rows={4}
      />

      {/* Form-level error */}
      {formError && <Alert variant="error">{formError}</Alert>}

      {/* Mutation-level message */}
      {message && (
        <Alert variant={message.type === "success" ? "success" : "error"}>
          {message.text}
        </Alert>
      )}

      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? t("reviewFormSubmitting") : t("reviewFormSubmit")}
      </Button>
    </form>
  );
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const t = useTranslations("products");
  const tActions = useTranslations("actions");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, refetch } = useProductReviews(
    productId,
    page,
    pageSize,
  );

  const reviews = data?.data ?? [];
  const meta = data?.meta;
  const totalReviews = meta?.total ?? 0;
  const avgRating = meta?.averageRating ?? 0;
  const dist = meta?.ratingDistribution ?? {};

  return (
    <Section id="write-review">
      <Heading level={2} className="mb-4">
        {t("reviewsTitle")}
      </Heading>

      {/* Write-review form */}
      <WriteReviewForm
        productId={productId}
        onSuccess={() => {
          refetch();
          setPage(1);
        }}
      />

      {/* Rating summary */}
      {totalReviews > 0 && (
        <div
          className={`flex flex-col sm:flex-row gap-6 p-5 ${themed.bgSecondary} ${borderRadius.xl} mb-6`}
        >
          {/* Average */}
          <div className="flex flex-col items-center justify-center sm:w-32 shrink-0">
            <Span className={`text-5xl font-bold ${themed.textPrimary}`}>
              {formatNumber(avgRating, "en-US", { decimals: 1 })}
            </Span>
            <StarRating rating={Math.round(avgRating)} size="md" />
            <Span className={`text-xs mt-1 ${themed.textSecondary}`}>
              {totalReviews} reviews
            </Span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={dist[star] ?? 0}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`animate-pulse ${themed.bgSecondary} rounded-xl p-4 space-y-2`}
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* No reviews */}
      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-12">
          <Text weight="medium">{t("reviewsNone")}</Text>
          <Text size="sm" variant="secondary" className="mt-1">
            {t("reviewsBeFirst")}
          </Text>
        </div>
      )}

      {/* Review list */}
      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`p-4 ${themed.bgSecondary} ${borderRadius.xl} space-y-2`}
            >
              {/* Header */}
              <div className={`${flex.betweenStart} gap-3`}>
                <div className="flex items-center gap-3">
                  {review.userAvatar ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={review.userAvatar}
                        alt={review.userName}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 ${flex.center} shrink-0`}
                    >
                      <Span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {review.userName.charAt(0).toUpperCase()}
                      </Span>
                    </div>
                  )}
                  <div>
                    <Text weight="medium" size="sm">
                      {review.userName}
                    </Text>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      {review.verified && (
                        <Span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {t("verifiedPurchase")}
                        </Span>
                      )}
                    </div>
                  </div>
                </div>
                <Span className={`text-xs ${themed.textSecondary} shrink-0`}>
                  {formatRelativeTime(review.createdAt)}
                </Span>
              </div>

              {/* Content */}
              {review.title && (
                <Text weight="semibold" size="sm">
                  {review.title}
                </Text>
              )}
              <Text size="sm" variant="secondary">
                {review.comment}
              </Text>

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <HorizontalScroller className="pb-1 pt-1">
                  {review.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`Review photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </HorizontalScroller>
              )}

              {/* Helpful */}
              {review.helpfulCount > 0 && (
                <Text size="xs" variant="secondary">
                  {t("helpful", { count: review.helpfulCount })}
                </Text>
              )}
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className={`${flex.center} gap-2 pt-2`}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${themed.bgPrimary} ${themed.textPrimary} border ${themed.border}`}
              >
                {tActions("back")}
              </button>
              <Span className={`text-sm ${themed.textSecondary}`}>
                {page} / {meta.totalPages}
              </Span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasMore}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${themed.bgPrimary} ${themed.textPrimary} border ${themed.border}`}
              >
                {tActions("next")}
              </button>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
