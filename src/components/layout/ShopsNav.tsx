"use client";

import Link from "next/link";
import { SHOPS } from "@/constants/navigation";
import { ChevronRight } from "lucide-react";

export default function ShopsNav() {
  const displayShops = SHOPS.slice(0, 5);
  const moreShop = SHOPS.find((shop) => shop.id === "more");

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-6 overflow-x-auto">
          <Link
            href="/"
            className="text-gray-800 hover:text-yellow-700 font-bold whitespace-nowrap flex items-center gap-1"
          >
            Home
          </Link>

          {displayShops.map((shop) => (
            <Link
              key={shop.id}
              href={shop.link}
              className="text-gray-700 hover:text-yellow-700 whitespace-nowrap font-medium"
            >
              {shop.name}
            </Link>
          ))}

          {moreShop && (
            <Link
              href={moreShop.link}
              className="text-yellow-700 hover:text-yellow-800 font-bold whitespace-nowrap flex items-center gap-1"
            >
              {moreShop.name}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
