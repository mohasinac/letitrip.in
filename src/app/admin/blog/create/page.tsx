"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Loader2,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  PenTool,
  Tag,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { blogService } from "@/services/blog.service";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import {
  BasicInfoStep,
  MediaStep,
  ContentStep,
  CategoryTagsStep,
  type BlogFormData,
} from "@/components/admin/blog-wizard";

const STEPS = [
  {
    id: 1,
    name: "Basic Info",
    icon: FileText,
    description: "Title, slug & excerpt",
  },
  { id: 2, name: "Media", icon: ImageIcon, description: "Featured image" },
  { id: 3, name: "Content", icon: PenTool, description: "Post content" },
  { id: 4, name: "Category & Tags", icon: Tag, description: "Organization" },
];

export default function CreateBlogPostPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [],
    status: "draft",
    featured: false,
  });

  // Media upload
  const { getUploadedUrls, isUploading, uploadMedia, cleanupUploadedMedia } =
    useMediaUploadWithCleanup();
  const uploadedUrls = getUploadedUrls();

  const handleChange = (field: keyof BlogFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        featuredImage: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        featuredImage: "Image size must be less than 5MB",
      }));
      return;
    }

    try {
      await uploadMedia(file, "product"); // Use product context for blog images
      setErrors((prev) => ({ ...prev, featuredImage: "" }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        featuredImage:
          error instanceof Error ? error.message : "Failed to upload image",
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.slug.trim()) newErrors.slug = "Slug is required";
        if (!formData.excerpt.trim()) newErrors.excerpt = "Excerpt is required";
        break;
      case 3:
        if (!formData.content.trim()) newErrors.content = "Content is required";
        break;
      case 4:
        if (!formData.category.trim())
          newErrors.category = "Category is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);

      await blogService.create({
        ...formData,
        status,
        featuredImage: uploadedUrls[0],
        publishedAt: status === "published" ? new Date() : undefined,
      });

      router.push("/admin/blog");
    } catch (error) {
      console.error("Failed to create blog post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create blog post"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.content || uploadedUrls.length > 0) {
      if (
        confirm(
          "Are you sure you want to cancel? All unsaved changes will be lost."
        )
      ) {
        cleanupUploadedMedia();
        router.push("/admin/blog");
      }
    } else {
      router.push("/admin/blog");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Access Denied</p>
          <p className="text-gray-500 text-sm">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Create Blog Post
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
                        ? "border-purple-600 bg-purple-600 text-white"
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
                    className={`mx-2 h-0.5 w-16 transition-colors sm:w-24 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          {currentStep === 1 && (
            <BasicInfoStep
              formData={formData}
              onChange={handleChange}
              errors={errors}
            />
          )}

          {currentStep === 2 && (
            <MediaStep
              featuredImage={uploadedUrls[0]}
              isUploading={isUploading}
              onImageUpload={handleImageUpload}
              onImageRemove={cleanupUploadedMedia}
              error={errors.featuredImage}
            />
          )}

          {currentStep === 3 && (
            <ContentStep
              formData={formData}
              onChange={handleChange}
              error={errors.content}
            />
          )}

          {currentStep === 4 && (
            <CategoryTagsStep
              formData={formData}
              onChange={handleChange}
              error={errors.category}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={currentStep === 1 ? handleCancel : prevStep}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentStep === 1 ? "Cancel" : "Previous"}
          </button>

          <div className="flex gap-3">
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit("published")}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Publish
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
