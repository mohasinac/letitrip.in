import { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ShoppingBag,
  Search,
  Heart,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

export const metadata: Metadata = {
  title: "New Users' Guide | Let It Rip",
  description:
    "Complete guide for new users to get started with Let It Rip auction platform",
};

export default function NewUserGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            New Users' Guide
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Welcome to Let It Rip! This guide will help you get started with
            buying and bidding on our platform.
          </p>

          {/* Step by Step Guide */}
          <div className="space-y-8">
            <GuideSection
              icon={<BookOpen className="w-6 h-6" />}
              title="1. Create Your Account"
              description="Sign up with your email address and create a secure password. You'll need to verify your email before you can start shopping."
            />

            <GuideSection
              icon={<Search className="w-6 h-6" />}
              title="2. Browse Products & Auctions"
              description="Explore our wide range of products and active auctions. Use filters to find exactly what you're looking for."
              links={[
                { label: "Browse Products", href: "/products" },
                { label: "View Auctions", href: "/auctions" },
                { label: "Explore Categories", href: "/categories" },
              ]}
            />

            <GuideSection
              icon={<Heart className="w-6 h-6" />}
              title="3. Add to Watchlist & Favorites"
              description="Found something you like? Add it to your watchlist to track auctions or save products to favorites for later."
            />

            <GuideSection
              icon={<ShoppingCart className="w-6 h-6" />}
              title="4. Shopping & Bidding"
              description="For regular products, add them to cart and checkout. For auctions, place bids and track your bidding history."
              links={[
                { label: "My Cart", href: "/cart" },
                { label: "My Bids", href: "/user/bids" },
              ]}
            />

            <GuideSection
              icon={<CreditCard className="w-6 h-6" />}
              title="5. Secure Payment"
              description="We support multiple payment methods including credit/debit cards, UPI, and net banking. All transactions are secure and encrypted."
              links={[{ label: "Payment Methods", href: "/fees/payment" }]}
            />

            <GuideSection
              icon={<ShoppingBag className="w-6 h-6" />}
              title="6. Track Your Orders"
              description="Monitor your order status, track shipments, and manage returns from your user dashboard."
              links={[
                { label: "My Orders", href: "/user/orders" },
                { label: "Returns Guide", href: "/guide/returns" },
              ]}
            />
          </div>

          {/* Tips Section */}
          <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Pro Tips
            </h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-1">
                  •
                </span>
                <span>
                  Set up email notifications to get alerts for auction endings
                  and new listings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-1">
                  •
                </span>
                <span>
                  Read seller ratings and reviews before making a purchase
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-1">
                  •
                </span>
                <span>
                  Check our prohibited items list before listing anything for
                  sale
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 mt-1">
                  •
                </span>
                <span>
                  Contact support if you have any questions - we're here to
                  help!
                </span>
              </li>
            </ul>
          </div>

          {/* Need Help */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Need more help?
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/faq"
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                Read FAQ
              </Link>
              <Link
                href="/support/ticket"
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideSection({
  icon,
  title,
  description,
  links,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  links?: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center text-yellow-600 dark:text-yellow-400">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-3">{description}</p>
        {links && links.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
