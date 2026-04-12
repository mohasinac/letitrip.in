"use client";

import { useState, useRef, Suspense } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatRelativeTime, formatNumber } from "@/utils";
import {
  Heading,
  Label,
  Section,
  Text,
  HorizontalScroller,
  Span,
  Button,
} from "@mohasinac/appkit/ui";
import {
  MediaUploadList,
  MediaUploadField,
  type MediaField,
} from "@mohasinac/appkit/features/media";
import {
  Alert,
  FormField,
  MediaAvatar,
  MediaImage,
  MediaLightbox,
} from "@/components";
import { useProductReviews } from "@mohasinac/appkit/features/reviews";
import { useCreateReview } from "@/hooks/useProductReviews";
import { useAuth, useMediaUpload, useMediaAbort, useMessage, useUrlTable } from "@/hooks";

const { themed, rating: ratingTokens, flex, spacing } = THEME_CONSTANTS;

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
          ?
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
      <Span className="text-amber-400 text-xs">?</Span>
      <div className="flex-1 bg-zinc-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
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
// ReviewImages � thumbnail strip with per-review lightbox state
// ---------------------------------------------------------------------------
function ReviewImages({ images }: { images: string[] }) {
  const t = useTranslations("products");
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const items = images.map((src, i) => ({
    src,
    alt: t("reviewPhotoAlt", { index: i + 1 }),
  }));
  return (
    <>
      <HorizontalScroller className="pb-1 pt-1">
        {images.map((img, idx) => (
          <Button
            key={idx}
            onClick={() => {
              setLightboxIndex(idx);
              setLightboxOpen(true);
            }}
            aria-label={t("reviewPhotoAlt", { index: idx + 1 })}
            className="relative shrink-0 w-16 h-16 p-0 min-h-0 rounded-lg overflow-hidden cursor-zoom-in border-0 shadow-none"
          >
            <MediaImage
              src={img}
              alt={t("reviewPhotoAlt", { index: idx + 1 })}
              size="thumbnail"
            />
          </Button>
        ))}
      </HorizontalScroller>
      <MediaLightbox
        items={items}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
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
        <Button
          key={star}
          type="button"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl transition-colors"
          variant="ghost"
        >
          <Span
            className={
              star <= (hovered || value)
                ? "text-amber-400"
                : "text-zinc-300 dark:text-zinc-600"
            }
          >
            ?
          </Span>
        </Button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WriteReviewForm � integrated write-review form shown below the heading.
// Requires auth; 403 ? "purchase required", 400 ? "already reviewed".
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
  const [reviewImages, setReviewImages] = useState<MediaField[]>([]);
  const [reviewVideoUrl, setReviewVideoUrl] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Sequential index ref for SEO-friendly review image filenames
  const imageIndexRef = useRef(0);
  const { upload: uploadMedia } = useMediaUpload();
  const onAbort = useMediaAbort();

  const handleImageUpload = async (file: File): Promise<string> => {
    imageIndexRef.current += 1;
    return uploadMedia(file, "tmp/reviews", true, {
      type: "review-image",
      productId,
      index: imageIndexRef.current,
    });
  };

  const { mutate, isPending: isLoading } = useCreateReview(
    () => {
      setSubmitted(true);
      showSuccess(t("reviewFormSuccess"));
      onSuccess();
    },
    (err) => {
      if (err.status === 403) {
        setFormError(t("reviewFormPurchaseRequired"));
      } else if (err.status === 400) {
        setFormError(t("reviewFormAlreadyReviewed"));
      } else {
        showError(err.message ?? tActions("retry"));
      }
    },
  );

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
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 ${themed.bgSecondary} rounded-xl mb-6`}
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
    mutate({
      productId,
      rating,
      title,
      comment,
      images: reviewImages.map((f) => f.url),
      videoUrl: reviewVideoUrl || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-4 sm:p-6 ${themed.bgSecondary} rounded-xl mb-6 ${spacing.stack}`}
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

      {/* Images — max 5 per review */}
      <MediaUploadList
        label={t("reviewFormImages")}
        value={reviewImages}
        onChange={setReviewImages}
        onUpload={handleImageUpload}
        accept="image/*"
        maxItems={5}
        maxSizeMB={10}
        helperText={t("reviewFormImagesHelper")}
        onAbort={onAbort}
      />

      {/* Video — max 1 per review (optional) */}
      <MediaUploadField
        label={t("reviewFormVideo")}
        value={reviewVideoUrl}
        onChange={setReviewVideoUrl}
        onUpload={(file) =>
          uploadMedia(file, "tmp/reviews", true, {
            type: "review-video",
            productId,
          })
        }
        accept="video/*"
        maxSizeMB={50}
        helperText={t("reviewFormVideoHelper")}
        onAbort={onAbort}
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

function ProductReviewsContent({ productId }: ProductReviewsProps) {
  const t = useTranslations("products");
  const tActions = useTranslations("actions");
  const table = useUrlTable({ defaults: { page: "1" } });
  const page = table.getNumber("page", 1);
  const pageSize = 10;

  const {
    reviews,
    total: totalReviews,
    totalPages,
    hasMore,
    averageRating,
    ratingDistribution: dist,
    isLoading,
    refetch,
  } = useProductReviews(productId, { page, pageSize });

  const avgRating = averageRating ?? 0;
  const distMap = dist ?? {};

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
          table.setPage(1);
        }}
      />

      {/* Rating summary */}
      {totalReviews > 0 && (
        <div
          className={`flex flex-col sm:flex-row gap-6 p-5 ${themed.bgSecondary} rounded-xl mb-6`}
        >
          {/* Average */}
          <div className="flex flex-col items-center justify-center sm:w-32 shrink-0">
            <Span className={`text-5xl font-bold ${themed.textPrimary}`}>
              {formatNumber(avgRating, "en-IN", { decimals: 1 })}
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
                count={distMap[star] ?? 0}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className={spacing.stack}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`animate-pulse ${themed.bgSecondary} rounded-xl p-4 space-y-2`}
            >
              <div className="h-4 bg-zinc-200 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-slate-700 rounded w-1/2" />
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
        <div className={spacing.stack}>
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`p-4 ${themed.bgSecondary} rounded-xl space-y-2`}
            >
              {/* Header */}
              <div className={`${flex.betweenStart} gap-3`}>
                <div className="flex items-center gap-3">
                  {review.userAvatar ? (
                    <MediaAvatar
                      src={review.userAvatar}
                      alt={review.userName}
                      size="sm"
                    />
                  ) : (
                    <div
                      className={`w-9 h-9 rounded-full bg-primary/10 dark:bg-primary/20 ${flex.center} shrink-0`}
                    >
                      <Span className="text-sm font-bold text-primary">
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
                  {review.createdAt ? formatRelativeTime(review.createdAt) : ""}
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
                <ReviewImages images={review.images.map((img) => img.url)} />
              )}

              {/* Helpful */}
              {(review.helpfulCount ?? 0) > 0 && (
                <Text size="xs" variant="secondary">
                  {t("helpful", { count: review.helpfulCount ?? 0 })}
                </Text>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`${flex.center} gap-2 pt-2`}>
              <Button
                onClick={() => table.setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${themed.bgPrimary} ${themed.textPrimary} border ${themed.border}`}
              >
                {tActions("back")}
              </Button>
              <Span className={`text-sm ${themed.textSecondary}`}>
                {page} / {totalPages}
              </Span>
              <Button
                onClick={() => table.setPage(page + 1)}
                disabled={!hasMore}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${themed.bgPrimary} ${themed.textPrimary} border ${themed.border}`}
              >
                {tActions("next")}
              </Button>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}

export function ProductReviews(props: ProductReviewsProps) {
  return (
    <Suspense>
      <ProductReviewsContent {...props} />
    </Suspense>
  );
}
