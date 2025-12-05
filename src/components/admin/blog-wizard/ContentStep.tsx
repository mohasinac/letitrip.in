/**
 * @fileoverview React Component
 * @module src/components/admin/blog-wizard/ContentStep
 * @description This file contains the ContentStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { FormLabel } from "@/components/forms/FormLabel";
import RichTextEditor from "@/components/common/RichTextEditor";
import type { BlogFormData, OnBlogChange } from "./types";

/**
 * ContentStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ContentStepProps
 */
interface ContentStepProps {
  /** Form Data */
  formData: BlogFormData;
  /** On Change */
  onChange: OnBlogChange;
  /** Error */
  error?: string;
}

/**
 * Function: Content Step
 */
/**
 * Performs content step operation
 *
 * @param {ContentStepProps} { formData, onChange, error } - The { form data, on change, error }
 *
 * @returns {any} The contentstep result
 *
 * @example
 * ContentStep({ formData, onChange, error });
 */

/**
 * Performs content step operation
 *
 * @param {ContentStepProps} { formData, onChange, error } - The { form data, on change, error }
 *
 * @returns {any} The contentstep result
 *
 * @example
 * ContentStep({ formData, onChange, error });
 */

export function ContentStep({ formData, onChange, error }: ContentStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Post Content
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Write the main content of your blog post
        </p>
      </div>

      <div>
        <FormLabel required>Content</FormLabel>
        <RichTextEditor
          value={formData.content}
          onChange={(value) => onChange("content", value)}
          placeholder="Write your blog post content here..."
          minHeight={400}
          error={error}
        />
      </div>
    </div>
  );
}
