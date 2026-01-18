
import { ReactNode, useState } from "react";

interface AuctionFormData {
  shopId: string;
  name: string;
  slug: string;
  description: string;
  startingBid: number;
  reservePrice: number;
  startTime: Date;
  endTime: Date;
  status: string;
  images: string[];
  videos?: string[];
}

export interface AuctionFormProps {
  mode: "create" | "edit";
  initialData?: Partial<AuctionFormData>;
  shopId?: string;
  onSubmit: (data: AuctionFormData) => void;
  isSubmitting?: boolean;
  className?: string;
  // Callback injections
  onValidateSlug?: (
    slug: string,
    shopId: string,
  ) => Promise<{ available: boolean }>;
  onCancel?: () => void;
  // Notification callbacks
  onValidationError?: (message: string) => void;
  onSlugError?: (error: string) => void;
  onSlugSuccess?: () => void;
  // Injected components
  CardComponent?: React.ComponentType<{ title: string; children: ReactNode }>;
  FormFieldComponent?: React.ComponentType<{
    label: string;
    required?: boolean;
    hint?: string;
    children: ReactNode;
  }>;
  FormInputComponent?: React.ComponentType<any>;
  FormTextareaComponent?: React.ComponentType<any>;
  FormSelectComponent?: React.ComponentType<any>;
  FormLabelComponent?: React.ComponentType<{
    htmlFor?: string;
    required?: boolean;
    children: ReactNode;
  }>;
  SlugInputComponent?: React.ComponentType<any>;
  RichTextEditorComponent?: React.ComponentType<any>;
  DateTimePickerComponent?: React.ComponentType<any>;
  FormCurrencyInputComponent?: React.ComponentType<any>;
  FormActionsComponent?: React.ComponentType<any>;
  // Status options
  statusOptions?: Array<{ value: string; label: string }>;
}

/**
 * AuctionForm Component
 *
 * Pure React component for creating and editing auction listings.
 * Framework-independent implementation with callback injection pattern.
 *
 * Features:
 * - Auction creation and editing forms
 * - Real-time slug validation
 * - Rich text description editor
 * - Date/time pickers for auction scheduling
 * - Currency inputs for bidding amounts
 * - Status management
 * - Image and video URL handling
 * - Form validation
 *
 * @example
 * ```tsx
 * <AuctionForm
 *   mode="create"
 *   shopId="shop123"
 *   onSubmit={handleSubmit}
 *   onValidateSlug={handleValidateSlug}
 *   CardComponent={Card}
 *   FormFieldComponent={FormField}
 *   onValidationError={(msg) => toast.error(msg)}
 * />
 * ```
 */
