/**
 * Next.js Wrappers Index
 *
 * Exports all Next.js-specific wrapper components and hooks for use with
 * @letitrip/react-library components.
 *
 * These wrappers bridge the gap between pure React library components
 * and Next.js-specific features (Link, Image, Router, etc.)
 *
 * @example
 * import { LinkWrapper, ImageWrapper, useRouterWrapper } from '@/components/wrappers';
 */

export { LinkWrapper } from "./LinkWrapper";
export type { LinkWrapperProps } from "./LinkWrapper";

export { ImageWrapper } from "./ImageWrapper";
export type { ImageWrapperProps } from "./ImageWrapper";

export { useRouterWrapper } from "./RouterWrapper";
export type {
  NavigationCallbacks,
  RouterWrapperInterface,
} from "./RouterWrapper";

// Convenience aliases - use the primary exports instead
// Example: import { LinkWrapper as Link } from '@/components/wrappers';
