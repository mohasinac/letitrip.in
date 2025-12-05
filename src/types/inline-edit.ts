/**
 * @fileoverview TypeScript Module
 * @module src/types/inline-edit
 * @description This file contains functionality related to inline-edit
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Types for Inline Edit & Quick Create functionality
 */

/**
 * Field Type type definition
 * @typedef {FieldType}
 */
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "image"
  | "date"
  | "textarea"
  | "url"
  | "email"
  | "category-create"; // New type for category selector with create

/**
 * SelectOption interface
 * 
 * @interface
 * @description Defines the structure and contract for SelectOption
 */
export interface SelectOption {
  /** Value */
  value: string | number;
  /** Label */
  label: string;
  /** Disabled */
  disabled?: boolean;
}

/**
 * InlineField interface
 * 
 * @interface
 * @description Defines the structure and contract for InlineField
 */
export interface InlineField {
  /** Key */
  key: string;
  /** Type */
  type: FieldType;
  /** Label */
  label: string;
  /** Required */
  required?: boolean;
  /** Options */
  options?: SelectOption[];
  /** Validate */
  validate?: (_value: any, _formData?: Record<string, any>) => string | null;
  /** Placeholder */
  placeholder?: string;
  /** Disabled */
  disabled?: boolean;
  /** Min */
  min?: number;
  /** Max */
  max?: number;
  /** Step */
  step?: number;
  /** Accept */
  accept?: string; // For image type
  /** Rows */
  rows?: number; // For textarea
}

/**
 * BulkAction interface
 * 
 * @interface
 * @description Defines the structure and contract for BulkAction
 */
export interface BulkAction {
  /** Id */
  id: string;
  /** Label */
  label: string;
  /** Icon */
  icon?: React.ComponentType<any>;
  /** Variant */
  variant?: "default" | "danger" | "warning" | "success";
  /** Confirm */
  confirm?: boolean;
  /** Confirm Title */
  confirmTitle?: string;
  /** Confirm Message */
  confirmMessage?: string;
  /** Disabled */
  disabled?: boolean;
  /** Requires Input */
  requiresInput?: boolean;
  /** Input Config */
  inputConfig?: InlineField;
}

/**
 * InlineEditConfig interface
 * 
 * @interface
 * @description Defines the structure and contract for InlineEditConfig
 */
export interface InlineEditConfig {
  /** Fields */
  fields: InlineField[];
  /** Bulk Actions */
  bulkActions?: BulkAction[];
  /** ResourceName */
  resourceName: string; // 'hero slide', 'category', 'product', etc.
  /** ResourceNamePlural */
  resourceNamePlural?: string; // 'hero slides', 'categories', 'products'
}

/**
 * InlineEditRowProps interface
 * 
 * @interface
 * @description Defines the structure and contract for InlineEditRowProps
 */
export interface InlineEditRowProps {
  /** Fields */
  fields: InlineField[];
  /** Initial Values */
  initialValues: Record<string, any>;
  /** On Save */
  onSave: (_values: Record<string, any>) => Promise<void>;
  /** On Cancel */
  onCancel: () => void;
  /** Loading */
  loading?: boolean;
  /** Resource Name */
  resourceName?: string;
}

/**
 * QuickCreateRowProps interface
 * 
 * @interface
 * @description Defines the structure and contract for QuickCreateRowProps
 */
export interface QuickCreateRowProps {
  /** Fields */
  fields: InlineField[];
  /** On Save */
  onSave: (_values: Record<string, any>) => Promise<void>;
  /** Loading */
  loading?: boolean;
  /** Resource Name */
  resourceName?: string;
  /** Default Values */
  defaultValues?: Record<string, any>;
}

/**
 * BulkActionBarProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BulkActionBarProps
 */
export interface BulkActionBarProps {
  /** Selected Count */
  selectedCount: number;
  /** Actions */
  actions: BulkAction[];
  /** On Action */
  onAction: (_actionId: string, _input?: any) => Promise<void>;
  /** On Clear Selection */
  onClearSelection: () => void;
  /** Loading */
  loading?: boolean;
  /** Resource Name */
  resourceName?: string;
  /** Total Count */
  totalCount?: number;
}

/**
 * InlineImageUploadProps interface
 * 
 * @interface
 * @description Defines the structure and contract for InlineImageUploadProps
 */
export interface InlineImageUploadProps {
  /** Value */
  value?: string;
  /** On Change */
  onChange: (_url: string) => void;
  /** On Remove */
  onRemove?: () => void;
  /** Accept */
  accept?: string;
  /** Size */
  size?: number; // Size in pixels (default: 64)
  /** Loading */
  loading?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Context */
  context?: string;
}

/**
 * MobileFilterSidebarProps interface
 * 
 * @interface
 * @description Defines the structure and contract for MobileFilterSidebarProps
 */
export interface MobileFilterSidebarProps {
  /** Is Open */
  isOpen: boolean;
  /** On Close */
  onClose: () => void;
  /** On Apply */
  onApply: () => void;
  /** On Reset */
  onReset: () => void;
  /** Children */
  children: React.ReactNode;
  /** Title */
  title?: string;
}

/**
 * BulkOperationResult interface
 * 
 * @interface
 * @description Defines the structure and contract for BulkOperationResult
 */
export interface BulkOperationResult {
  /** Success */
  success: boolean;
  /** Success Count */
  successCount: number;
  /** Failed Count */
  failedCount: number;
  /** Errors */
  errors?: { id: string; error: string }[];
  /** Message */
  message?: string;
}

/**
 * TableCheckboxProps interface
 * 
 * @interface
 * @description Defines the structure and contract for TableCheckboxProps
 */
export interface TableCheckboxProps {
  /** Checked */
  checked: boolean;
  /** On Change */
  onChange: (_checked: boolean) => void;
  /** Indeterminate */
  indeterminate?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Label */
  label?: string;
}
