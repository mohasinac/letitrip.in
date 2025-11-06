"use client";

import Link from "next/link";
import { FEATURED_CATEGORIES } from "@/constants/navigation";
import {
  Layers,
  Heart,
  Gem,
  Mountain,
  Headphones,
  Gamepad2,
  Shirt,
  Music,
  Package,
  ShoppingBag,
} from "lucide-react";

const iconMap: Record<string, any> = {
  layers: Layers,
  heart: Heart,
  gem: Gem,
  mountain: Mountain,
  headphones: Headphones,
  "gamepad-2": Gamepad2,
  shirt: Shirt,
  music: Music,
  package: Package,
  "shopping-bag": ShoppingBag,
};

export default function FeaturedCategories() {
  return (
    <div className="bg-white border-b py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {FEATURED_CATEGORIES.map((category) => {
            const Icon = iconMap[category.icon] || Package;
            return (
              <Link
                key={category.id}
                href={category.link}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                  <Icon className="w-8 h-8 text-yellow-700" />
                </div>
                <span className="text-xs text-gray-800 text-center group-hover:text-yellow-700 font-medium">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
