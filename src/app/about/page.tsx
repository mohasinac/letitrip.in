"use client";

import Link from "next/link";
import {
  CheckCircle,
  TrendingUp,
  Users,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function AboutPage() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "About",
      href: "/about",
      active: true,
    },
  ]);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 py-16 md:py-24 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              About JustForView
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-white/90">
              Your trusted destination for authentic hobby products, rare
              collectibles, and premium gaming accessories since 2020.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Our Story
              </h2>
              <div className="space-y-4">
                <p className="text-base text-gray-600 dark:text-gray-400">
                  JustForView was born from a passion for authentic hobby
                  products and the frustration of finding genuine items in the
                  market. What started as a small collection grew into India's
                  premier destination for Beyblades, collectibles, and gaming
                  accessories.
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  We understand the excitement of unboxing a new product, the
                  thrill of finding that rare item you've been searching for,
                  and the importance of authenticity in collectibles. That's why
                  we've built our entire business around these core values.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="h-80 bg-gradient-to-br from-blue-600/20 to-blue-600/10 dark:from-blue-700/20 dark:to-blue-700/10 flex items-center justify-center">
                  <h4 className="text-3xl text-blue-600 dark:text-blue-400 font-semibold">
                    Our Journey
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 text-center rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Our Mission
              </h4>
              <p className="text-base text-gray-600 dark:text-gray-400">
                To provide authentic, high-quality hobby products while building
                a passionate community of collectors and enthusiasts across
                India.
              </p>
            </div>

            <div className="p-8 text-center rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Our Vision
              </h4>
              <p className="text-base text-gray-600 dark:text-gray-400">
                To become the most trusted and comprehensive platform for hobby
                enthusiasts, expanding globally while maintaining our commitment
                to authenticity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-4xl text-center mb-12 font-bold text-gray-900 dark:text-white">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="h-10 w-10" />,
                title: "Authenticity",
                description:
                  "Every product is 100% genuine and verified. We work directly with authorized distributors and brands to ensure authenticity.",
                color: "#00c851",
              },
              {
                icon: <Users className="h-10 w-10" />,
                title: "Community",
                description:
                  "We're more than a store - we're a community. We connect enthusiasts, share knowledge, and celebrate the passion for collecting.",
                color: "#0095f6",
              },
              {
                icon: <Star className="h-10 w-10" />,
                title: "Excellence",
                description:
                  "From product quality to customer service, we strive for excellence in everything we do. Your satisfaction is our priority.",
                color: "#ff6900",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="p-8 text-center rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: `${value.color}20`,
                    color: value.color,
                  }}
                >
                  {value.icon}
                </div>
                <h5 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {value.title}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-4xl text-center mb-12 font-bold text-gray-900 dark:text-white">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Arjun Sharma",
                role: "Founder & CEO",
                bio: "Passionate collector with 15+ years in the hobby industry",
              },
              {
                name: "Priya Patel",
                role: "Head of Operations",
                bio: "Expert in supply chain and ensuring product authenticity",
              },
              {
                name: "Rahul Kumar",
                role: "Community Manager",
                bio: "Connecting enthusiasts and building our vibrant community",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="p-6 text-center rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white font-semibold">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {member.name}
                </h6>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "10K+", label: "Products Sold" },
              { number: "500+", label: "Live Auctions" },
              { number: "99%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <div key={index}>
                <h3 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 py-16 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Join Our Community
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
              Ready to discover authentic products and connect with fellow
              enthusiasts?
            </p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row max-w-md mx-auto">
              <Link
                href="/products"
                className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="inline-block px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
