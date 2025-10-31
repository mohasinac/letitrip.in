"use client";

import {
  HeroSection,
  ThemeAwareBox,
} from "@/components/shared/ThemeAwareComponents";
import { ClientLinkButton } from "@/components/shared/ClientLinkButton";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function TermsPage() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Terms of Service",
      href: "/terms",
      active: true,
    },
  ]);

  return (
    <ThemeAwareBox>
      {/* Hero Section */}
      <HeroSection>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-white/90">
              Last updated: January 1, 2024
            </p>
          </div>
        </div>
      </HeroSection>

      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col gap-6">
            {[
              {
                title: "1. Acceptance of Terms",
                content: (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    By accessing and using JustForView.in (the "Service"), you
                    accept and agree to be bound by the terms and provision of
                    this agreement. If you do not agree to abide by the above,
                    please do not use this service.
                  </p>
                ),
              },
              {
                title: "2. Use License",
                content: (
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      Permission is granted to temporarily download one copy of
                      the materials on JustForView.in for personal,
                      non-commercial transitory viewing only. This is the grant
                      of a license, not a transfer of title, and under this
                      license you may not:
                    </p>
                    <ul className="pl-6 list-disc text-gray-600 dark:text-gray-300 space-y-2">
                      <li>modify or copy the materials</li>
                      <li>
                        use the materials for any commercial purpose or for any
                        public display (commercial or non-commercial)
                      </li>
                      <li>
                        attempt to decompile or reverse engineer any software
                        contained on JustForView.in
                      </li>
                      <li>
                        remove any copyright or other proprietary notations from
                        the materials
                      </li>
                    </ul>
                  </div>
                ),
              },
              {
                title: "3. Account Terms",
                content: (
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Account Creation:
                      </span>{" "}
                      You must provide accurate and complete information when
                      creating an account. You are responsible for maintaining
                      the security of your account and password.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Account Responsibility:
                      </span>{" "}
                      You are responsible for all activities that occur under
                      your account. You must notify us immediately of any
                      unauthorized use of your account.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Age Requirement:
                      </span>{" "}
                      You must be at least 18 years old to create an account and
                      make purchases.
                    </p>
                  </div>
                ),
              },
              {
                title: "4. Product Information and Availability",
                content: (
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      We strive to provide accurate product descriptions,
                      images, and pricing. However, we do not guarantee that
                      product descriptions or other content is accurate,
                      complete, reliable, current, or error-free.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      All products are subject to availability. We reserve the
                      right to discontinue any product at any time without
                      notice. Prices are subject to change without notice.
                    </p>
                  </div>
                ),
              },
              {
                title: "5. Orders and Payments",
                content: (
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Order Acceptance:
                      </span>{" "}
                      Your receipt of an email order confirmation does not
                      signify our acceptance of your order. We reserve the right
                      to accept or decline your order for any reason.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Pricing:
                      </span>{" "}
                      All prices are in Indian Rupees (INR) and include
                      applicable taxes unless otherwise stated.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Payment:
                      </span>{" "}
                      Payment must be made at the time of purchase through our
                      approved payment methods. We use secure payment processing
                      services.
                    </p>
                  </div>
                ),
              },
              {
                title: "6. Auction Terms",
                content: (
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Bidding:
                      </span>{" "}
                      By placing a bid, you agree to purchase the item at that
                      price if you are the winning bidder. All bids are final
                      and cannot be retracted.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Auction End:
                      </span>{" "}
                      Auctions end at the specified time. The highest bidder at
                      the end of the auction wins the item.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Payment:
                      </span>{" "}
                      Winning bidders must complete payment within 24 hours of
                      auction end.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Reserve Prices:
                      </span>{" "}
                      Some auctions may have reserve prices. If the reserve is
                      not met, the item will not be sold.
                    </p>
                  </div>
                ),
              },
            ].map((section, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
              >
                <div className="p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {section.title}
                  </h2>
                  {section.content}
                </div>
              </div>
            ))}

            {/* Navigation */}
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden mt-8">
              <div className="p-8">
                <div className="flex justify-between items-center">
                  <ClientLinkButton href="/" variant="outlined">
                    ← Back to Home
                  </ClientLinkButton>
                  <ClientLinkButton href="/privacy" variant="outlined">
                    Privacy Policy →
                  </ClientLinkButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeAwareBox>
  );
}
