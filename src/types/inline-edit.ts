/**
 * Types for Inline Edit & Quick Create functionality
 */

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'checkbox' 
  | 'image' 
  | 'date'
  | 'textarea'
  | 'url'
  | 'email';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface InlineField {
  key: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: SelectOption[];
  validate?: (value: any) => string | null;
  placeholder?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  accept?: string; // For image type
  rows?: number; // For textarea
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  confirm?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  disabled?: boolean;
  requiresInput?: boolean;
  inputConfig?: InlineField;
}

export interface InlineEditConfig {
  fields: InlineField[];
  bulkActions?: BulkAction[];
  resourceName: string; // 'hero slide', 'category', 'product', etc.
  resourceNamePlural?: string; // 'hero slides', 'categories', 'products'
}

export interface InlineEditRowProps {
  fields: InlineField[];
  initialValues: Record<string, any>;
  onSave: (values: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  resourceName?: string;
}

export interface QuickCreateRowProps {
  fields: InlineField[];
  onSave: (values: Record<string, any>) => Promise<void>;
  loading?: boolean;
  resourceName?: string;
  defaultValues?: Record<string, any>;
}

export interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (actionId: string, input?: any) => Promise<void>;
  onClearSelection: () => void;
  loading?: boolean;
  resourceName?: string;
  totalCount?: number;
}

export interface InlineImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  accept?: string;
  size?: number; // Size in pixels (default: 64)
  loading?: boolean;
  disabled?: boolean;
  context?: string;
}

export interface MobileFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  children: React.ReactNode;
  title?: string;
}

export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  errors?: { id: string; error: string }[];
  message?: string;
}

export interface TableCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
}
