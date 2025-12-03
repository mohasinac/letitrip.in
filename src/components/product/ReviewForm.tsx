"use client";

import { useState } from "react";
import { Star, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { FormInput, FormLabel, FormTextarea } from "@/components/forms";
import { logError } from "@/lib/error-logger";
import { reviewsService } from "@/services/reviews.service";
import MediaUploader from "@/components/media/MediaUploader";
import { MediaFile } from "@/types/media";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  productId,
  orderId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    uploadMultipleMedia,
    cleanupUploadedMedia,
    clearTracking,
    isUploading,
    getUploadedUrls,
    hasUploadedMedia,
  } = useMediaUploadWithCleanup({
    enableNavigationGuard: true,
    navigationGuardMessage: "You have uploaded media. Leave and delete?",
    onUploadError: (error) => {
      setError(`Upload failed: ${error}`);
    },
  });

  const handleFilesAdded = async (files: MediaFile[]) => {
    setMediaFiles([...mediaFiles, ...files]);
    setError("");

    try {
      await uploadMultipleMedia(
        files.map((f) => f.file),
        "review",
        productId,
      );
      toast.success("Images uploaded successfully");
    } catch (err) {
      logError(err as Error, {
        component: "ReviewForm.handleImageUpload",
        metadata: { productId },
      });
      toast.error("Failed to upload images");
    }
  };

  const handleFileRemoved = (id: string) => {
    setMediaFiles(mediaFiles.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await reviewsService.create({
        productId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        images: getUploadedUrls(),
      });

      // Success! Clear tracking
      clearTracking();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit review");

      // Failure! Clean up uploaded media
      if (hasUploadedMedia) {
        await cleanupUploadedMedia();
        setMediaFiles([]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = async () => {
    if (hasUploadedMedia) {
      const confirmed =
        globalThis.confirm?.("You have uploaded media. Cancel and delete?") ??
        true;
      if (!confirmed) return;
      await cleanupUploadedMedia();
    }
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <FormLabel id="rating-label" required>
          Your Rating
        </FormLabel>
        <div
          className="flex items-center gap-2"
          role="radiogroup"
          aria-labelledby="rating-label"
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <FormInput
          id="title"
          label="Review Title (Optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's most important to know?"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-500">{title.length}/100</p>
      </div>

      {/* Comment */}
      <div>
        <FormTextarea
          id="comment"
          label="Your Review"
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={5}
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-gray-500">{comment.length}/1000</p>
      </div>

      {/* Images */}
      <div>
        <FormLabel id="media-label">Add Photos/Videos (Optional)</FormLabel>
        <p className="text-xs text-gray-500 mb-3">
          Upload up to 5 photos or videos to help others see your experience.
          You can also use your camera!
        </p>

        <MediaUploader
          accept="all"
          maxFiles={5}
          multiple={true}
          resourceType="product"
          onFilesAdded={handleFilesAdded}
          onFileRemoved={handleFileRemoved}
          files={mediaFiles}
          disabled={isUploading || submitting}
          enableCamera={true}
          enableVideoRecording={true}
          aria-labelledby="media-label"
        />

        {isUploading && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">📤 Uploading media...</p>
          </div>
        )}

        {hasUploadedMedia && !isUploading && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ Media uploaded. Will be deleted if review submission fails.
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Verified Purchase Badge */}
      {orderId && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <ImageIcon className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700 font-medium">
            Verified Purchase
          </span>
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || rating === 0 || !comment.trim()}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
