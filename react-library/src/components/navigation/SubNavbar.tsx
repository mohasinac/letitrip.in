/**
 * SubNavbar - Pure React
 * 
 * Secondary navigation bar with icon-based nav items.
 * Framework-agnostic navigation component with Link and pathname injection.
 */

import { type ComponentType, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface SubNavbarItem {
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface SubNavbarProps {
  /** Navigation items to display */
  items: SubNavbarItem[];
  /** Current pathname for active state */
  currentPath: string;
  /** Link component to use for navigation */
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  /** Additional CSS classes */
  className?: string;
}

export function SubNavbar({
  items,
  currentPath,
  LinkComponent,
  className = "",
}: SubNavbarProps) {
  const isActive = (href: string) => {
    if (href === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(href);
  };

  return (
    <nav
      className={`hidden lg:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-[52px] z-40 ${className}`}
      aria-label="Secondary navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8 py-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <LinkComponent
                key={item.id}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors min-h-[44px] ${
                  active
                    ? "text-yellow-600 dark:text-yellow-500 border-b-2 border-yellow-600 dark:border-yellow-500"
                    : "text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-500"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </LinkComponent>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
