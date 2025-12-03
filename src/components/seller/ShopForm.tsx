"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import SlugInput from "@/components/common/SlugInput";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useShopSlugValidation } from "@/lib/validation/slug";
import type { ShopFE } from "@/types/frontend/shop.types";
import { Card, Button, FormActions } from "@/components/ui";
import { FormField, FormInput, FormLabel } from "@/components/forms";

interface ShopFormProps {
  shop?: ShopFE;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
  mode: "create" | "edit";
}

export default function ShopForm({
  shop,
  onSubmit,
  isSubmitting,
  mode,
}: ShopFormProps) {
  const [name, setName] = useState(shop?.name || "");
  const [slug, setSlug] = useState(shop?.slug || "");
  const [description, setDescription] = useState(shop?.description || "");
  const [location, setLocation] = useState(shop?.address || "");
  const [phone, setPhone] = useState(shop?.phone || "");
  const [email, setEmail] = useState(shop?.email || "");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const slugValidation = useShopSlugValidation(slug, shop?.id);

  useEffect(() => {
    if (mode === "create" && name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [name, slug, mode]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Shop name is required";
    else if (name.length < 3)
      newErrors.name = "Shop name must be at least 3 characters";
    if (!slug.trim()) newErrors.slug = "Shop slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug))
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    else if (slugValidation.available === false)
      newErrors.slug = "This slug is already taken";
    if (!description.trim())
      newErrors.description = "Shop description is required";
    else if (description.length < 50)
      newErrors.description = "Description must be at least 50 characters";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email address";
    if (phone && !/^[0-9]{10}$/.test(phone.replace(/\s/g, "")))
      newErrors.phone = "Phone number must be 10 digits";
    if (website && !/^https?:\/\/.+/.test(website))
      newErrors.website = "Website must be a valid URL";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data: any = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      address: location.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              id="shop-slug"
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
              {slugValidation.checking && (
                <span className="text-gray-500">Checking availability…</span>
              )}
              {!slugValidation.checking && slug && slugValidation.available && (
                <span className="text-green-600">✓ Slug is available</span>
              )}
              {!slugValidation.checking &&
                slug &&
                slugValidation.available === false && (
                  <span className="text-red-600">✗ Slug is already taken</span>
                )}
            </div>
          </div>

          <div>
            <FormLabel htmlFor="shop-description" required>
              Shop Description
            </FormLabel>
            <RichTextEditor
              id="shop-description"
              value={description}
              onChange={setDescription}
              placeholder="Describe your shop..."
              minHeight={200}
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
              <FormInput
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          <FormField label="Location">
            <FormInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
        submitDisabled={
          slugValidation.checking || slugValidation.available === false
        }
        position="space-between"
        additionalActions={
          <Button
            type="button"
            variant="ghost"
            leftIcon={<Save className="w-5 h-5" />}
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
}
