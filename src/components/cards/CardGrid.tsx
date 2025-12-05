/**
 * @fileoverview React Component
 * @module src/components/cards/CardGrid
 * @description This file contains the CardGrid component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import React from "react";

/**
 * CardGridProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CardGridProps
 */
export interface CardGridProps {
  /** Children */
  children: React.ReactNode;
  /** Columns */
  columns?: {
    /** Xs */
    xs?: number;
    /** Sm */
    sm?: number;
    /** Md */
    md?: number;
    /** Lg */
    lg?: number;
    /** Xl */
    xl?: number;
  };
  /** Gap */
  gap?: "sm" | "md" | "lg";
  /** Class Name */
  className?: string;
}

/**
 * Performs card grid operation
 *
 * @returns {any} The cardgrid result
 *
 * @example
 * CardGrid();
 */

/**
 * C
 * @constant
 */
/**
 * Performs card grid operation
 *
 * @returns {any} The cardgrid result
 *
 * @example
 * CardGrid();
 */

/**
 * C
 * @constant
 */
export const CardGrid: React.FC<CardGridProps> = ({
  children,
  columns = {
    /** Xs */
    xs: 1,
    /** Sm */
    sm: 2,
    /** Md */
    md: 3,
    /** Lg */
    lg: 4,
    /** Xl */
    xl: 4,
  },
  gap = "md",
  className = "",
}) => {
  const gapClasses = {
    /** Sm */
    sm: "gap-2",
    /** Md */
    md: "gap-4",
    /** Lg */
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
