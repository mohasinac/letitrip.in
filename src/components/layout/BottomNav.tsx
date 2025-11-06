"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Grid3x3, ShoppingCart, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { id: "home", name: "Home", icon: Home, href: "/" },
    { id: "shops", name: "Shops", icon: Store, href: "/shops" },
    {
      id: "categories",
      name: "Categories",
      icon: Grid3x3,
      href: "/categories",
    },
    { id: "cart", name: "Cart", icon: ShoppingCart, href: "/cart" },
    { id: "account", name: "Account", icon: User, href: "/user/settings" },
  ];

  return (
    <nav
      id="bottom-navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
                isActive
                  ? "text-yellow-600"
                  : "text-gray-600 hover:text-yellow-600"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
