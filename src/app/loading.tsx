"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <Loader2 className="h-15 w-15 animate-spin text-blue-600 mx-auto mb-8" />

        <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-8">
          Loading your adventure...
        </h2>

        {/* Progress dots animation */}
        <div className="flex justify-center gap-2">
          {[0, 150, 300].map((delay, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full animate-bounce ${
                index === 0
                  ? "bg-blue-600"
                  : index === 1
                  ? "bg-purple-600"
                  : "bg-green-600"
              }`}
              style={{
                animationDelay: `${delay}ms`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
