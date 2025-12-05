import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import type { BlogFormData, OnBlogChange } from "./types";

interface BasicInfoStepProps {
  formData: BlogFormData;
  onChange: OnBlogChange;
  errors?: Record<string, string>;
}

export function BasicInfoStep({
  formData,
  onChange,
  errors = {},
}: BasicInfoStepProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    onChange(name as keyof BlogFormData, value);

    // Auto-generate slug from title
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      onChange("slug", slug);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter the title, slug, and excerpt for your blog post
        </p>
      </div>

      <FormInput
        label="Title"
        required
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Enter post title"
        error={errors.title}
      />

      <FormInput
        label="Slug"
        required
        name="slug"
        value={formData.slug}
        onChange={handleInputChange}
        placeholder="post-slug"
        error={errors.slug}
        helperText={`URL: /blog/${formData.slug || "post-slug"}`}
      />

      <FormTextarea
        label="Excerpt"
        required
        name="excerpt"
        value={formData.excerpt}
        onChange={handleInputChange}
        rows={3}
        placeholder="Brief description of the post (shown in listings)"
        error={errors.excerpt}
      />
    </div>
  );
}
