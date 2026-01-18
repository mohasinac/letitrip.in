import { ReactNode } from "react";
import { cn } from "../../utils/cn";

export interface ShopSelectionStepProps {
  value: string;
  onChange: (shopId: string) => void;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  showCreateLink?: boolean;
  createLinkUrl?: string;

  // Injection props
  selectorComponent: ReactNode;
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  icons?: {
    plus?: ReactNode;
    store?: ReactNode;
  };
  className?: string;
}

/**
 * ShopSelectionStep Component (Library Version)
 *
 * Framework-agnostic shop selection step for wizard flows.
 * Accepts shop selector as a component via injection pattern.
 *
 * Features:
 * - Flexible selector injection
 * - Optional create link with custom Link component
 * - Configurable labels and help text
 * - Info box about shops
 * - Error display
 *
 * @example
 * ```tsx
 * <ShopSelectionStep
 *   value={formData.shopId}
 *   onChange={(shopId) => setFormData({ ...formData, shopId })}
 *   selectorComponent={<ShopSelector value={...} onChange={...} />}
 *   LinkComponent={NextLink}
 *   icons={{ plus: <Plus />, store: <Store /> }}
 *   label="Shop"
 *   required
 *   showCreateLink
 * />
 * ```
 */
export function ShopSelectionStep({
  value,
  onChange,
  required = true,
  error,
  label = "Shop",
  helperText = "Select which shop this belongs to",
  showCreateLink = true,
  createLinkUrl = "/seller/my-shops/create",
  selectorComponent,
  LinkComponent,
  icons,
  className,
}: ShopSelectionStepProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {helperText && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </div>

        {showCreateLink && LinkComponent && (
          <LinkComponent
            href={createLinkUrl}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {icons?.plus}
            Create Shop
          </LinkComponent>
        )}
      </div>

      {/* Shop Selector */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        {selectorComponent}
      </div>

      {/* Error Display */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
        <div className="flex items-start gap-3">
          {icons?.store && (
            <div className="flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400">
              {icons.store}
            </div>
          )}
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">About Shops</p>
            <p>
              Shops help organize your products and auctions. If you only have
              one shop, it will be automatically selected. You can create
              multiple shops for different product categories or brands.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
