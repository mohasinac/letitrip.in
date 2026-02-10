"use client";

import { useBreakpoint } from "@/hooks";

/**
 * ResponsiveView Component
 *
 * Conditionally renders mobile or desktop content based on viewport size.
 * Uses useBreakpoint hook to detect screen size.
 *
 * @example
 * ```tsx
 * <ResponsiveView
 *   mobile={<MobileProductGrid products={products} />}
 *   desktop={<DesktopProductTable products={products} />}
 * />
 * ```
 */
interface ResponsiveViewProps {
  mobile: React.ReactNode;
  desktop: React.ReactNode;
  tablet?: React.ReactNode;
}

export function ResponsiveView({
  mobile,
  desktop,
  tablet,
}: ResponsiveViewProps) {
  const { isMobile, isTablet } = useBreakpoint();

  if (isMobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isTablet) return <>{mobile}</>;
  return <>{desktop}</>;
}
