"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import SlugInput from "@/components/common/SlugInput";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useShopSlugValidation } from "@/lib/validation/slug";
import type { Shop } from "@/types";

interface ShopFormProps {
  shop?: Shop;
  onSubmit: (data: Partial<Shop>) => Promise<void>;
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
  const [location, setLocation] = useState(shop?.location || "");
  const [phone, setPhone] = useState(shop?.phone || "");
  const [email, setEmail] = useState(shop?.email || "");
  const [website, setWebsite] = useState(shop?.website || "");
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
    const data: Partial<Shop> = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      location: location.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
    };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white900 text-gray-900 focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-300" : "border-gray-300700"
              }`}
              placeholder="Enter your shop name"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shop Slug <span className="text-red-500">*</span>
            </label>
            <SlugInput
              value={slug}
              onChange={setSlug}
              sourceText={name}
              error={errors.slug}
              disabled={isSubmitting}
            />
            {/* Validation hint */}
            <div className="mt-1 text-xs">
              {slugValidation.checking && (
                <span className="text-gray-500">Checking availability…</span>
              )}
              {!slugValidation.checking && slug && slugValidation.available && (
                <span className="text-green-600">Slug is available</span>
              )}
              {!slugValidation.checking &&
                slug &&
                slugValidation.available === false && (
                  <span className="text-red-600">Slug is already taken</span>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              URL: letitrip.in/shops/{slug || "your-slug"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
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
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white900 text-gray-900 focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-300400" : "border-gray-300700"
              }`}
              placeholder="shop@example.com"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white900 text-gray-900 focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-300400" : "border-gray-300700"
              }`}
              placeholder="9876543210"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <textarea
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300700 rounded-lg bg-white900 text-gray-900 focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="City, State"
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Website
          </label>
          <input
            type="url"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg bg-white900 text-gray-900 focus:ring-2 focus:ring-blue-500 ${
              errors.website ? "border-red-300400" : "border-gray-300700"
            }`}
            placeholder="https://yourwebsite.com"
            disabled={isSubmitting}
          />
          {errors.website && (
            <p className="text-sm text-red-600 mt-1">{errors.website}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <div>
          {mode === "create" && (
            <p className="text-sm text-gray-600">
              You'll upload logo and banner after creation
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {mode === "create" ? "Create Shop" : "Save Changes"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
