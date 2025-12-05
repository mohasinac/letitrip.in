/**
 * @fileoverview React Component
 * @module src/components/seller/product-edit-wizard/ReviewStep
 * @description This file contains the ReviewStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { Price } from "@/components/common/values/Price";
import type { StepProps } from "./types";

/**
 * Function: Review Step
 */
/**
 * Performs review step operation
 *
 * @param {StepProps} { formData } - The { form data }
 *
 * @returns {any} The reviewstep result
 *
 * @example
 * ReviewStep({ formData });
 */

/**
 * Performs review step operation
 *
 * @param {StepProps} { formData } - The { form data }
 *
 * @returns {any} The reviewstep result
 *
 * @example
 * ReviewStep({ formData });
 */

export function ReviewStep({ formData }: StepProps) {
  return (
    <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Name
        </dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
          {formData.name}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Price
        </dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
          <Price amount={formData.price} />
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Stock
        </dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white">
          {formData.stockCount}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Status
        </dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
          {formData.status}
        </dd>
      </div>
    </div>
  );
}

export default ReviewStep;
