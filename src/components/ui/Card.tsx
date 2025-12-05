/**
 * @fileoverview React Component
 * @module src/components/ui/Card
 * @description This file contains the Card component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";

/**
 * CardProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CardProps
 */
export interface CardProps {
  /** Children */
  children: React.ReactNode;
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Header Action */
  headerAction?: React.ReactNode;
  /** Class Name */
  className?: string;
  /** No Padding */
  noPadding?: boolean;
}

/**
 * Performs card operation
 *
 * @returns {any} The card result
 *
 * @example
 * Card();
 */

/**
 * C
 * @constant
 */
/**
 * Performs card operation
 *
 * @returns {any} The card result
 *
 * @example
 * Card();
 */

/**
 * C
 * @constant
 */
export const Card: React.FC<CardProps> = ({
  children,
  title,
  description,
  headerAction,
  className = "",
  noPadding = false,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {(title || description || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            {headerAction && <div className="ml-4">{headerAction}</div>}
          </div>
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
};

/**
 * CardSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for CardSectionProps
 */
export interface CardSectionProps {
  /** Children */
  children: React.ReactNode;
  /** Title */
  title?: string;
  /** Description */
  description?: string;
  /** Class Name */
  className?: string;
}

/**
 * Performs card section operation
 *
 * @returns {any} The cardsection result
 *
 * @example
 * CardSection();
 */

/**
 * C
 * @constant
 */
/**
 * Performs card section operation
 *
 * @returns {any} The cardsection result
 *
 * @example
 * CardSection();
 */

/**
 * C
 * @constant
 */
export const CardSection: React.FC<CardSectionProps> = ({
  children,
  title,
  description,
  className = "",
}) => {
  return (
    <div className={className}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
