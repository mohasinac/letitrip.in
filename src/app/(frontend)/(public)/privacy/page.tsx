"use client";

import Link from "next/link";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { CardContent } from "@/components/ui/unified/Card";
import { UnifiedButton } from "@/components/ui/unified/Button";
import {
  HeroSection,
  ThemeAwareBox,
} from "@/components/shared/ThemeAwareComponents";
import { ClientLinkButton } from "@/components/shared/ClientLinkButton";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function PrivacyPage() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Privacy Policy",
      href: "/privacy",
      active: true,
    },
  ]);

  return (
    <ThemeAwareBox>
      {/* Hero Section */}
      <HeroSection>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Privacy Policy
            </h1>
            <p className="text-xl text-white opacity-90">
              Last updated: January 1, 2024
            </p>
          </div>
        </div>
      </HeroSection>

      <div className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col gap-8">
            {[
              {
                title: "1. Introduction",
                content: (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      HobbiesSpot.com ("we," "our," or "us") is committed to
                      protecting your privacy. This Privacy Policy explains how
                      we collect, use, disclose, and safeguard your information
                      when you visit our website and use our services.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Please read this Privacy Policy carefully. By using our
                      Service, you agree to the collection and use of
                      information in accordance with this policy.
                    </p>
                  </div>
                ),
              },
              {
                title: "2. Information We Collect",
                content: (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Personal Information:
                      </span>{" "}
                      Name, email address, phone number, shipping address,
                      billing address, and payment information.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Usage Information:
                      </span>{" "}
                      Information about how you use our website, including pages
                      visited, time spent, and interactions.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Device Information:
                      </span>{" "}
                      IP address, browser type, device type, and operating
                      system.
                    </p>
                  </div>
                ),
              },
              {
                title: "3. How We Use Your Information",
                content: (
                  <ul className="pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="list-disc">Process orders and manage your account</li>
                    <li className="list-disc">
                      Communicate with you about orders, promotions, and updates
                    </li>
                    <li className="list-disc">Improve our website and services</li>
                    <li className="list-disc">Prevent fraud and ensure security</li>
                    <li className="list-disc">Comply with legal obligations</li>
                    <li className="list-disc">Send marketing communications (with your consent)</li>
                  </ul>
                ),
              },
              {
                title: "4. Information Sharing",
                content: (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      We do not sell, trade, or rent your personal information
                      to third parties. We may share your information in the
                      following circumstances:
                    </p>
                    <ul className="pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                      <li className="list-disc">
                        With service providers who help us operate our business
                      </li>
                      <li className="list-disc">When required by law or to protect our rights</li>
                      <li className="list-disc">In connection with a business transfer or merger</li>
                      <li className="list-disc">With your explicit consent</li>
                    </ul>
                  </div>
                ),
              },
              {
                title: "5. Data Security",
                content: (
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We implement appropriate security measures to protect your
                    personal information against unauthorized access,
                    alteration, disclosure, or destruction. However, no method
                    of transmission over the internet is 100% secure.
                  </p>
                ),
              },
              {
                title: "6. Your Rights",
                content: (
                  <ul className="pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="list-disc">Access and review your personal information</li>
                    <li className="list-disc">Request correction of inaccurate information</li>
                    <li className="list-disc">
                      Request deletion of your information (subject to legal
                      requirements)
                    </li>
                    <li className="list-disc">Opt-out of marketing communications</li>
                    <li className="list-disc">Data portability (where applicable)</li>
                  </ul>
                ),
              },
            ].map((section, index) => (
              <UnifiedCard key={index} className="rounded-3xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h2>
                  {section.content}
                </CardContent>
              </UnifiedCard>
            ))}

            {/* Navigation */}
            <UnifiedCard className="rounded-3xl mt-8">
              <CardContent className="p-8">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <ClientLinkButton
                    href="/terms"
                    variant="outlined"
                    className="px-6"
                  >
                    ← Terms of Service
                  </ClientLinkButton>
                  <ClientLinkButton
                    href="/cookies"
                    variant="outlined"
                    className="px-6"
                  >
                    Cookie Policy →
                  </ClientLinkButton>
                </div>
              </CardContent>
            </UnifiedCard>
          </div>
        </div>
      </div>
    </ThemeAwareBox>
  );
}
