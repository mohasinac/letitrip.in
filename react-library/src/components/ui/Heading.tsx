import React from "react";
import { cn } from "../../utils/cn";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  as?: HeadingTag;
  children: React.ReactNode;
}

const sizeClasses: Record<HeadingLevel, string> = {
  1: "text-3xl md:text-4xl font-bold",
  2: "text-2xl md:text-3xl font-bold",
  3: "text-xl md:text-2xl font-semibold",
  4: "text-lg md:text-xl font-semibold",
  5: "text-base md:text-lg font-medium",
  6: "text-sm md:text-base font-medium",
};

/**
 * Heading - Consistent heading component with responsive sizes
 *
 * Features:
 * - Semantic heading levels (h1-h6)
 * - Responsive font sizes
 * - Dark mode support
 * - Override tag with `as` prop
 *
 * @example
 * <Heading level={1}>Page Title</Heading>
 * <Heading level={2}>Section Title</Heading>
 * <Heading level={3} as="h2">Visually h3, semantically h2</Heading>
 */
export const Heading: React.FC<HeadingProps> = ({
  level = 2,
  as,
  children,
  className,
  ...props
}) => {
  const Tag = as || (`h${level}` as HeadingTag);

  return (
    <Tag
      className={cn(
        sizeClasses[level],
        "text-gray-900 dark:text-white",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Heading;
