import { Metadata } from "next";
import { Suspense } from "react";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "Blog | JustForView.in",
  description:
    "Read the latest articles, guides, and updates about collectibles, auctions, and more from JustForView.in",
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense
        fallback={
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        }
      >
        <BlogListClient />
      </Suspense>
    </main>
  );
}
