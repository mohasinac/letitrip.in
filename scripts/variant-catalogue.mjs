/**
 * variant-catalogue.mjs — Data sidecar consumed by the variant audits.
 *
 * Declares which JSX elements the audit treats as appkit primitives + which
 * className tokens belong to which variant prop. The runtime audits
 * (`audit-html-wrappers`, `audit-variant-prop-coverage`) read this list so
 * the source of truth lives in one place — keep it sorted + comma-separated.
 *
 * Adding a new primitive: add its tag to PRIMITIVE_TAGS and (if it takes
 * variant-coverable className tokens) add the relevant token regex to
 * FORBIDDEN_UTILITY_TOKENS.
 *
 * Module is pure data — no Node-side dependencies — so it can be imported
 * from any audit script.
 */

/**
 * Tag names that the audit treats as appkit primitives. When any of these
 * elements appears in JSX with a `className=` prop, the audit's
 * `PRIMITIVE_CLASSNAME_PROP` rule fires.
 *
 * Includes layout primitives, typography primitives, semantic wrappers,
 * card/button/badge primitives, media primitives, sticky / icon-box
 * primitives, and the new responsive primitives.
 */
export const PRIMITIVE_TAGS = [
  // Layout
  "Container",
  "Stack",
  "Row",
  "Grid",
  "Div",
  // Semantic
  "Section",
  "Article",
  "Main",
  "Aside",
  "Nav",
  "BlockHeader",
  "BlockFooter",
  "Ul",
  "Ol",
  "Li",
  "Dl",
  "Dt",
  "Dd",
  "Table",
  "Thead",
  "Tbody",
  "Tfoot",
  "Tr",
  "Th",
  "Td",
  "Figure",
  "Figcaption",
  "Code",
  "Pre",
  "Blockquote",
  // Typography
  "Heading",
  "Text",
  "Span",
  "Label",
  "Caption",
  // Cards / Badges / Buttons
  "Card",
  "Badge",
  "Button",
  "IconButton",
  "TextLink",
  "Anchor",
  // Media
  "MediaImage",
  "MediaVideo",
  "MediaAudio",
  "MediaAvatar",
  "Iframe",
  // Sticky / structural
  "StickyToolbar",
  "IconBox",
  "HorizontalRule",
  "Divider",
  // Form primitives (catalogue forbids consumer-side className on these)
  "Form",
  "FieldInput",
  "FieldSelect",
  "FieldCheckbox",
  "FieldTextarea",
  "Fieldset",
  "Legend",
  // Overlays
  "Modal",
  "ModalFooter",
  "SideDrawer",
  "SideModal",
  "Drawer",
  "BottomSheet",
  "Dialog",
  "Tooltip",
  // Disclosure / interactive
  "Details",
  "Summary",
  // Inline
  "Kbd",
  "Quote",
  // Responsive
  "Show",
  "Hide",
  // Brand
  "SiteLogo",
  // Fallback / dynamic
  "FallbackShell",
  "HotspotMarker",
];

/**
 * Regex catalogue of className tokens that map 1:1 to primitive variant props.
 * When a primitive carries a `className=` that matches any of these, the audit
 * fires (the consumer is bypassing the variant catalogue).
 *
 * Used by `audit-html-wrappers.mjs/PRIMITIVE_CLASSNAME_PROP`.
 */
export const FORBIDDEN_UTILITY_TOKENS = [
  // Colour utilities — go through `color=…` on Typography or `tone=…` on tonal primitives.
  /\btext-(?:zinc|slate|red|green|amber|blue|emerald|rose|orange|yellow|purple|indigo|cyan|pink|teal|sky)-\d+\b/,
  // Background surface utilities — go through `surface=…`.
  /\bbg-(?:white|black|zinc|slate)-?\d*\b/,
  // Status-tinted surfaces.
  /\bbg-(?:success|danger|warning|info)-surface\b/,
  // Border colour utilities — go through `border=…`.
  /\bborder-(?:zinc|slate|primary|secondary)-\d+\b/,
  // Rounded utilities — go through `rounded=…`.
  /\brounded(?:-(?:sm|md|lg|xl|2xl|3xl|full))?\b/,
  // Shadow utilities — go through `shadow=…`.
  /\bshadow(?:-(?:sm|md|lg|xl|2xl))?\b/,
  // Padding utilities — go through `padding=…`.
  /\bp[xytrbl]?-\d+\b/,
  // Gap utilities — go through `gap=…`.
  /\bgap-\d+\b/,
  /\bspace-[xy]-\d+\b/,
  // Flex direction / wrap — pick `<Stack>` vs `<Row>` instead.
  /\bflex-(?:row|col|wrap|nowrap)\b/,
  // Alignment — go through `align=…` / `justify=…`.
  /\bitems-(?:center|start|end|stretch|baseline)\b/,
  /\bjustify-(?:center|start|end|between|around|evenly)\b/,
  // Text size / weight — go through `size=…` / `weight=…`.
  /\btext-(?:xs|sm|base|lg|xl|\dxl)\b/,
  /\bfont-(?:light|normal|medium|semibold|bold)\b/,
  // Gradient utilities — go through the gradient variant on Section/Card/Text.
  /\bbg-gradient-to-(?:r|l|t|b|tr|tl|br|bl)\b/,
  /\bfrom-[a-z]+-\d+\b/,
  /\bto-[a-z]+-\d+\b/,
  /\bvia-[a-z]+-\d+\b/,
];

