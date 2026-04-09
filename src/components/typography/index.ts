/**
 * Typography Components Index
 *
 * All text, heading, link, and inline-wrapper components.
 * Import from `@/components` — never import individual files.
 *
 * @example
 * ```tsx
 * import { Heading, Text, Label, Caption, Span, TextLink } from '@/components';
 * ```
 */

// Block-level text primitives
export { Heading, Text, Label, Caption, Span } from "@mohasinac/appkit/ui";

// Link primitive (wraps next-intl Link for internal, <a> for external)
export { TextLink } from "./TextLink";
export type { TextLinkProps } from "./TextLink";
