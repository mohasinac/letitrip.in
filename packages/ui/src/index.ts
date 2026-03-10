// ─── Semantic HTML wrappers ───────────────────────────────────────────────────
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
} from "./components/Semantic";
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
} from "./components/Semantic";

// ─── Typography primitives ────────────────────────────────────────────────────
export { Heading, Text, Label, Caption, Span } from "./components/Typography";

// ─── Loading / Feedback ───────────────────────────────────────────────────────
export type { SpinnerProps } from "./components/Spinner";
export { Spinner } from "./components/Spinner";

export type { SkeletonProps } from "./components/Skeleton";
export { Skeleton } from "./components/Skeleton";

// ─── Interactive ──────────────────────────────────────────────────────────────
export type { ButtonProps } from "./components/Button";
export { Button } from "./components/Button";

export type { BadgeProps, BadgeVariant } from "./components/Badge";
export { Badge } from "./components/Badge";

// ─── Feedback ─────────────────────────────────────────────────────────────────
export type { AlertProps } from "./components/Alert";
export { Alert } from "./components/Alert";

// ─── Layout helpers ───────────────────────────────────────────────────────────
export type { DividerProps } from "./components/Divider";
export { Divider } from "./components/Divider";

// ─── Progress ─────────────────────────────────────────────────────────────────
export type {
  ProgressProps,
  IndeterminateProgressProps,
} from "./components/Progress";
export { Progress, IndeterminateProgress } from "./components/Progress";
