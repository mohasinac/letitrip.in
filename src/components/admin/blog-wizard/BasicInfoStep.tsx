/**
 * @fileoverview React Component
 * @module src/components/admin/blog-wizard/BasicInfoStep
 * @description This file contains the BasicInfoStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import type { BlogFormData, OnBlogChange } from "./types";

/**
 * BasicInfoStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BasicInfoStepProps
 */
interface BasicInfoStepProps {
  /** Form Data */
  formData: BlogFormData;
  /** On Change */
  onChange: OnBlogChange;
  /** Errors */
  errors?: Record<string, string>;
}

/**
 * Function: Basic Info Step
 */
/**
 * Performs basic info step operation
 *
 * @param {BasicInfoStepProps} [{
  formData,
  onChange,
  errors] - The {
  form data,
  on change,
  errors
 *
 * @returns {any} The basicinfostep result
 *
 * @example
 * BasicInfoStep({
  formData,
  onChange,
  errors);
 */

/**
 * Performs basic info step operation
 *
 * @param {BasicInfoStepProps} [{
  formData,
  onChange,
  errors] - The {
  form data,
  on change,
  errors
 *
 * @returns {any} The basicinfostep result
 *
 * @example
 * BasicInfoStep({
  formData,
  onChange,
  errors);
 */

/**
 * Performs basic info step operation
 *
 * @param {BasicInfoStepProps} [{
  formData,
  onChange,
  errors = {},
}] - The {
  formdata,
  onchange,
  errors = {},
}
 *
 * @returns {any} The basicinfostep result
 *
 * @example
 * BasicInfoStep({
  formData,
  onChange,
  errors = {},
});
 */
export function BasicInfoStep({
  formData,
  onChange,
  errors = {},
}: BasicInfoStepProps) {
  /**
   * Handles input change event
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The e
   *
   * @returns {any} The handleinputchange result
   */

  /**
   * Handles input change event
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} /** E */
    e - The /**  e */
    e
   *
   * @returns {any} The handleinputchange result
   */

  /**
 * Handles input change
 *
 * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The e
 *
 * @returns {any} The handleinputchange result
 *
 */
const handleInputChange = (
    /** E */
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
