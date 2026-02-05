/**
 * Text Component
 * Simple text wrapper for inline text elements
 */

import React from "react";

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function Text({ className = "", children, ...props }: TextProps) {
  return (
    <span className={className} {...props}>
      {children}
    </span>
  );
}

export default Text;
