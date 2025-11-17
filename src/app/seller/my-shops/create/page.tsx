"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Store,
  Palette,
  Phone,
  FileText,
  Settings,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import SlugInput from "@/components/common/SlugInput";
import { shopsService } from "@/services/shops.service";

// Step definitions
const STEPS = [
  {
    id: 1,
    name: "Basic Info",
    icon: Store,
    description: "Shop name & description",
  },
  {
    id: 2,
    name: "Branding",
    icon: Palette,
    description: "Logo, banner & colors",
  },
  {
    id: 3,
    name: "Contact & Legal",
    icon: Phone,
    description: "Contact details & docs",
  },
  {
    id: 4,
    name: "Policies",
    icon: FileText,
    description: "Shipping & returns",
  },
  {
    id: 5,
    name: "Review & Publish",
    icon: Settings,
    description: "Review & activate",
  },
];

export default function CreateShopWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [slugError, setSlugError] = useState("");
  const [isValidatingSlug, setIsValidatingSlug] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    slug: "",
    description: "",
    category: "",

    // Step 2: Branding
    logoUrl: "",
    bannerUrl: "",
    themeColor: "#3B82F6",
    accentColor: "#10B981",

    // Step 3: Contact & Legal
    email: "",
    phone: "",
    location: "",
    address: "",
    businessRegistration: "",
    taxId: "",

    // Step 4: Policies
    shippingPolicy: "",
    returnPolicy: "7-days",
    termsAndConditions: "",

    // Step 5: Settings
    isActive: false,
    acceptsOrders: true,
  });

  // Validate slug format
  const validateSlug = (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugError("");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError(
        "Slug can only contain lowercase letters, numbers, and hyphens"
      );
    } else {
      setSlugError("");
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim() || formData.name.length < 3) {
          setError("Shop name must be at least 3 characters");
          return false;
        }
        if (!formData.slug.trim()) {
          setError("URL slug is required");
          return false;
        }
        if (slugError) {
          setError("Please fix the URL error");
          return false;
        }
        if (!formData.description.trim() || formData.description.length < 20) {
          setError("Description must be at least 20 characters");
          return false;
        }
        break;
      case 3:
        if (!formData.email.trim()) {
          setError("Email is required");
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError("Invalid email format");
          return false;
        }
        if (!formData.phone.trim()) {
          setError("Phone number is required");
          return false;
        }
        if (!formData.location.trim()) {
          setError("Location is required");
          return false;
        }
        break;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setIsSubmitting(true);
      setError("");

      const shopData: any = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        address: formData.address,
        logoUrl: formData.logoUrl || undefined,
        bannerUrl: formData.bannerUrl || undefined,
        themeColor: formData.themeColor,
        businessRegistration: formData.businessRegistration || undefined,
        taxId: formData.taxId || undefined,
        shippingPolicy: formData.shippingPolicy || undefined,
        returnPolicy: formData.returnPolicy,
        termsAndConditions: formData.termsAndConditions || undefined,
        isActive: formData.isActive,
      };

      const newShop = await shopsService.create(shopData);
      router.push(`/seller/my-shops?created=true`);
    } catch (err: any) {
      console.error("Error creating shop:", err);
      setError(err.message || "Failed to create shop");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/seller/my-shops"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Shops
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Create New Shop
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Progress Bar */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      currentStep > step.id
                        ? "border-green-500 bg-green-500 text-white"
                        : currentStep === step.id
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="mt-2 hidden text-xs font-medium text-gray-700 sm:block">
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-12 transition-colors sm:w-20 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Let's start with the basics about your shop
                </p>
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g., Vintage Treasures Emporium"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Choose a unique, memorable name for your shop
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop URL <span className="text-red-500">*</span>
                </label>
                <SlugInput
                  sourceText={formData.name}
                  value={formData.slug}
                  onChange={(slug: string) => {
                    handleChange("slug", slug);
                    validateSlug(slug);
                  }}
                  prefix="shops/"
                  error={slugError}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion & Apparel</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="collectibles">Collectibles & Art</option>
                  <option value="automotive">Automotive</option>
                  <option value="other">Other</option>
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  Main category your shop focuses on
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={5}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Tell customers about your shop, what makes it unique, and what they can expect..."
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  {formData.description.length}/500 characters (min 20)
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Shop Branding
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Customize the look and feel of your shop
                </p>
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Square image recommended (200x200px or larger)
                </p>
              </div>

              {/* Logo Preview */}
              {formData.logoUrl && (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Logo Preview
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-logo.png";
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Your logo will appear here
                    </p>
                  </div>
                </div>
              )}

              {/* Banner */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Banner URL
                </label>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={(e) => handleChange("bannerUrl", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://example.com/banner.jpg"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Wide image recommended (1200x400px or larger)
                </p>
              </div>

              {/* Banner Preview */}
              {formData.bannerUrl && (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Banner Preview
                  </p>
                  <img
                    src={formData.bannerUrl}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-banner.png";
                    }}
                  />
                </div>
              )}

              {/* Theme Colors */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Theme Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.themeColor}
                      onChange={(e) =>
                        handleChange("themeColor", e.target.value)
                      }
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.themeColor}
                      onChange={(e) =>
                        handleChange("themeColor", e.target.value)
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="#3B82F6"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Main color for buttons and highlights
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) =>
                        handleChange("accentColor", e.target.value)
                      }
                      className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) =>
                        handleChange("accentColor", e.target.value)
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="#10B981"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Secondary color for accents
                  </p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Color Preview
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    style={{ backgroundColor: formData.themeColor }}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                  >
                    Primary Button
                  </button>
                  <button
                    type="button"
                    style={{ backgroundColor: formData.accentColor }}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Legal */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact & Legal Information
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  How customers can reach you and legal details
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="shop@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Mumbai, Maharashtra"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  City and state where your shop operates
                </p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Street address, building, area..."
                />
              </div>

              {/* Legal Details */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">
                  Legal Documents (Optional but Recommended)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Business Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.businessRegistration}
                      onChange={(e) =>
                        handleChange("businessRegistration", e.target.value)
                      }
                      className="block w-full rounded-lg border border-blue-300 bg-white px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="e.g., CIN, LLPIN, PAN"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      GST/Tax ID
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => handleChange("taxId", e.target.value)}
                      className="block w-full rounded-lg border border-blue-300 bg-white px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="GSTIN"
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-blue-800">
                  Providing legal documents helps build trust and may be
                  required for verification
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Policies */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Shop Policies
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Set clear policies for shipping, returns, and terms
                </p>
              </div>

              {/* Shipping Policy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Policy
                </label>
                <textarea
                  value={formData.shippingPolicy}
                  onChange={(e) =>
                    handleChange("shippingPolicy", e.target.value)
                  }
                  rows={4}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe your shipping methods, delivery times, charges, and coverage areas..."
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Explain how you ship products and estimated delivery times
                </p>
              </div>

              {/* Return Policy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Policy
                </label>
                <select
                  value={formData.returnPolicy}
                  onChange={(e) => handleChange("returnPolicy", e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="no-returns">No Returns</option>
                  <option value="7-days">7 Days Return</option>
                  <option value="14-days">14 Days Return</option>
                  <option value="30-days">30 Days Return</option>
                  <option value="custom">Custom Policy</option>
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  Choose a return window or define custom terms
                </p>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  value={formData.termsAndConditions}
                  onChange={(e) =>
                    handleChange("termsAndConditions", e.target.value)
                  }
                  rows={6}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Enter your shop's terms and conditions, including payment terms, warranties, and customer obligations..."
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Legal terms customers agree to when purchasing from your shop
                </p>
              </div>

              {/* Policy Tips */}
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <h3 className="text-sm font-medium text-green-900 mb-2">
                  💡 Policy Tips
                </h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Be clear and specific about shipping times</li>
                  <li>• Explain who pays for return shipping</li>
                  <li>
                    • State conditions for returns (e.g., unopened, with tags)
                  </li>
                  <li>• Include your refund processing time</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 5: Review & Publish */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Review & Publish
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Review your shop details and choose publishing options
                </p>
              </div>

              {/* Shop Summary */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
                <h3 className="font-medium text-gray-900">Shop Summary</h3>

                <div className="grid gap-4 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-gray-600">Shop Name:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.name || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">URL:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      /shops/{formData.slug || "your-shop"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.email || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.location || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Return Policy:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {formData.returnPolicy
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </p>
                  </div>
                </div>

                {formData.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="text-sm text-gray-700 mt-1">
                      {formData.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Publishing Options */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleChange("isActive", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm">
                    <span className="font-medium text-gray-900">
                      Activate shop immediately
                    </span>
                    <p className="text-gray-600">
                      Make your shop visible to customers right away
                    </p>
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="acceptsOrders"
                    checked={formData.acceptsOrders}
                    onChange={(e) =>
                      handleChange("acceptsOrders", e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="acceptsOrders" className="text-sm">
                    <span className="font-medium text-gray-900">
                      Accept orders
                    </span>
                    <p className="text-gray-600">
                      Allow customers to place orders from your shop
                    </p>
                  </label>
                </div>
              </div>

              {/* Next Steps */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  📝 After Creating Your Shop
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Add products to your shop catalog</li>
                  <li>• Set up payment methods</li>
                  <li>• Configure shipping options</li>
                  <li>• Submit for shop verification (if required)</li>
                  <li>• Share your shop URL with customers</li>
                </ul>
              </div>

              {/* Warning */}
              {!formData.isActive && (
                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Your shop will be created as inactive. You can activate
                    it later from your shop settings.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>{" "}
          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isValidatingSlug}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating Shop..." : "Create Shop"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
