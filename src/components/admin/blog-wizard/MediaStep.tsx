import { FormLabel } from "@/components/forms";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Upload, X } from "lucide-react";

interface MediaStepProps {
  featuredImage?: string;
  isUploading: boolean;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: () => void;
  error?: string;
}

export function MediaStep({
  featuredImage,
  isUploading,
  onImageUpload,
  onImageRemove,
  error,
}: MediaStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Featured Image
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Add a featured image to your blog post
        </p>
      </div>

      <div>
        <FormLabel>Featured Image</FormLabel>
        {featuredImage ? (
          <div className="relative inline-block h-48">
            <OptimizedImage
              src={featuredImage}
              alt="Featured"
              width={300}
              height={192}
              className="rounded-lg border border-gray-300"
            />
            <button
              onClick={onImageRemove}
              type="button"
              className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              {isUploading ? "Uploading..." : "Click to upload image"}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PNG, JPG up to 5MB
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
