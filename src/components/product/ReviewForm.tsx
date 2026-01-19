"use client";

import MediaUploader from "@/components/media/MediaUploader";
import { reviewsService } from "@/services/reviews.service";
import { MediaFile } from "@/types/media";
import {
  FormInput,
  FormLabel,
  FormTextarea,
  ReviewForm as LibraryReviewForm,
  logError,
} from "@letitrip/react-library";
import { Image as ImageIcon, Star } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Simple media upload handlers
  const uploadMultipleMedia = useCallback(
    async (files: File[], _context: string, _contextId: string) => {
      setIsUploading(true);
      try {
        const urls: string[] = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("context", "review");

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Upload failed");

          const data = await response.json();
          urls.push(data.url);
        }
        setUploadedUrls((prev) => [...prev, ...urls]);
        return urls;
      } catch (err) {
        setError(`Upload failed: ${err}`);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  const clearTracking = useCallback(() => {
    setUploadedUrls([]);
  }, []);

  const cleanupUploadedMedia = useCallback(async () => {
    setUploadedUrls([]);
  }, []);

  const getUploadedUrls = useCallback(() => uploadedUrls, [uploadedUrls]);

  const hasUploadedMedia = uploadedUrls.length > 0;

  const handleSubmit = async (data: {
    rating: number;
    title: string;
    comment: string;
    images: string[];
  }) => {
    setSubmitting(true);
    setError("");

    try {
      await reviewsService.create({
        productId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
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

  // Custom MediaUploader wrapper component
  const MediaUploaderWrapper = (props: any) => {
    const handleFilesAdded = async (files: MediaFile[]) => {
      props.onFilesAdded(files);
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

    return (
      <>
        <MediaUploader {...props} onFilesAdded={handleFilesAdded} />
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
      </>
    );
  };

  return (
    <LibraryReviewForm
      productId={productId}
      orderId={orderId}
      onSubmit={handleSubmit}
      onCancel={handleCancelClick}
      submitting={submitting || isUploading}
      error={error}
      FormInputComponent={FormInput}
      FormTextareaComponent={FormTextarea}
      FormLabelComponent={FormLabel}
      MediaUploaderComponent={MediaUploaderWrapper}
      icons={{
        star: Star,
        verifiedPurchase: ImageIcon,
      }}
    />
  );
}
