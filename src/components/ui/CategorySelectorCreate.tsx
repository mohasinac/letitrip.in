"use client";

/**
 * CategorySelectorCreate Component
 * Path: src/components/ui/CategorySelectorCreate.tsx
 *
 * Searchable category selector with an inline "New category" trigger.
 * Opens a SideDrawer with CategoryForm when the user wants to create a new
 * category on-the-fly — without leaving the form they are filling in.
 *
 * Used by: ProductForm (admin, seller)
 *
 * @example
 * ```tsx
 * <CategorySelectorCreate
 *   label="Category"
 *   value={product.category}
 *   onChange={(id) => update({ category: id })}
 * />
 * ```
 */

import { useState, useCallback } from "react";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import {
  SideDrawer,
  Button,
  CategoryForm,
  DrawerFormFooter,
  flattenCategories,
} from "@/components";
import type { Category } from "@/components";
import {
  API_ENDPOINTS,
  UI_LABELS,
  UI_PLACEHOLDERS,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";

const { typography, input } = THEME_CONSTANTS;

interface ApiSuccessCategory {
  success: boolean;
  data?: Category;
}

interface CategoriesApiResponse {
  success?: boolean;
  data?: Category[];
  items?: Category[];
}

export interface CategorySelectorCreateProps {
  /** Currently selected category ID */
  value: string;
  /** Called with the ID of the selected or newly-created category */
  onChange: (id: string) => void;
  disabled?: boolean;
  label?: string;
}

/** Inner form content rendered inside the SideDrawer */
function CreateCategoryContent({
  allCategories,
  onSuccess,
  onCancel,
}: {
  allCategories: Category[];
  onSuccess: (id: string) => void;
  onCancel: () => void;
}) {
  const { showSuccess, showError } = useMessage();
  const [draft, setDraft] = useState<Partial<Category>>({
    enabled: true,
    showOnHomepage: false,
    parentId: null,
    order: 0,
  });

  const { mutate, isLoading } = useApiMutation<
    ApiSuccessCategory,
    Partial<Category>
  >({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, data),
    onSuccess: (res) => {
      showSuccess(SUCCESS_MESSAGES.CATEGORY.CREATED);
      onSuccess(res.data?.id ?? "");
    },
    onError: (err) => showError(err.message),
  });

  const handleSave = useCallback(() => {
    if (!draft.name) return;
    mutate(draft);
  }, [draft, mutate]);

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <CategoryForm
        category={draft}
        allCategories={allCategories}
        onChange={setDraft}
      />
      <DrawerFormFooter
        isLoading={isLoading}
        onSubmit={handleSave}
        onCancel={onCancel}
        isSubmitDisabled={!draft.name}
      />
    </div>
  );
}

export function CategorySelectorCreate({
  value,
  onChange,
  disabled = false,
  label,
}: CategorySelectorCreateProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: raw,
    isLoading,
    refetch,
  } = useApiQuery<CategoriesApiResponse>({
    queryKey: ["categories"],
    queryFn: () => apiClient.get(API_ENDPOINTS.CATEGORIES.LIST),
  });

  const categories: Category[] = raw?.data ?? raw?.items ?? [];
  const flat = flattenCategories(categories);

  const handleSuccess = useCallback(
    (newId: string) => {
      setDrawerOpen(false);
      refetch();
      if (newId) onChange(newId);
    },
    [onChange, refetch],
  );

  return (
    <>
      <div>
        {label && (
          <label className={`block ${typography.label} mb-1`}>{label}</label>
        )}
        <div className="flex gap-2 items-center">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className={`flex-1 ${input.base}`}
            aria-label={label ?? UI_LABELS.FORM.CATEGORY}
          >
            <option value="">{UI_PLACEHOLDERS.SELECT_CATEGORY}</option>
            {flat.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {"  ".repeat(cat.tier)}
                {cat.name}
              </option>
            ))}
          </select>

          {!disabled && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
            >
              + {UI_LABELS.ACTIONS.ADD_CATEGORY}
            </Button>
          )}
        </div>
      </div>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={UI_LABELS.ACTIONS.ADD_CATEGORY}
        mode="create"
      >
        <CreateCategoryContent
          allCategories={categories}
          onSuccess={handleSuccess}
          onCancel={() => setDrawerOpen(false)}
        />
      </SideDrawer>
    </>
  );
}
