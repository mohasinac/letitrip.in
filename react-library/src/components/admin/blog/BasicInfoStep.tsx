export interface BasicInfoStepData {
  title: string;
  slug: string;
  excerpt: string;
}

export interface BasicInfoStepProps {
  formData: BasicInfoStepData;
  onChange: (field: keyof BasicInfoStepData, value: string) => void;
  errors?: Record<string, string>;
  FormInputComponent?: React.ComponentType<{
    label: string;
    required?: boolean;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
  }>;
  FormTextareaComponent?: React.ComponentType<{
    label: string;
    required?: boolean;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
    placeholder?: string;
    error?: string;
  }>;
  urlPrefix?: string;
  title?: string;
  description?: string;
}

/**
 * Pure React basic info step for blog wizard
 * Framework-independent form step with title, slug, and excerpt fields
 */
export function BasicInfoStep({
  formData,
  onChange,
  errors = {},
  FormInputComponent,
  FormTextareaComponent,
  urlPrefix = "/blog/",
  title = "Basic Information",
  description = "Enter the title, slug, and excerpt for your blog post",
}: BasicInfoStepProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    onChange(name as keyof BasicInfoStepData, value);

    // Auto-generate slug from title
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      onChange("slug", slug);
    }
  };

  if (!FormInputComponent || !FormTextareaComponent) {
    return (
      <div className="space-y-6">
        <div className="text-red-600">
          Error: FormInputComponent and FormTextareaComponent are required
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{description}</p>
      </div>

      <FormInputComponent
        label="Title"
        required
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Enter post title"
        error={errors.title}
      />

      <FormInputComponent
        label="Slug"
        required
        name="slug"
        value={formData.slug}
        onChange={handleInputChange}
        placeholder="post-slug"
        error={errors.slug}
        helperText={`URL: ${urlPrefix}${formData.slug || "post-slug"}`}
      />

      <FormTextareaComponent
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