export function AuctionForm({
  mode,
  initialData,
  shopId,
  onSubmit,
  isSubmitting = false,
  className = "",
  onValidateSlug,
  onCancel,
  onValidationError,
  onSlugError,
  onSlugSuccess,
  CardComponent,
  FormFieldComponent,
  FormInputComponent,
  FormTextareaComponent,
  FormSelectComponent,
  FormLabelComponent,
  SlugInputComponent,
  RichTextEditorComponent,
  DateTimePickerComponent,
  FormCurrencyInputComponent,
  FormActionsComponent,
  statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "scheduled", label: "Scheduled" },
    { value: "active", label: "Active" },
    { value: "ended", label: "Ended" },
    { value: "cancelled", label: "Cancelled" },
  ],
}: AuctionFormProps) {
  const [formData, setFormData] = useState<AuctionFormData>({
    shopId: initialData?.shopId || shopId || "",
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    startingBid: initialData?.startingBid || 0,
    reservePrice: initialData?.reservePrice || 0,
    startTime: initialData?.startTime || new Date(),
    endTime:
      initialData?.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: initialData?.status || "draft",
    images: initialData?.images || [],
    videos: initialData?.videos || [],
  });

  const [slugError, setSlugError] = useState("");
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);

  // Default components (fallbacks if not injected)
  const Card =
    CardComponent ||
    (({ title, children }: { title: string; children: ReactNode }) => (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {children}
      </div>
    ));

  const FormField =
    FormFieldComponent ||
    (({ label, required, hint, children }: any) => (
      <div className="space-y-1">
        <label
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${
            required
              ? "after:content-['*'] after:ml-0.5 after:text-red-500"
              : ""
          }`}
        >
          {label}
        </label>
        {children}
        {hint && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    ));

  const FormLabel =
    FormLabelComponent ||
    (({ htmlFor, required, children }: any) => (
      <label
        htmlFor={htmlFor}
        className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${
          required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
        }`}
      >
        {children}
      </label>
    ));

  // Validate slug uniqueness
  const validateSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugError("");
      onSlugSuccess?.();
      return;
    }

    // Only validate in create mode or if slug changed in edit mode
    if (mode === "edit" && slug === initialData?.slug) {
      setSlugError("");
      onSlugSuccess?.();
      return;
    }

    if (!onValidateSlug) {
      return;
    }

    setIsValidatingSlug(true);
    setSlugError("");

    try {
      const data = await onValidateSlug(slug, formData.shopId);

      if (!data.available) {
        const errorMsg = "This URL is already taken";
        setSlugError(errorMsg);
        onSlugError?.(errorMsg);
      } else {
        onSlugSuccess?.();
      }
    } catch (error: any) {
      const errorMsg = "Error checking URL availability";
      setSlugError(errorMsg);
      onSlugError?.(errorMsg);
    } finally {
      setIsValidatingSlug(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (slugError) {
      onValidationError?.("Please fix the errors before submitting");
      return;
    }

    if (!formData.shopId) {
      onValidationError?.("Please select a shop");
      return;
    }

    if (!formData.name || !formData.slug) {
      onValidationError?.("Please fill in all required fields");
      return;
    }

    if (formData.startingBid <= 0) {
      onValidationError?.("Starting bid must be greater than 0");
      return;
    }

    if (formData.reservePrice && formData.reservePrice < formData.startingBid) {
      onValidationError?.(
        "Reserve price must be greater than or equal to starting bid",
      );
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      onValidationError?.("End time must be after start time");
      return;
    }

    // Clean images before submit
    const cleanedImages = (formData.images || [])
      .map((s) => s.trim())
      .filter(Boolean);

    // Always prefer shopId prop over initialData.shopId
    onSubmit({
      ...formData,
      shopId: shopId || formData.shopId,
      images: cleanedImages,
    });
  };

  const handleChange = (field: keyof AuctionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getStatusHint = (status: string) => {
    switch (status) {
      case "draft":
        return "Draft auctions are not visible to buyers";
      case "scheduled":
        return "Auction will go live at the scheduled start time";
      case "active":
        return "Auction is currently accepting bids";
      case "ended":
        return "Auction has ended";
      case "cancelled":
        return "Auction has been cancelled";
      default:
        return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <Card title="Basic Information">
        <div className="space-y-4">
          <FormField label="Auction Name" required>
            {FormInputComponent ? (
              <FormInputComponent
                value={formData.name}
                onChange={(e: any) => handleChange("name", e.target.value)}
                placeholder="e.g., Vintage Watch Collection"
                disabled={isSubmitting}
              />
            ) : (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Vintage Watch Collection"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </FormField>

          <div>
            <FormLabel htmlFor="auction-slug" required>
              Auction URL
            </FormLabel>
            {SlugInputComponent ? (
              <SlugInputComponent
                id="auction-slug"
                sourceText={formData.name}
                value={formData.slug}
                onChange={(slug: string) => {
                  handleChange("slug", slug);
                  validateSlug(slug);
                }}
                error={slugError}
                disabled={isSubmitting}
                showPreview={true}
                allowManualEdit={true}
                baseUrl="https://letitrip.in/auctions"
              />
            ) : (
              <input
                id="auction-slug"
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  handleChange("slug", e.target.value);
                  validateSlug(e.target.value);
                }}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {slugError && (
              <p className="mt-1 text-xs text-red-600">{slugError}</p>
            )}
            {isValidatingSlug && (
              <p className="mt-1 text-xs text-gray-500">
                Checking availability...
              </p>
            )}
          </div>

          <div>
            <FormLabel htmlFor="auction-description" required>
              Description
            </FormLabel>
            {RichTextEditorComponent ? (
              <RichTextEditorComponent
                id="auction-description"
                value={formData.description}
                onChange={(value: string) => handleChange("description", value)}
                placeholder="Describe the auction item in detail..."
              />
            ) : (
              <textarea
                id="auction-description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the auction item in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Bidding Details */}
      <Card title="Bidding Details">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Starting Bid" required>
            {FormCurrencyInputComponent ? (
              <FormCurrencyInputComponent
                value={formData.startingBid}
                currency="INR"
                onChange={(value: number) =>
                  handleChange("startingBid", value || 0)
                }
                min={1}
                autoFormat={true}
                disabled={isSubmitting}
              />
            ) : (
              <input
                type="number"
                value={formData.startingBid}
                onChange={(e) =>
                  handleChange("startingBid", parseFloat(e.target.value) || 0)
                }
                min={1}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </FormField>

          <FormField
            label="Reserve Price"
            hint="Minimum price for the item to be sold (optional)"
          >
            {FormCurrencyInputComponent ? (
              <FormCurrencyInputComponent
                value={formData.reservePrice}
                currency="INR"
                onChange={(value: number) =>
                  handleChange("reservePrice", value || 0)
                }
                min={0}
                autoFormat={true}
                disabled={isSubmitting}
              />
            ) : (
              <input
                type="number"
                value={formData.reservePrice}
                onChange={(e) =>
                  handleChange("reservePrice", parseFloat(e.target.value) || 0)
                }
                min={0}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </FormField>
        </div>
      </Card>

      {/* Timing */}
      <Card title="Auction Timing">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="auction-start-time" required>
              Start Time
            </FormLabel>
            {DateTimePickerComponent ? (
              <DateTimePickerComponent
                id="auction-start-time"
                value={formData.startTime}
                onChange={(date: Date) => handleChange("startTime", date)}
                minDate={new Date()}
              />
            ) : (
              <input
                id="auction-start-time"
                type="datetime-local"
                value={formData.startTime.toISOString().slice(0, 16)}
                onChange={(e) =>
                  handleChange("startTime", new Date(e.target.value))
                }
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <div>
            <FormLabel htmlFor="auction-end-time" required>
              End Time
            </FormLabel>
            {DateTimePickerComponent ? (
              <DateTimePickerComponent
                id="auction-end-time"
                value={formData.endTime}
                onChange={(date: Date) => handleChange("endTime", date)}
                minDate={new Date(formData.startTime)}
              />
            ) : (
              <input
                id="auction-end-time"
                type="datetime-local"
                value={formData.endTime.toISOString().slice(0, 16)}
                onChange={(e) =>
                  handleChange("endTime", new Date(e.target.value))
                }
                min={formData.startTime.toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>
      </Card>

      {/* Media */}
      <Card title="Media">
        <div className="space-y-4">
          <FormField
            label="Images (URLs, comma-separated)"
            hint="Enter image URLs separated by commas (max 10)"
          >
            {FormTextareaComponent ? (
              <FormTextareaComponent
                value={formData.images.join(", ")}
                onChange={(e: any) =>
                  handleChange(
                    "images",
                    e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  )
                }
                rows={3}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                disabled={isSubmitting}
              />
            ) : (
              <textarea
                value={formData.images.join(", ")}
                onChange={(e) =>
                  handleChange(
                    "images",
                    e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  )
                }
                rows={3}
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </FormField>

          <FormField
            label="Videos (URLs, comma-separated)"
            hint="Enter video URLs separated by commas (optional, max 3)"
          >
            {FormTextareaComponent ? (
              <FormTextareaComponent
                value={(formData.videos || []).join(", ")}
                onChange={(e: any) =>
                  handleChange(
                    "videos",
                    e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  )
                }
                rows={2}
                placeholder="https://example.com/video1.mp4"
                disabled={isSubmitting}
              />
            ) : (
              <textarea
                value={(formData.videos || []).join(", ")}
                onChange={(e) =>
                  handleChange(
                    "videos",
                    e.target.value
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                  )
                }
                rows={2}
                placeholder="https://example.com/video1.mp4"
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </FormField>
        </div>
      </Card>

      {/* Status */}
      <Card title="Status">
        <FormField label="Auction Status" hint={getStatusHint(formData.status)}>
          {FormSelectComponent ? (
            <FormSelectComponent
              value={formData.status}
              onChange={(e: any) => handleChange("status", e.target.value)}
              options={statusOptions}
              disabled={isSubmitting}
            />
          ) : (
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </Card>

      {/* Submit Buttons */}
      {FormActionsComponent ? (
        <FormActionsComponent
          onCancel={onCancel}
          onSubmit={handleSubmit}
          submitLabel={mode === "edit" ? "Save Changes" : "Create Auction"}
          isSubmitting={isSubmitting}
          submitDisabled={!!slugError || isValidatingSlug}
          cancelDisabled={isSubmitting}
        />
      ) : (
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!!slugError || isValidatingSlug || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {mode === "edit" ? "Save Changes" : "Create Auction"}
          </button>
        </div>
      )}
    </form>
  );
}

export default AuctionForm;

