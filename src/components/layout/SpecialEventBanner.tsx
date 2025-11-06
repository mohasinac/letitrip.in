"use client";

import Link from "next/link";
import { SPECIAL_EVENT } from "@/constants/navigation";
import { X } from "lucide-react";
import { useState } from "react";
import { COLOR_CLASSES } from "@/constants/colors";

export default function SpecialEventBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={`${COLOR_CLASSES.background.gradient} text-gray-900 py-2 px-4 relative`}>
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm md:text-base">
        <Link
          href={SPECIAL_EVENT.link}
          className="hover:underline font-bold"
        >
          ⭐ {SPECIAL_EVENT.title}: {SPECIAL_EVENT.subtitle}
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/20 rounded p-1"
          aria-label="Close banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
