/**
 * About Us Page
 *
 * Information about Let It Rip platform, mission, vision, and team.
 *
 * @page /about - About us page
 */

import { ROUTES } from "@/constants/routes";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "About Us - India's Premier Auction & E-Commerce Platform | Let It Rip",
  description:
    "Discover Let It Rip - India's most trusted online marketplace since 2025. Learn about our mission to revolutionize e-commerce, our values, achievements, and commitment to connecting buyers & sellers nationwide. 100% authentic products, verified sellers, secure transactions.",
  keywords: [
    "about Let It Rip",
    "Indian e-commerce platform",
    "online auction marketplace India",
    "trusted online shopping",
    "authentic products India",
    "verified sellers",
    "company mission",
    "our story",
  ],
  openGraph: {
    title: "About Let It Rip | India's Trusted Marketplace",
    description:
      "Empowering buyers and sellers across India with a secure, innovative platform for e-commerce and auctions since 2025",
  },
};

export default function AboutPage() {
  const stats = [
    { label: "Active Users", value: "100K+", icon: "👥" },
    { label: "Products Listed", value: "50K+", icon: "📦" },
    { label: "Successful Sales", value: "1M+", icon: "✅" },
    { label: "Cities Covered", value: "200+", icon: "🏙️" },
  ];

  const features = [
    {
      title: "Wide Product Range",
      description:
        "From electronics to fashion, home goods to collectibles - find everything you need in one place",
      icon: "🛍️",
    },
    {
      title: "Exciting Auctions",
      description:
        "Participate in live auctions and bid on products to get amazing deals and rare finds",
      icon: "⚡",
    },
    {
      title: "Verified Sellers",
      description:
        "All sellers undergo strict KYC verification to ensure authenticity and trustworthiness",
      icon: "✓",
    },
    {
      title: "Secure Payments",
      description:
        "Multiple payment options with bank-level security and PCI-DSS compliance",
      icon: "🔒",
    },
    {
      title: "Fast Shipping",
      description:
        "Reliable delivery to 200+ cities across India with real-time tracking",
      icon: "🚚",
    },
    {
      title: "Easy Returns",
      description:
        "Hassle-free 7-14 day returns on most products with full refund guarantee",
      icon: "↩️",
    },
  ];

  const milestones = [
    { year: "2025", event: "Let It Rip Founded - Platform Launch" },
    { year: "2025", event: "Reached 10,000 Active Users" },
    { year: "2025", event: "100,000+ Products Listed" },
    { year: "2026", event: "Expanded to 200+ Cities" },
    { year: "2026", event: "1 Million+ Successful Transactions" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-6">
              <span className="text-primary font-semibold">Since 2025</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              About Let It Rip
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              India's Premier Auction & E-Commerce Platform
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto">
              Empowering buyers and sellers across India with a secure,
              innovative, and thrilling marketplace. We combine traditional
              e-commerce with exciting auction features to create a unique
              shopping experience.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-8 rounded-2xl">
                <div className="text-4xl mb-4">🎯</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  To democratize e-commerce in India by providing a transparent,
                  secure, and exciting platform where every buyer finds value
                  and every seller achieves success. We're committed to making
                  quality products accessible nationwide while empowering
                  entrepreneurs to grow their businesses without barriers.
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-8 rounded-2xl">
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Vision
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  To become India's most trusted and innovative marketplace,
                  where every transaction creates value for all parties. We
                  envision a future where online shopping isn't just
                  convenient—it's thrilling, rewarding, and builds lasting
                  relationships between buyers and sellers across the nation.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                Our Core Values
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                These principles guide everything we do and drive us to deliver
                excellence every day
              </p>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🛡️</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Trust & Security
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Every seller verified, every transaction secured with
                    bank-level encryption
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💡</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Innovation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Constantly evolving with new features and improved user
                    experience
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Customer First
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your satisfaction and success drive every decision we make
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🌟</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Integrity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Transparent operations, honest dealings, and ethical
                    practices always
                  </p>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                Why Choose Let It Rip?
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                We offer unique features that make shopping and selling easier,
                safer, and more exciting
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Our Journey/Milestones */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                Our Journey
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                Key milestones in our mission to transform Indian e-commerce
              </p>
              <div className="max-w-3xl mx-auto">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6 mb-8 last:mb-0">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {milestone.year}
                      </div>
                    </div>
                    <div className="flex-grow pt-3">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {milestone.event}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-2xl p-12 mb-20">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Get In Touch
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Have questions? We'd love to hear from you. Our team is always
                  ready to help.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📧</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Email
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    support@letitrip.in
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📞</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Phone
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    +91-XXXXX-XXXXX
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📍</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Location
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Mumbai, India
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Join Our Community?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Whether you're looking to discover amazing products or grow your
                business by reaching thousands of customers, Let It Rip is your
                perfect partner
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={ROUTES.PRODUCTS.LIST}
                  className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition text-center"
                >
                  Start Shopping Now
                </Link>
                <Link
                  href={ROUTES.SELLER.DASHBOARD}
                  className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary/10 font-semibold rounded-lg transition text-center"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
