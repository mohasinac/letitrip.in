/**
 * Semantic HTML Wrapper Components
 *
 * Thin, themeable wrappers around HTML5 semantic elements.
 * Import from `@/components` — never import individual files.
 *
 * Available components:
 *   Section     → <section>
 *   Article     → <article>
 *   Main        → <main>
 *   Aside       → <aside>
 *   Nav         → <nav>  (aria-label required)
 *   BlockHeader → <header> (block-level, not the page header)
 *   BlockFooter → <footer> (block-level, not the page footer)
 *   Ul          → <ul>
 *   Ol          → <ol>
 *   Li          → <li>
 *
 * @example
 * ```tsx
 * import { Section, Article, Nav, Ul, Li } from '@/components';
 * ```
 */

export {
  Section,
  Article,
  Main,
  Aside,
  Nav,
  BlockHeader,
  BlockFooter,
  Ul,
  Ol,
  Li,
} from "@mohasinac/appkit/ui";

export type {
  SectionProps,
  ArticleProps,
  MainProps,
  AsideProps,
  NavProps,
  BlockHeaderProps,
  BlockFooterProps,
  UlProps,
  OlProps,
  LiProps,
} from "@mohasinac/appkit/ui";

/**
 * Layout primitives — Container, Stack, Row, Grid.
 * Use instead of raw `<div className="flex|grid|max-w-7xl ...">` markup.
 * Implementations live in packages/ui/src/components/Layout.tsx.
 *
 * @example
 * ```tsx
 * // Page wrapper
 * <Container size="2xl">...</Container>
 *
 * // Responsive grid
 * <Grid cols={3} gap="md">...</Grid>
 *
 * // Horizontal flex row
 * <Row justify="between" gap="sm">...</Row>
 *
 * // Vertical flex column
 * <Stack gap="md">...</Stack>
 * ```
 */
export { Container, Stack, Row, Grid } from "@mohasinac/appkit/ui";
export type {
  GapKey,
  ContainerSize,
  GridCols,
  ContainerProps,
  StackProps,
  RowProps,
  GridProps,
} from "@mohasinac/appkit/ui";
