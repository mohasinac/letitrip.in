"use client";

import BeybladeSpinner from "@/components/shared/BeybladeSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-theme-background flex flex-col justify-center items-center">
      <div className="text-center">
        <BeybladeSpinner
          size="lg"
          text="Loading your adventure..."
          className="mb-8"
        />

        {/* Progress dots animation with theme colors */}
        <div className="mt-4 flex justify-center space-x-1">
          <div
            className="w-2 h-2 bg-theme-primary rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-theme-secondary rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-theme-accent rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
