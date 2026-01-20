"use client";

import { ClientLink } from "@/components/common/ClientLink";
import {
  AdvertisementBanner,
  Footer,
  Header,
  MobileNavigation,
} from "@letitrip/react-library";
import {
  CreditCard,
  Gavel,
  Headphones,
  Home,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  TruckIcon,
  User,
} from "lucide-react";
import { ReactNode } from "react";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <>
      {/* Advertisement Banner */}
      <AdvertisementBanner
        LinkComponent={ClientLink}
        content="🎉 Grand Sale! Up to 50% off on all products"
        ctaText="Shop Now"
        ctaHref="/deals"
        isDismissible={true}
      />

      {/* Header */}
      <Header
        LinkComponent={ClientLink}
        logo={{
          src: "/logo.svg",
          alt: "LetItRip",
          href: "/",
          isSvg: true,
        }}
        navItems={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: "Categories", href: "/categories" },
          { label: "Auctions", href: "/auctions" },
          { label: "Shops", href: "/shops" },
        ]}
        icons={{
          search: Search,
          cart: ShoppingCart,
          user: User,
          menu: Menu,
        }}
        cartItemCount={0}
      />

      {/* Main Content */}
      <main className="min-h-screen">{children}</main>

      {/* Footer */}
      <Footer
        LinkComponent={ClientLink}
        linkSections={[
          {
            title: "Shop",
            links: [
              { label: "All Products", href: "/products" },
              { label: "Categories", href: "/categories" },
              { label: "Auctions", href: "/auctions" },
              { label: "Shops", href: "/shops" },
            ],
          },
          {
            title: "Account",
            links: [
              { label: "My Account", href: "/account" },
              { label: "Orders", href: "/orders" },
              { label: "Wishlist", href: "/wishlist" },
              { label: "Cart", href: "/cart" },
            ],
          },
          {
            title: "Information",
            links: [
              { label: "About Us", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "FAQ", href: "/faq" },
              { label: "Help Center", href: "/help" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Terms of Service", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Refund Policy", href: "/refunds" },
              { label: "Shipping Policy", href: "/shipping" },
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
        currentPath="/"
        items={[
          { label: "Home", href: "/", icon: Home },
          { label: "Products", href: "/products", icon: Package },
          { label: "Auctions", href: "/auctions", icon: Gavel },
          { label: "Shops", href: "/shops", icon: Store },
          { label: "Cart", href: "/cart", icon: ShoppingCart, badge: 0 },
        ]}
      />
    </>
  );
}
