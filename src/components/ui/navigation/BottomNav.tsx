/**
 * BottomNav Component
 *
 * A fixed bottom navigation bar for mobile devices with active state animations,
 * badge support, and optional floating action button.
 *
 * @example
 * ```tsx
 * <BottomNav
 *   items={[
 *     { id: 'home', label: 'Home', icon: <Home />, href: '/' },
 *     { id: 'products', label: 'Products', icon: <Package />, href: '/products', badge: 5 },
 *     { id: 'orders', label: 'Orders', icon: <ShoppingCart />, href: '/orders' },
 *     { id: 'profile', label: 'Profile', icon: <User />, href: '/profile' }
 *   ]}
 *   floatingAction={{
 *     icon: <Plus />,
 *     onClick: () => console.log('Add new')
 *   }}
 * />
 * ```
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface BottomNavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Link href */
  href: string;
  /** Badge count or text */
  badge?: string | number;
  /** Whether item is disabled */
  disabled?: boolean;
}

export interface BottomNavFloatingAction {
  /** Icon for FAB */
  icon: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Button label for accessibility */
  label?: string;
}

export interface BottomNavProps {
  /** Navigation items (max 5 recommended) */
  items: BottomNavItem[];
  /** Floating action button config */
  floatingAction?: BottomNavFloatingAction;
  /** Auto-hide on scroll down */
  autoHide?: boolean;
  /** Blur background */
  blur?: boolean;
  /** Additional class name */
  className?: string;
}

export const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(
  ({ items, floatingAction, autoHide = true, blur = true, className }, ref) => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Auto-hide on scroll
    useEffect(() => {
      if (!autoHide) return;

      const handleScroll = () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down
          setIsVisible(false);
        } else {
          // Scrolling up
          setIsVisible(true);
        }

        setLastScrollY(currentScrollY);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY, autoHide]);

    const isItemActive = (href: string) => {
      return pathname === href || pathname?.startsWith(`${href}/`);
    };

    // Split items into rows if there are more than 4 items
    const itemsPerRow = 4;
    const hasMultipleRows = items.length > itemsPerRow;
    const firstRowItems = hasMultipleRows ? items.slice(0, itemsPerRow) : items;
    const secondRowItems = hasMultipleRows ? items.slice(itemsPerRow) : [];

    return (
      <nav
        ref={ref}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40",
          "border-t border-white/10 transition-transform duration-300",
          blur && "backdrop-blur-xl",
          "bg-black/90 md:hidden",
          !isVisible && "translate-y-full",
          className
        )}
      >
        <div className="relative">
          {/* First Row */}
          <div
            className={cn(
              "flex items-center justify-around px-2",
              hasMultipleRows ? "h-14" : "h-16"
            )}
          >
            {firstRowItems.map((item, index) => {
              const isActive = isItemActive(item.href);
              const isCenterItem =
                floatingAction &&
                index === Math.floor(firstRowItems.length / 2);

              return (
                <React.Fragment key={item.id}>
                  {/* Spacer for floating action button */}
                  {isCenterItem && <div className="w-16" />}

                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1",
                      "min-w-[64px] px-2 py-1.5 rounded-lg",
                      "transition-all duration-200",
                      isActive
                        ? "text-white"
                        : "text-white/50 hover:text-white/70",
                      item.disabled && "opacity-50 pointer-events-none"
                    )}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "flex items-center justify-center w-6 h-6",
                          "transition-all duration-200",
                          isActive && "scale-110"
                        )}
                      >
                        {item.icon}
                      </div>

                      {/* Badge */}
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "absolute -top-1 -right-1",
                            "min-w-[18px] h-[18px] px-1",
                            "flex items-center justify-center",
                            "text-[10px] font-bold",
                            "bg-error text-white rounded-full"
                          )}
                        >
                          {typeof item.badge === "number" && item.badge > 9
                            ? "9+"
                            : item.badge}
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-medium truncate max-w-full",
                        isActive && "font-semibold"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                </React.Fragment>
              );
            })}
          </div>

          {/* Second Row (if needed) */}
          {hasMultipleRows && secondRowItems.length > 0 && (
            <div className="flex items-center justify-around h-14 px-2 border-t border-white/5">
              {secondRowItems.map((item) => {
                const isActive = isItemActive(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1",
                      "min-w-[64px] px-2 py-1.5 rounded-lg",
                      "transition-all duration-200",
                      isActive
                        ? "text-white"
                        : "text-white/50 hover:text-white/70",
                      item.disabled && "opacity-50 pointer-events-none"
                    )}
                  >
                    <div className="relative">
                      <div
                        className={cn(
                          "flex items-center justify-center w-6 h-6",
                          "transition-all duration-200",
                          isActive && "scale-110"
                        )}
                      >
                        {item.icon}
                      </div>

                      {/* Badge */}
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "absolute -top-1 -right-1",
                            "min-w-[18px] h-[18px] px-1",
                            "flex items-center justify-center",
                            "text-[10px] font-bold",
                            "bg-error text-white rounded-full"
                          )}
                        >
                          {typeof item.badge === "number" && item.badge > 9
                            ? "9+"
                            : item.badge}
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-medium truncate max-w-full",
                        isActive && "font-semibold"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Floating Action Button */}
          {floatingAction && (
            <button
              onClick={floatingAction.onClick}
              className={cn(
                "absolute left-1/2 -translate-x-1/2 -top-8",
                "w-14 h-14 rounded-full",
                "bg-primary text-white",
                "shadow-lg hover:shadow-xl",
                "flex items-center justify-center",
                "transition-all duration-200",
                "hover:scale-110 active:scale-95"
              )}
              aria-label={floatingAction.label || "Action"}
            >
              {floatingAction.icon}
            </button>
          )}
        </div>
      </nav>
    );
  }
);

BottomNav.displayName = "BottomNav";

/**
 * Hook for managing BottomNav state
 */
export function useBottomNav() {
  const [isVisible, setIsVisible] = useState(true);

  return {
    isVisible,
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
    toggle: () => setIsVisible(!isVisible),
  };
}
