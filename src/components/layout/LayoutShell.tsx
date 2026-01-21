"use client";

import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ROUTES } from "@/constants/routes";
import {
  AdvertisementBanner,
  ClientLink,
  Footer,
  MobileNavigation,
} from "@mohasinac/react-library";
import {
  CreditCard,
  Gavel,
  Headphones,
  Home,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  TruckIcon,
  User,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: ROUTES.HOME, isActive: pathname === ROUTES.HOME },
    {
      label: "Products",
      href: ROUTES.PRODUCTS.LIST,
      isActive: pathname?.startsWith("/product"),
    },
    {
      label: "Categories",
      href: ROUTES.CATEGORIES.LIST,
      isActive: pathname?.startsWith("/categories"),
    },
    {
      label: "Auctions",
      href: ROUTES.AUCTIONS.LIST,
      isActive: pathname?.startsWith("/auction"),
    },
    {
      label: "Shops",
      href: ROUTES.SHOPS.LIST,
      isActive: pathname?.startsWith("/shops"),
    },
  ];

  return (
    <>
      {/* Advertisement Banner */}
      <AdvertisementBanner
        LinkComponent={ClientLink}
        content="🎉 Grand Sale! Up to 50% off on all products"
        ctaText="Shop Now"
        ctaHref={ROUTES.DEALS}
        isDismissible={true}
      />

      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <ClientLink href={ROUTES.HOME} className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                LetItRip
              </span>
            </ClientLink>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <ClientLink
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    item.isActive
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {item.label}
                </ClientLink>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Search className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
              <ThemeToggle />
              <ClientLink
                href={ROUTES.CART}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </ClientLink>
              <ClientLink
                href={ROUTES.USER.PROFILE}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </ClientLink>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen">{children}</main>

      {/* Footer */}
      <Footer
        LinkComponent={ClientLink}
        linkSections={[
          {
            title: "Shop",
            links: [
              { label: "All Products", href: ROUTES.PRODUCTS.LIST },
              { label: "Categories", href: ROUTES.CATEGORIES.LIST },
              { label: "Auctions", href: ROUTES.AUCTIONS.LIST },
              { label: "Shops", href: ROUTES.SHOPS.LIST },
            ],
          },
          {
            title: "Account",
            links: [
              { label: "My Account", href: ROUTES.USER.PROFILE },
              { label: "Orders", href: ROUTES.USER.ORDERS },
              { label: "Wishlist", href: ROUTES.USER.WISHLIST },
              { label: "Cart", href: ROUTES.CART },
            ],
          },
          {
            title: "Information",
            links: [
              { label: "About Us", href: ROUTES.ABOUT },
              { label: "Contact", href: ROUTES.CONTACT },
              { label: "FAQ", href: ROUTES.FAQ },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Terms of Service", href: ROUTES.TERMS },
              { label: "Privacy Policy", href: ROUTES.PRIVACY },
            ],
          },
        ]}
        partnerLogos={[
          { icon: ShoppingBag, label: "Secure Shopping" },
          { icon: TruckIcon, label: "Fast Delivery" },
          { icon: CreditCard, label: "Safe Payments" },
          { icon: Headphones, label: "24/7 Support" },
        ]}
        copyright="© 2026 LetItRip. All rights reserved."
      />

      {/* Mobile Navigation */}
      <MobileNavigation
        LinkComponent={ClientLink}
        currentPath={ROUTES.HOME}
        items={[
          { label: "Home", href: ROUTES.HOME, icon: Home },
          { label: "Products", href: ROUTES.PRODUCTS.LIST, icon: Package },
          { label: "Auctions", href: ROUTES.AUCTIONS.LIST, icon: Gavel },
          { label: "Shops", href: ROUTES.SHOPS.LIST, icon: Store },
          { label: "Cart", href: ROUTES.CART, icon: ShoppingCart, badge: 0 },
        ]}
      />
    </>
  );
}
