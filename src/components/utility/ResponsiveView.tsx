"use client";

/**
 * ResponsiveView Component
 *
 * Renders both mobile and desktop trees in the DOM; CSS hides the inactive one.
 * This approach is hydration-safe: server and client render identical HTML,
 * avoiding mismatches caused by window.matchMedia being unavailable on the server.
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
  /** Optional tablet override — shown between md (768 px) and lg (1024 px). */
  tablet?: React.ReactNode;
  /** Tailwind breakpoint prefix at which to switch to desktop. Default: "md". */
  breakpoint?: "sm" | "md" | "lg" | "xl";
}

export function ResponsiveView({
  mobile,
  desktop,
  tablet,
  breakpoint = "md",
}: ResponsiveViewProps) {
  return (
    <>
      {/* Mobile: shown below breakpoint */}
      <div className={`block ${breakpoint}:hidden`}>{mobile}</div>

      {/* Tablet: only rendered when explicitly provided, between md and lg */}
      {tablet && <div className="hidden md:block lg:hidden">{tablet}</div>}

      {/* Desktop: shown at breakpoint and above */}
      <div className={`hidden ${breakpoint}:block`}>{desktop}</div>
    </>
  );
}
