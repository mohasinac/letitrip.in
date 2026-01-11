import { Metadata } from "next";
import { Building2, Users, Target, Award, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Company Overview | Let It Rip",
  description:
    "Learn about Let It Rip - India's premier auction and e-commerce platform",
};

export default function CompanyOverviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              LET IT RIP
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              India's Premier Auction & E-commerce Platform
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Since 2015</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>1M+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Trusted Platform</span>
              </div>
            </div>
          </div>

          {/* About Us */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About Us
            </h2>
            <div className="prose max-w-none text-gray-700 dark:text-gray-300">
              <p className="mb-4">
                Let It Rip is India's leading auction and e-commerce platform,
                connecting millions of buyers and sellers across the country.
                Founded in 2015, we've revolutionized the way Indians buy and
                sell products online, offering a secure, transparent, and
                exciting marketplace.
              </p>
              <p className="mb-4">
                Our platform combines the thrill of live auctions with the
                convenience of traditional e-commerce, creating a unique
                shopping experience. Whether you're looking for collectibles,
                electronics, fashion, or everyday items, Let It Rip offers an
                unparalleled selection and competitive prices.
              </p>
              <p>
                With advanced technology, robust security measures, and
                dedicated customer support, we ensure that every transaction is
                safe and seamless. Our commitment to innovation and customer
                satisfaction has made us the preferred choice for millions of
                Indians.
              </p>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Our Mission
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                To democratize commerce by providing a platform where anyone can
                buy and sell with confidence, transparency, and ease. We aim to
                create economic opportunities for sellers while offering buyers
                access to quality products at fair prices.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Our Vision
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                To become the most trusted and innovative marketplace in India,
                where every transaction creates value and every user feels
                empowered. We envision a future where online commerce is
                accessible, secure, and beneficial for all.
              </p>
            </div>
          </section>

          {/* Core Values */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Core Values
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <ValueCard
                title="Trust & Transparency"
                description="We believe in open communication and honest dealings. Every transaction is transparent, and we maintain the highest standards of integrity."
                emoji="🤝"
              />
              <ValueCard
                title="Innovation"
                description="We continuously innovate to improve user experience, implementing cutting-edge technology to make buying and selling easier and more secure."
                emoji="💡"
              />
              <ValueCard
                title="Customer First"
                description="Our users are at the heart of everything we do. We listen to feedback and constantly improve our platform to meet their needs."
                emoji="❤️"
              />
            </div>
          </section>

          {/* Statistics */}
          <section className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Our Impact
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard value="1M+" label="Active Users" />
              <StatCard value="50K+" label="Sellers" />
              <StatCard value="10M+" label="Products Listed" />
              <StatCard value="₹500Cr+" label="Annual GMV" />
            </div>
          </section>

          {/* Contact */}
          <section className="border-t dark:border-gray-700 pt-8">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-8 h-8 text-gray-700 dark:text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Get in Touch
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  General Inquiries
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Email: info@letitrip.com
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Phone: +91 1800-123-4567 (Toll-free)
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  Email: support@letitrip.com
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <a
                    href="/support/ticket"
                    className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                  >
                    Submit a Support Ticket →
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href="/about"
                className="inline-block px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold"
              >
                Learn More About Our Story
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ValueCard({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji: string;
}) {
  return (
    <div className="border dark:border-gray-700 rounded-lg p-5">
      <div className="text-4xl mb-3">{emoji}</div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  );
}
