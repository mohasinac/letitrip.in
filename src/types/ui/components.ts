/**
 * Frontend UI Component Types
 */

import { ReactNode, CSSProperties } from "react";

/**
 * Base component props
 */
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
}

/**
 * Button variants
 */
export type ButtonVariant = 
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive";

/**
 * Button sizes
 */
export type ButtonSize = "sm" | "md" | "lg" | "xl";

/**
 * Button props
 */
export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

/**
 * Input types
 */
export type InputType = 
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "time"
  | "datetime-local";

/**
 * Input props
 */
export interface InputProps extends BaseComponentProps {
  type?: InputType;
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * Modal sizes
 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Modal props
 */
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: ReactNode;
}

/**
 * Card props
 */
export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  footer?: ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

/**
 * Alert variants
 */
export type AlertVariant = "info" | "success" | "warning" | "error";

/**
 * Alert props
 */
export interface AlertProps extends BaseComponentProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: ReactNode;
}

/**
 * Badge variants
 */
export type BadgeVariant = 
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

/**
 * Badge props
 */
export interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  rounded?: boolean;
}

/**
 * Dropdown option
 */
export interface DropdownOption<T = any> {
  label: string;
  value: T;
  icon?: ReactNode;
  disabled?: boolean;
  description?: string;
}

/**
 * Dropdown props
 */
export interface DropdownProps<T = any> extends BaseComponentProps {
  options: DropdownOption<T>[];
  value?: T;
  defaultValue?: T;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  searchable?: boolean;
  multi?: boolean;
  onChange?: (value: T | T[]) => void;
}

/**
 * Tab item
 */
export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

/**
 * Tabs props
 */
export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  variant?: "line" | "enclosed" | "soft-rounded";
}

/**
 * Pagination props
 */
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
}

/**
 * Table props
 */
export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationProps;
  onRowClick?: (record: T, index: number) => void;
  rowKey?: keyof T | ((record: T) => string);
  emptyText?: string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  current?: boolean;
}

/**
 * Breadcrumb props
 */
export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

/**
 * Loading props
 */
export interface LoadingProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg";
  fullscreen?: boolean;
  text?: string;
}

/**
 * Empty state props
 */
export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
}
