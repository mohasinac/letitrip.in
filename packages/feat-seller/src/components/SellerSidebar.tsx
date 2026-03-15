import React from "react";

export interface SellerNavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface SellerSidebarProps {
  items: SellerNavItem[];
  activeHref: string;
  storeName?: string;
  storeLogoURL?: string;
  className?: string;
}

export function SellerSidebar({
  items,
  activeHref,
  storeName,
  storeLogoURL,
  className = "",
}: SellerSidebarProps) {
  return (
    <aside
      className={`w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col ${className}`}
    >
      {storeName && (
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          {storeLogoURL ? (
            <img
              src={storeLogoURL}
              alt={storeName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
              {storeName[0]?.toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-gray-900 text-sm truncate">
            {storeName}
          </span>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {items.map((item) => {
            const isActive = activeHref === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon && (
                    <span className="shrink-0 text-[1.1rem]">{item.icon}</span>
                  )}
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="shrink-0 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
