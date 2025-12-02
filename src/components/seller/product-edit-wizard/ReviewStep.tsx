"use client";

import { Price } from "@/components/common/values";
import type { StepProps } from "./types";

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
