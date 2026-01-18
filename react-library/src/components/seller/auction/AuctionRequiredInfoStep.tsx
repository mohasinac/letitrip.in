/**
 * AuctionRequiredInfoStep Component
 * Framework-agnostic auction required info form step
 *
 * Features:
 * - Auction title input with validation
 * - URL slug generation and validation
 * - Category selector with creation
 * - Shop selector
 * - Auction type selection (button grid)
 * - Item condition dropdown
 * - Image upload with preview and removal
 * - Progress tracking for uploads
 * - Primary image indication
 *
 * @param ImageComponent - Component for rendering images (Next.js Image or standard img)
 * @param FormInputComponent - Input component for text fields
 * @param FormSelectComponent - Select component for dropdowns
 * @param FormLabelComponent - Label component for form fields
 * @param SlugInputComponent - Specialized slug input with validation
 * @param CategorySelectorComponent - Category selection with creation
 * @param ShopSelectorComponent - Shop selection component
 */

import { ComponentType } from "react";

export interface AuctionRequiredInfoFormData {
  title: string;
  slug: string;
  categoryId: string;
  shopId: string;
  auctionType: string;
  condition: string;
  images: string[];
}

export interface AuctionTypeOption {
  value: string;
  label: string;
  description: string;
}

export interface AuctionRequiredInfoStepProps {
  formData: AuctionRequiredInfoFormData;
  onChange: (field: string, value: any) => void;
  categories: Array<{ id: string; name: string; parentId?: string }>;
  auctionTypes: AuctionTypeOption[];
  slugError?: string;
  onSlugValidation?: (slug: string) => void;
  uploadingImages?: boolean;
  uploadProgress?: Record<string, number>;
  onImageUpload?: (files: File[]) => Promise<void>;
  onImageRemove?: (index: number) => void;
  errors?: Record<string, string>;

  // Component injections
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    unoptimized?: boolean;
  }>;
  FormInputComponent: ComponentType<{
    id: string;
    label: string;
    required?: boolean;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    placeholder?: string;
    helperText?: string;
  }>;
  FormSelectComponent: ComponentType<{
    id: string;
    label: string;
    required?: boolean;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
  }>;
  FormLabelComponent: ComponentType<{
    children: React.ReactNode;
    required?: boolean;
  }>;
  SlugInputComponent: ComponentType<{
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    sourceText: string;
    error?: string;
    disabled?: boolean;
    showPreview?: boolean;
    allowManualEdit?: boolean;
    baseUrl?: string;
    onValidation?: (slug: string) => void;
  }>;
  CategorySelectorComponent: ComponentType<{
    value: string;
    onChange: (value: string) => void;
    categories: Array<{ id: string; name: string; parentId?: string }>;
  }>;
  ShopSelectorComponent: ComponentType<{
    value: string;
    onChange: (value: string) => void;
  }>;
}

export function AuctionRequiredInfoStep({
  formData,
  onChange,
  categories,
  auctionTypes,
  slugError,
  onSlugValidation,
  uploadingImages = false,
  uploadProgress = {},
  onImageUpload,
  onImageRemove,
  ImageComponent,
  FormInputComponent,
  FormSelectComponent,
  FormLabelComponent,
  SlugInputComponent,
  CategorySelectorComponent,
  ShopSelectorComponent,
}: AuctionRequiredInfoStepProps) {
  // Validate required component injections
  if (!ImageComponent) {
    throw new Error("ImageComponent is required for AuctionRequiredInfoStep");
  }
  if (!FormInputComponent) {
    throw new Error(
      "FormInputComponent is required for AuctionRequiredInfoStep",
    );
  }
  if (!FormSelectComponent) {
    throw new Error(
      "FormSelectComponent is required for AuctionRequiredInfoStep",
    );
  }
  if (!FormLabelComponent) {
    throw new Error(
      "FormLabelComponent is required for AuctionRequiredInfoStep",
    );
  }
  if (!SlugInputComponent) {
    throw new Error(
      "SlugInputComponent is required for AuctionRequiredInfoStep",
    );
  }
  if (!CategorySelectorComponent) {
    throw new Error(
      "CategorySelectorComponent is required for AuctionRequiredInfoStep",
    );
  }
  if (!ShopSelectorComponent) {
    throw new Error(
      "ShopSelectorComponent is required for AuctionRequiredInfoStep",
    );
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && onImageUpload) {
      onImageUpload(files);
    }
    // Clear input
    event.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Auction Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter the essential details for your auction
        </p>
      </div>

      {/* Title */}
      <FormInputComponent
        id="auction-title"
        label="Auction Title"
        required
        value={formData.title}
        onChange={(e) => onChange("title", e.target.value)}
        placeholder="e.g., Vintage Rolex Watch - Limited Edition"
        helperText="Choose a clear, descriptive title that buyers will search for"
      />

      {/* Slug */}
      <div>
        <FormLabelComponent required>Auction URL</FormLabelComponent>
        <SlugInputComponent
          value={formData.slug}
          onChange={(e) => onChange("slug", e.target.value)}
          sourceText={formData.title}
          error={slugError}
          showPreview
          allowManualEdit
          baseUrl="letitrip.in/auctions/"
          onValidation={onSlugValidation}
        />
      </div>

      {/* Category */}
      <div>
        <FormLabelComponent required>Category</FormLabelComponent>
        <CategorySelectorComponent
          value={formData.categoryId}
          onChange={(value) => onChange("categoryId", value)}
          categories={categories}
        />
      </div>

      {/* Shop */}
      <div>
        <FormLabelComponent required>Shop</FormLabelComponent>
        <ShopSelectorComponent
          value={formData.shopId}
          onChange={(value) => onChange("shopId", value)}
        />
      </div>

      {/* Auction Type */}
      <div>
        <FormLabelComponent required>Auction Type</FormLabelComponent>
        <div className="grid gap-3 sm:grid-cols-3">
          {auctionTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange("auctionType", type.value)}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                formData.auctionType === type.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                {type.label}
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <FormSelectComponent
        id="auction-condition"
        label="Item Condition"
        required
        value={formData.condition}
        onChange={(e) => onChange("condition", e.target.value)}
        options={[
          { value: "new", label: "New" },
          { value: "like-new", label: "Like New" },
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "fair", label: "Fair" },
          { value: "for-parts", label: "For Parts/Not Working" },
        ]}
      />

      {/* Image Upload */}
      <div>
        <FormLabelComponent required>
          Auction Images (at least 1)
        </FormLabelComponent>
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload high-quality images of your auction item
          </p>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploadingImages}
            className="hidden"
            id="auction-images-upload"
          />

          <label
            htmlFor="auction-images-upload"
            className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
              uploadingImages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploadingImages ? "Uploading..." : "Choose Images"}
          </label>

          {uploadingImages && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([key, progress]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                    {key}
                  </span>
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                    {Math.round(progress)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Images */}
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={url} className="relative group">
                  <ImageComponent
                    src={url}
                    alt={`Auction ${index + 1}`}
                    width={96}
                    height={96}
                    className="w-full h-24 object-cover rounded-lg"
                    unoptimized
                  />
                  {onImageRemove && (
                    <button
                      type="button"
                      onClick={() => onImageRemove(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
