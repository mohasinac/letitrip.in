/**
 * @fileoverview React Component
 * @module src/components/seller/CategorySelectorWithCreate
 * @description This file contains the CategorySelectorWithCreate component and its related functionality
 *
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import CategorySelector, {
  Category as CategoryType,
} from "@/components/common/CategorySelector";
import SelectorWithCreate from "@/components/common/SelectorWithCreate";
import SlugInput from "@/components/common/SlugInput";
import { FormInput } from "@/components/forms/FormInput";
import { FormLabel } from "@/components/forms/FormLabel";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { categoriesService } from "@/services/categories.service";
import { FolderTree } from "lucide-react";

/**
 * CategorySelectorWithCreateProps interface
 *
 * @interface
 * @description Defines the structure and contract for CategorySelectorWithCreateProps
 */
interface CategorySelectorWithCreateProps {
  /** Value */
  value: string | null;
  /** On Change */
  onChange: (categoryId: string | null, category: CategoryType | null) => void;
  /** Error */
  error?: string;
  /** Disabled */
  disabled?: boolean;
  /** Placeholder */
  placeholder?: string;
  /** Class Name */
  className?: string;
  /** Required */
  required?: boolean;
  /** OnCategoryCreated */
  onCategoryCreated?: (category: CategoryType) => void; // Callback when new category is created
}

export default function CategorySelectorWithCreate({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Select a category",
  className = "",
  required = false,
  onCategoryCreated,
}: CategorySelectorWithCreateProps) {
  return (
    <SelectorWithCreate<CategoryType>
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      required={required}
      icon={FolderTree}
      entityName="Category"
      selectorComponent={(props) => (
        <CategorySelector
          {...props}
          value={props.value}
          onChange={(id, cat) => props.onChange(id, cat)}
        />
      )}
      createService={async (data) => {
        const result = await categoriesService.create({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
        });
        if (onCategoryCreated) onCategoryCreated(result);
        return result;
      }}
      renderCreateFields={(form, setForm, errors, setErrors) => (
        <>
          <FormInput
            id="create-category-name"
            label="Category Name"
            required={required}
            value={form.name}
            onChange={(e) => {
              setForm((prev: any) => ({ ...prev, name: e.target.value }));
              setErrors((prev: any) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
            placeholder="e.g., Electronics, Fashion"
            maxLength={100}
            showCharCount
            autoFocus
          />
          <div>
            <FormLabel required={required}>URL Slug</FormLabel>
            <SlugInput
              sourceText={form.name}
              value={form.slug}
              onChange={(slug) => {
                setForm((prev: any) => ({ ...prev, slug }));
                setErrors((prev: any) => ({ ...prev, slug: "" }));
              }}
              error={errors.slug}
              placeholder="auto-generated-slug"
            />
          </div>
          <FormTextarea
            id="create-category-description"
            label="Description"
            helperText="Optional brief description"
            value={form.description}
            onChange={(e) =>
              setForm((prev: any) => ({ ...prev, description: e.target.value }))
            }
            rows={3}
            placeholder="Brief description"
            maxLength={500}
            showCharCount
          />
        </>
      )}
      validateCreateForm={(form) => {
        const errors: any = {};
        if (!form.name?.trim()) errors.name = "Name is required";
        if (!form.slug?.trim()) errors.slug = "Slug is required";
        return errors;
      }}
    />
  );
}
