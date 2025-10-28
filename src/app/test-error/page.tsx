"use client";

import { useState } from "react";

export default function TestErrorPage() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("This is a test error to demonstrate the error page");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Error Page Test
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Click the button below to trigger an error and see the themed error
          page.
        </p>
        <button
          onClick={() => setShouldError(true)}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
        >
          Trigger Error
        </button>
      </div>
    </div>
  );
}
