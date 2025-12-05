/**
 * @fileoverview React Component
 * @module src/components/common/ErrorInitializer
 * @description This file contains the ErrorInitializer component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect } from "react";
import { initErrorHandlers } from "@/lib/firebase-error-logger";

/**
 * Initialize Firebase error handlers on client side
 */
/**
 * Performs error initializer operation
 *
 * @returns {void} Function return value
 *
 * @example
 * const result = ErrorInitializer();
 */
export default /**
 * Performs error initializer operation
 *
 * @returns {any} The errorinitializer result
 *
 */
function ErrorInitializer() {
  useEffect(() => {
    initErrorHandlers();
  }, []);

  return null;
}
