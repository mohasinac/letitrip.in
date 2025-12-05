/**
 * @fileoverview Utility Functions
 * @module src/lib/utils
 * @description This file contains utility functions for utils
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
/**
 * Performs cn operation
 *
 * @param {ClassValue[]} ...inputs - The ...inputs
 *
 * @returns {any} The cn result
 *
 * @example
 * cn(...inputs);
 */

/**
 * Performs cn operation
 *
 * @param {ClassValue[]} ...inputs - The ...inputs
 *
 * @returns {any} The cn result
 *
 * @example
 * cn(...inputs);
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
