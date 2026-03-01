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
import { useTranslations } from "next-intl";
import { useCategories, useCreateCategory, useMessage } from "@/hooks";
import {
  SideDrawer,
  Button,
  CategoryForm,
  DrawerFormFooter,
  Label,
  flattenCategories,
} from "@/components";
import type { Category } from "@/components";
import {
  UI_PLACEHOLDERS,
  SUCCESS_MESSAGES,
  THEME_CONSTANTS,
} from "@/constants";

const { input } = THEME_CONSTANTS;

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

  const { mutate, isLoading } = useCreateCategory({
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
  const tForm = useTranslations("form");
  const tActions = useTranslations("actions");

  const { categories: rawCategories, isLoading, refetch } = useCategories();
  const categories = rawCategories as unknown as Category[];
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
        {label && <Label className="mb-1">{label}</Label>}
        <div className="flex gap-2 items-center">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isLoading}
            className={`flex-1 ${input.base}`}
            aria-label={label ?? tForm("category")}
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
              + {tActions("addCategory")}
            </Button>
          )}
        </div>
      </div>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={tActions("addCategory")}
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