/**
 * Tags that are STRUCTURAL HTML but are allowed in consumer code only when
 * paired with their primitive replacement existing first. The audit treats
 * any usage of these tags outside primitive sources as a violation.
 *
 * Used by `audit-html-wrappers.mjs/RAW_*` rules.
 */
export const FORBIDDEN_RAW_TAGS = {
  // Layout
  div: "Div / Stack / Row / Grid / Container / Section",
  span: "Span",
  // Interactive
  button: "Button / IconButton",
  a: "TextLink (internal Next.js routes) or Anchor (external / mailto / tel)",
  // Forms
  form: "Form",
  input: "Input or FieldInput",
  textarea: "Textarea or FieldTextarea",
  select: "Select or FieldSelect",
  label: "Label",
  fieldset: "Fieldset",
  legend: "Legend",
  // Media
  img: "MediaImage",
  video: "MediaVideo",
  audio: "MediaAudio",
  picture: "MediaImage with `sources` prop",
  iframe: "Iframe",
  // Lists
  ul: "Ul",
  ol: "Ol",
  li: "Li",
  dl: "Dl",
  dt: "Dt",
  dd: "Dd",
  // Table
  table: "Table",
  thead: "Thead",
  tbody: "Tbody",
  tfoot: "Tfoot",
  tr: "Tr",
  th: "Th",
  td: "Td",
  // Semantic
  nav: "Nav",
  header: "BlockHeader",
  footer: "BlockFooter",
  main: "Main",
  aside: "Aside",
  article: "Article",
  section: "Section",
  // Inline
  kbd: "Kbd",
  q: "Quote",
  blockquote: "Quote (with `block` prop)",
  code: "Code",
  pre: "Pre",
  hr: "HorizontalRule",
  // Disclosure
  details: "Details",
  summary: "Summary",
  dialog: "Dialog (native) or Modal (portal)",
  // Figure
  figure: "Figure",
  figcaption: "Figcaption",
};

/**
 * Directory globs where raw HTML tags + raw utility className are legitimate
 * because the directory holds the primitive sources themselves OR ships
 * email markup that email clients (Gmail, Outlook) require to be table-based
 * + inline-styled. The audits skip these paths.
 */
export const PRIMITIVE_SOURCE_DIRS = [
  // appkit primitive sources — define the underlying utilities.
  /[\\/]appkit[\\/]src[\\/]ui[\\/]components[\\/]/,
  /[\\/]appkit[\\/]src[\\/]ui[\\/]forms[\\/]/,
  /[\\/]appkit[\\/]src[\\/]ui[\\/]rich-text[\\/]/,
  // appkit feature primitive directories.
  /[\\/]appkit[\\/]src[\\/]features[\\/]email[\\/]/,
  /[\\/]appkit[\\/]src[\\/]features[\\/]media[\\/]/,
  /[\\/]appkit[\\/]src[\\/]features[\\/]layout[\\/]/,
  // appkit internal scaffolds + layout features + theme.
  /[\\/]appkit[\\/]src[\\/]_internal[\\/]client[\\/]scaffolds[\\/]/,
  /[\\/]appkit[\\/]src[\\/]_internal[\\/]client[\\/]features[\\/]layout[\\/]/,
  /[\\/]appkit[\\/]src[\\/]_internal[\\/]client[\\/]theme[\\/]/,
  // Consumer dev-tool surfaces — diagnostic-only UI (SeedPanel inspector,
  // future devtools). Bespoke styling for status indicators, completion
  // bars, conditional emerald/amber/indigo state tints. Not user-facing;
  // not under the variant catalogue's strict-zero scope.
  /[\\/]src[\\/]components[\\/]dev[\\/]/,
];

/**
 * Suppression marker — same regex shape as `audit-inline-style-ok`. Permits
 * primitive-internal `className` that the audit must allow. Use sparingly
 * with a reason after the colon, on the same line or the previous line.
 */
export const VARIANT_OK_MARKER = /(?:\/\/|\{?\/\*)\s*audit-variant-ok(?::[^\n]*)?/;
