/**
 * Category Components Index
 * CategoryCard and CategorySelectorCreate moved back to Tier-1 (src/components).
 */

// Shared category form/types (used by admin + CategorySelectorCreate)
export { CategoryForm } from "./CategoryForm";
export { getCategoryTableColumns } from "./CategoryTableColumns";
export {
	flattenCategories,
	type Category,
	type CategoryDrawerMode,
} from "@mohasinac/appkit/features/categories";

// Presentational card — used by homepage and categories feature
export { CategoryCard } from "@mohasinac/appkit/features/categories";

// Selector with inline create — used by product forms
export { CategorySelectorCreate } from "./CategorySelectorCreate";
export type { CategorySelectorCreateProps } from "./CategorySelectorCreate";

