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
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "LetItRip - Modern Auction & E-commerce Platform",
  description:
    "Discover amazing deals on products and auctions. Shop from verified sellers, bid on unique items, and enjoy a seamless shopping experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {/* Advertisement Banner */}
          <AdvertisementBanner
            LinkComponent={ClientLink}
            content="🎉 Welcome to LetItRip! New Year Sale - Get 50% off on all products"
            ctaText="Shop Now"
            ctaHref="/products"
            backgroundColor="#1e40af"
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
                  { label: "My Orders", href: "/user/orders" },
                  { label: "Favorites", href: "/user/favorites" },
                  { label: "Settings", href: "/user/settings" },
                  { label: "Messages", href: "/user/messages" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "FAQ", href: "/faq" },
                  { label: "Contact Us", href: "/support" },
                  { label: "Shipping Info", href: "/shipping" },
                  { label: "Returns", href: "/returns" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "About Us", href: "/about" },
                  { label: "Careers", href: "/careers" },
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
        </Providers>
      </body>
    </html>
  );
}
