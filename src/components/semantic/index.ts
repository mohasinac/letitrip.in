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
} from "./Semantic";

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
} from "./Semantic";
