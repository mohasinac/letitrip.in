"use client";

import React from "react";

export interface CardGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
  },
  gap = "md",
  className = "",
}) => {
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const columnClasses = [
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`grid ${columnClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};
