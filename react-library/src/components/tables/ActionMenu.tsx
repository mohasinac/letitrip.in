
import { useEffect, useRef, useState } from "react";

/**
 * Configuration for a menu item
 */
export interface ActionMenuItem {
  /** Display label for the menu item */
  label: string;
  /** Click handler for the menu item */
  onClick: () => void;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  /** Visual variant for the item */
  variant?: "default" | "danger" | "success";
  /** Whether the item is disabled */
  disabled?: boolean;
}

/**
 * Props for ActionMenu component
 */
export interface ActionMenuProps {
  /** Array of menu items to display */
  items: ActionMenuItem[];
  /** Label for the trigger button */
  label?: string;
  /** Custom icon for the trigger button */
  icon?: React.ReactNode;
  /** Alignment of the dropdown menu */
  align?: "left" | "right";
  /** Custom className for the container */
  className?: string;
  /** Default icon component for the trigger button */
  DefaultIcon?: React.ComponentType<any>;
  /** Chevron/dropdown icon component */
  ChevronIcon?: React.ComponentType<any>;
  /** Custom trigger button className */
  triggerClassName?: string;
  /** Custom dropdown menu className */
  menuClassName?: string;
}

// Default icons
const DefaultMenuIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);

const DefaultChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

/**
 * ActionMenu - Dropdown menu component for actions
 *
 * A dropdown menu component that displays a list of actions when clicked.
 * Supports keyboard navigation and click-outside to close.
 *
 * @example
 * ```tsx
 * <ActionMenu
 *   items={[
 *     { label: 'Edit', onClick: () => handleEdit() },
 *     { label: 'Delete', onClick: () => handleDelete(), variant: 'danger' }
 *   ]}
 *   label="Actions"
 * />
 * ```
 */
export function ActionMenu({
  items,
  label = "Actions",
  icon,
  align = "right",
  className = "",
  DefaultIcon = DefaultMenuIcon,
  ChevronIcon = DefaultChevronIcon,
  triggerClassName = "flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
  menuClassName = "absolute z-10 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg",
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleItemClick = (item: ActionMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const variantStyles = {
    default:
      "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700",
    danger:
      "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
    success:
      "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20",
  };

  return (
    <div ref={menuRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName}
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
        aria-label={label}
      >
        {icon || <DefaultIcon />}
        <span>{label}</span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`${menuClassName} ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left ${
                  item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : variantStyles[item.variant || "default"]
                }`}
                role="menuitem"
                type="button"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
