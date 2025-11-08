import { Metadata } from "next";
import { Suspense } from "react";
import ReviewsListClient from "./ReviewsListClient";

export const metadata: Metadata = {
  title: "Customer Reviews | JustForView.in",
  description:
    "Read authentic customer reviews and ratings for products on JustForView.in. Verified purchases and honest feedback.",
};

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <ReviewsListClient />
      </Suspense>
    </main>
  );
}
