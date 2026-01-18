
import { Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card } from "../ui/Card";
import { FormActions } from "../ui/FormActions";
import { FormField } from "./FormField";
import { FormInput } from "./FormInput";
import { FormLabel } from "./FormLabel";
import { FormPhoneInput } from "./FormPhoneInput";
import { RichTextEditor } from "./RichTextEditor";
import { SlugInput } from "./SlugInput";

export interface ShopFormData {
  name: string;
  slug: string;
  description: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

export interface ShopFormProps {
  initialData?: ShopFormData;
  mode: "create" | "edit";
  isSubmitting?: boolean;
  // Callback injection for business logic
  onSubmit: (data: ShopFormData) => Promise<void>;
  onSlugCheck?: (slug: string, excludeId?: string) => Promise<boolean>;
  onSubmitSuccess?: (message: string) => void;
  onSubmitError?: (message: string) => void;
  onValidationError?: (errors: Record<string, string>) => void;
  // Component injection
  ButtonComponent?: React.ComponentType<{
    type?: "button" | "submit";
    variant?: "primary" | "secondary" | "ghost";
    leftIcon?: React.ReactNode;
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
  }>;
  className?: string;
}

/**
 * Pure React ShopForm component with callback injection pattern
 *
 * @example
 * ```tsx
 * <ShopForm
 *   mode="create"
 *   onSubmit={handleSubmit}
 *   onSlugCheck={validateSlug}
 *   onSubmitSuccess={(msg) => toast.success(msg)}
 *   onSubmitError={(msg) => toast.error(msg)}
 *   ButtonComponent={MyButton}
 * />
 * ```
 */
export const ShopForm: React.FC<ShopFormProps> = ({
  initialData,
  mode,
  isSubmitting = false,
  onSubmit,
  onSlugCheck,
  onSubmitSuccess,
  onSubmitError,
  onValidationError,
  ButtonComponent,
  className = "",
}) => {
  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [address, setAddress] = useState(initialData?.address || "");
  const [phone, setPhone] = useState(
    initialData?.phone?.replace(/^\+\d+\s*/, "") || "",
  );
  const [phoneCountryCode, setPhoneCountryCode] = useState(
    initialData?.phone?.match(/^(\+\d+)/)?.[1] || "+91",
  );
  const [email, setEmail] = useState(initialData?.email || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Slug validation state
  const [slugValidating, setSlugValidating] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Auto-generate slug from name for create mode
  useEffect(() => {
    if (mode === "create" && name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [name, slug, mode]);

  // Validate slug availability
  useEffect(() => {
    const validateSlugAvailability = async () => {
      if (!slug.trim() || !onSlugCheck) return;

      setSlugValidating(true);
      try {
        const available = await onSlugCheck(
          slug,
          mode === "edit" ? initialData?.slug : undefined,
        );
        setSlugAvailable(available);
      } catch (error) {
        setSlugAvailable(null);
      } finally {
        setSlugValidating(false);
      }
    };

    const timeoutId = setTimeout(validateSlugAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [slug, onSlugCheck, mode, initialData?.slug]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Shop name is required";
    } else if (name.length < 3) {
      newErrors.name = "Shop name must be at least 3 characters";
    }

    if (!slug.trim()) {
      newErrors.slug = "Shop slug is required";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    } else if (slugAvailable === false) {
      newErrors.slug = "This slug is already taken";
    }

    if (!description.trim()) {
      newErrors.description = "Shop description is required";
    } else if (description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (website && !/^https?:\/\/.+/.test(website)) {
      newErrors.website = "Website must be a valid URL";
    }

    setErrors(newErrors);
    onValidationError?.(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const formData: ShopFormData = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      address: address.trim() || undefined,
      phone: phone.trim() ? `${phoneCountryCode} ${phone.trim()}` : undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
    };

    try {
      await onSubmit(formData);
      onSubmitSuccess?.(
        mode === "create"
          ? "Shop created successfully!"
          : "Shop updated successfully!",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      onSubmitError?.(message);
    }
  };

  const DefaultButton = ({
    type,
    variant,
    leftIcon,
    children,
    disabled,
    onClick,
  }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium ${
        variant === "ghost"
          ? "text-gray-700 hover:bg-gray-50"
          : variant === "secondary"
          ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
          : "bg-blue-600 text-white hover:bg-blue-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex items-center gap-2">
        {leftIcon}
        {children}
      </div>
    </button>
  );

  const Button = ButtonComponent || DefaultButton;

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <Card title="Basic Information">
        <div className="space-y-4">
          <FormField label="Shop Name" required error={errors.name}>
            <FormInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your shop name"
              disabled={isSubmitting}
            />
          </FormField>

          <div>
            <FormLabel htmlFor="shop-slug" required>
              Shop Slug
            </FormLabel>
            <SlugInput
              value={slug}
              onChange={setSlug}
              sourceText={name}
              error={errors.slug}
              disabled={isSubmitting}
              showPreview={true}
              allowManualEdit={true}
              baseUrl="https://letitrip.in/shops"
            />
            {/* Validation hint */}
            <div className="mt-1 text-xs">
              {slugValidating && (
                <span className="text-gray-500">Checking availability…</span>
              )}
              {!slugValidating && slug && slugAvailable === true && (
                <span className="text-green-600">✓ Slug is available</span>
              )}
              {!slugValidating && slug && slugAvailable === false && (
                <span className="text-red-600">✗ Slug is already taken</span>
              )}
            </div>
          </div>

          <div>
            <FormLabel htmlFor="shop-description" required>
              Shop Description
            </FormLabel>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Describe your shop..."
              minHeight="200px"
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {description.length} characters (minimum 50)
            </p>
          </div>
        </div>
      </Card>

      <Card title="Contact Information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Email" error={errors.email}>
              <FormInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shop@example.com"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Phone" error={errors.phone}>
              <FormPhoneInput
                value={phone}
                countryCode={phoneCountryCode}
                onChange={(phone, countryCode) => {
                  setPhone(phone);
                  setPhoneCountryCode(countryCode);
                }}
                placeholder="9876543210"
                disabled={isSubmitting}
                autoFormat={true}
              />
            </FormField>
          </div>

          <FormField label="Location">
            <FormInput
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="City, State"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Website" error={errors.website}>
            <FormInput
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              disabled={isSubmitting}
            />
          </FormField>
        </div>
      </Card>

      {mode === "create" && (
        <div className="text-sm text-gray-600 text-center">
          💡 You'll be able to upload logo and banner after creating the shop
        </div>
      )}

      <FormActions
        submitLabel={mode === "create" ? "Create Shop" : "Save Changes"}
        isSubmitting={isSubmitting}
        submitDisabled={slugValidating || slugAvailable === false}
        position="space-between"
        additionalActions={
          <Button
            type="button"
            variant="ghost"
            leftIcon={<Save className="w-5 h-5" />}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Saving..."
              : mode === "create"
              ? "Create Shop"
              : "Save Changes"}
          </Button>
        }
      />
    </form>
  );
};

