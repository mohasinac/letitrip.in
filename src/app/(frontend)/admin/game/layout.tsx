"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: "Beyblades", href: "/admin/game/beyblades", icon: "🎮" },
    { name: "Stadiums", href: "/admin/game/stadiums", icon: "🏟️" },
    { name: "Stats", href: "/admin/game/stats", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-6 py-4 font-semibold text-sm transition-colors border-b-2 ${
                    isActive
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
