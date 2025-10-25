"use client";

import { Squares2X2Icon } from "@heroicons/react/24/outline";

export default function SellerAllProducts() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-primary">All Products</h3>
        <p className="text-secondary">
          View and manage all your products in one place.
        </p>
      </div>

      <div className="text-center py-12 text-muted">
        <Squares2X2Icon className="h-12 w-12 mx-auto mb-4" />
        <p>Product listing coming soon...</p>
        <p className="text-sm">View, edit, and manage all your products</p>
      </div>
    </div>
  );
}
