
import { ComponentType, ReactNode, useState } from "react";

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
}

export interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSubmit: (data: {
    rating: number;
    title: string;
    comment: string;
    images: string[];
  }) => Promise<void>;
  onCancel?: () => void;
  submitting: boolean;
  error?: string;
  FormInputComponent: ComponentType<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    maxLength?: number;
  }>;
  FormTextareaComponent: ComponentType<{
    id: string;
    label: string;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    maxLength?: number;
  }>;
  FormLabelComponent: ComponentType<{
    id: string;
    required?: boolean;
    children: ReactNode;
  }>;
  MediaUploaderComponent: ComponentType<{
    accept: "all" | "image" | "video";
    maxFiles: number;
    multiple: boolean;
    resourceType: string;
    onFilesAdded: (files: MediaFile[]) => void;
    onFileRemoved: (id: string) => void;
    files: MediaFile[];
    disabled: boolean;
    enableCamera?: boolean;
    enableVideoRecording?: boolean;
    "aria-labelledby"?: string;
  }>;
  icons?: {
    star?: ComponentType<{ className?: string }>;
    verifiedPurchase?: ComponentType<{ className?: string }>;
  };
}

export function ReviewForm({
  productId,
  orderId,
  onSubmit,
  onCancel,
  submitting,
  error,
  FormInputComponent,
  FormTextareaComponent,
  FormLabelComponent,
  MediaUploaderComponent,
  icons = {},
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const StarIcon =
    icons.star ||
    (() => (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  const VerifiedIcon =
    icons.verifiedPurchase ||
    (() => (
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    ));

  const handleFilesAdded = async (files: MediaFile[]) => {
    setMediaFiles([...mediaFiles, ...files]);
  };

  const handleFileRemoved = (id: string) => {
    setMediaFiles(mediaFiles.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      return;
    }

    if (!comment.trim()) {
      return;
    }

    await onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
      images: [], // Will be provided by wrapper
    });
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 1) return "Poor";
    if (rating === 2) return "Fair";
    if (rating === 3) return "Good";
    if (rating === 4) return "Very Good";
    if (rating === 5) return "Excellent";
    return "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <FormLabelComponent id="rating-label" required>
          Your Rating
        </FormLabelComponent>
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
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <StarIcon
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
              {getRatingLabel(rating)}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <FormInputComponent
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
        <FormTextareaComponent
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
        <FormLabelComponent id="media-label">
          Add Photos/Videos (Optional)
        </FormLabelComponent>
        <p className="text-xs text-gray-500 mb-3">
          Upload up to 5 photos or videos to help others see your experience.
          You can also use your camera!
        </p>

        <MediaUploaderComponent
          accept="all"
          maxFiles={5}
          multiple={true}
          resourceType="product"
          onFilesAdded={handleFilesAdded}
          onFileRemoved={handleFileRemoved}
          files={mediaFiles}
          disabled={submitting}
          enableCamera={true}
          enableVideoRecording={true}
          aria-labelledby="media-label"
        />
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
          <VerifiedIcon className="w-5 h-5 text-green-600" />
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

