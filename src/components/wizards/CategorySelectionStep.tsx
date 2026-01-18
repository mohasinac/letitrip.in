"use client";

import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
import type { CategorySelectionStepProps as LibraryCategorySelectionStepProps } from "@letitrip/react-library";
import { CategorySelectionStep as LibraryCategorySelectionStep } from "@letitrip/react-library";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

export interface CategorySelectionStepProps
  extends Omit<
    LibraryCategorySelectionStepProps,
    "selectorComponent" | "icons" | "selectedPath"
  > {}

/**
 * CategorySelectionStep Component (Next.js Wrapper)
 *
 * Integrates library CategorySelectionStep with Next.js and Firebase.
 * Injects CategorySelectorWithCreate and icons.
 */
export function CategorySelectionStep(props: CategorySelectionStepProps) {
  const { value, onChange, required, error, ...rest } = props;
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  const handleCategoryChange = (categoryId: string | null) => {
    if (categoryId) {
      onChange(categoryId);
    }
  };

  return (
    <LibraryCategorySelectionStep
      {...rest}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      selectedPath={selectedPath}
      selectorComponent={
        <CategorySelectorWithCreate
          value={value}
          onChange={handleCategoryChange}
          required={required}
          error={error}
        />
      }
      icons={{
        chevron: <ChevronRight className="w-3 h-3" />,
      }}
    />
  );
}

export default CategorySelectionStep;
