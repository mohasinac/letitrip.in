/**
 * MobileNavRow - Pure React
 *
 * Horizontally scrollable navigation row for mobile.
 * Framework-agnostic component with Link and pathname injection.
 */

import type { LucideIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";

export interface MobileNavRowItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface MobileNavRowProps {
  /** Navigation items to display */
  items: MobileNavRowItem[];
  /** Current pathname for active state */
  currentPath: string;
  /** Link component to use for navigation */
  LinkComponent: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  /** Visual variant for color scheme */
  variant?: "admin" | "seller" | "user";
  /** Chevron icons for scroll buttons */
  icons: {
    chevronLeft: LucideIcon;
    chevronRight: LucideIcon;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * MobileNavRow - Horizontally scrollable navigation row for mobile
 * Used above BottomNav on admin/seller/user routes to provide secondary navigation
 * Hidden on desktop (lg+) where sidebars are visible
 */
export function MobileNavRow({
  items,
  currentPath,
  LinkComponent,
  variant = "user",
  icons,
  className = "",
}: MobileNavRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScroll);
      globalThis.addEventListener?.("resize", checkScroll);
      return () => {
        scrollElement.removeEventListener("scroll", checkScroll);
        globalThis.removeEventListener?.("resize", checkScroll);
      };
    }
  }, [checkScroll, items]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    }
  };

  const isActive = (href: string) => {
    const basePaths = ["/user", "/admin", "/seller"];
    if (basePaths.includes(href)) {
      return currentPath === href;
    }
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  const variantColors = {
    admin: {
      active:
        "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-500",
      inactive:
        "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-transparent",
      activeIcon: "text-purple-600 dark:text-purple-500",
      inactiveIcon: "text-gray-400 dark:text-gray-500",
    },
    seller: {
      active:
        "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-500",
      inactive:
        "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-transparent",
      activeIcon: "text-blue-600 dark:text-blue-500",
      inactiveIcon: "text-gray-400 dark:text-gray-500",
    },
    user: {
      active:
        "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-500",
      inactive:
        "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 border-transparent",
      activeIcon: "text-yellow-600 dark:text-yellow-500",
      inactiveIcon: "text-gray-400 dark:text-gray-500",
    },
  };

  const colors = variantColors[variant];
  const ChevronLeft = icons.chevronLeft;
  const ChevronRight = icons.chevronRight;

  return (
    <div
      className={cn(
        "lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]",
        className,
      )}
    >
      <div className="relative flex items-center">
        {/* Left scroll button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide flex-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <nav className="flex items-center gap-1 p-2 min-w-max">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <LinkComponent
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border-b-2",
                    active ? colors.active : colors.inactive,
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      active ? colors.activeIcon : colors.inactiveIcon,
                    )}
                  />
                  <span>{item.title}</span>
                </LinkComponent>
              );
            })}
          </nav>
        </div>

        {/* Right scroll button */}
        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
