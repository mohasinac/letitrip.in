"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, ShoppingCart, Gavel, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { cart } = useCart();

  const cartCount = cart?.itemCount || 0;

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.displayName || user.fullName || user.email;
    if (!name) return "U";
    const names = name.split(" ").filter((n: string) => n.length > 0);
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Get profile picture URL
  const getProfilePicture = () => {
    return user?.photoURL || null;
  };

  const navItems = [
    { id: "home", name: "Home", icon: Home, href: "/" },
    { id: "products", name: "Products", icon: ShoppingBag, href: "/products" },
    {
      id: "auctions",
      name: "Auctions",
      icon: Gavel,
      href: "/auctions",
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
      // Custom render for account with avatar
      href: isAuthenticated ? "/user" : "/login",
      isAccount: true,
    },
  ];

  return (
    <nav
      id="bottom-navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 shadow-lg pb-safe"
    >
      <div className="flex items-center justify-around h-16 overflow-x-auto scroll-smooth scrollbar-hide w-full">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.id === "account" && pathname.startsWith("/user"));

          // Special render for account with avatar
          if (item.isAccount) {
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 relative touch-target ${
                  isActive
                    ? "text-yellow-600 dark:text-yellow-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-500"
                }`}
              >
                <div className="relative">
                  {isAuthenticated && user ? (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center overflow-hidden ${
                        isActive ? "ring-2 ring-yellow-500" : ""
                      } ${getProfilePicture() ? "" : "bg-yellow-500"}`}
                    >
                      {getProfilePicture() ? (
                        <Image
                          src={getProfilePicture()!}
                          alt="Profile"
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-900 font-bold text-[10px]">
                          {getUserInitials()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 font-bold text-[10px]">
                        ?
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium">
                  {isAuthenticated ? "Profile" : "Sign In"}
                </span>
              </Link>
            );
          }

          const Icon = item.icon!;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 relative touch-target ${
                isActive
                  ? "text-yellow-600 dark:text-yellow-500"
                  : "text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-500"
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 animate-pulse">
                    {item.badge > 99 ? "99+" : item.badge}
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
