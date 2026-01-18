"use client";

import { useVirtualList } from "@letitrip/react-library";
import React from "react";

// Mock product data generator
function generateMockProducts(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `product-${i}`,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 10000) + 100,
    image: `https://picsum.photos/seed/${i}/400/300`,
    rating: Math.floor(Math.random() * 5) + 1,
    shopName: `Shop ${Math.floor(Math.random() * 100) + 1}`,
  }));
}

export default function VirtualScrollDemo() {
  const [itemCount, setItemCount] = React.useState(1000);
  const [products] = React.useState(() => generateMockProducts(itemCount));

  const { virtualItems, totalSize, parentRef, scrollToIndex } = useVirtualList({
    count: products.length,
    estimateSize: 120, // Estimated height of each product card
    overscan: 5,
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Virtual Scrolling Demo</h1>
          <p className="text-gray-600">
            Rendering {itemCount} items with virtual scrolling
          </p>
        </div>

        <div className="flex gap-4">
          <div>
            <label className="mr-2">Item Count:</label>
            <select
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="rounded border border-gray-300 px-3 py-1"
            >
              <option value="100">100 items</option>
              <option value="500">500 items</option>
              <option value="1000">1,000 items</option>
              <option value="5000">5,000 items</option>
              <option value="10000">10,000 items</option>
            </select>
          </div>

          <button
            onClick={() =>
              scrollToIndex(Math.floor(products.length / 2), {
                align: "center",
              })
            }
            className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
          >
            Jump to Middle
          </button>

          <button
            onClick={() => scrollToIndex(0, { align: "start" })}
            className="rounded bg-gray-600 px-4 py-1 text-white hover:bg-gray-700"
          >
            Back to Top
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div
          ref={parentRef}
          className="h-[600px] overflow-auto"
          style={{ contain: "strict" }}
        >
          <div
            style={{
              height: `${totalSize}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualItem) => {
              const product = products[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="flex gap-4 border-b border-gray-200 p-3 hover:bg-gray-50">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {product.shopName}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-yellow-600">
                          {"⭐".repeat(product.rating)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500">
                        #{virtualItem.index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Performance:</strong> Only rendering {virtualItems.length}{" "}
            items out of {products.length} total
          </p>
          <p className="mt-1">
            <strong>Visible range:</strong> Items{" "}
            {virtualItems[0]?.index + 1 || 0} to{" "}
            {virtualItems[virtualItems.length - 1]?.index + 1 || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
