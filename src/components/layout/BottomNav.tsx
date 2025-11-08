"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Grid3x3, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { cart } = useCart();

  const cartCount = cart?.itemCount || 0;

  const navItems = [
    { id: "home", name: "Home", icon: Home, href: "/" },
    { id: "shops", name: "Shops", icon: Store, href: "/shops" },
    {
      id: "categories",
      name: "Categories",
      icon: Grid3x3,
      href: "/categories",
    },
    {
      id: "cart",
      name: "Cart",
      icon: ShoppingCart,
      href: "/cart",
      badge: cartCount,
    },
    {
      id: "account",
      name: "Account",
      icon: User,
      // If logged in, go to profile; otherwise, go to login
      href: isAuthenticated ? "/user" : "/login",
    },
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
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 relative ${
                isActive
                  ? "text-yellow-600"
                  : "text-gray-600 hover:text-yellow-600"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
