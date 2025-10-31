"use client";

import {
  HeroSection,
  ThemeAwareBox,
} from "@/components/shared/ThemeAwareComponents";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

export default function CookiePolicyPage() {
  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Cookie Policy",
      href: "/cookies",
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
              Cookie Policy
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Learn about how we use cookies to improve your experience on
              JustForView.
            </p>
          </div>
        </div>
      </HeroSection>

      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
              <div className="p-8">
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  This Cookie Policy explains how JustForView uses cookies and
                  similar technologies to recognize you when you visit our
                  website.
                </p>
              </div>
            </div>

            {[
              {
                title: "What are cookies?",
                content: (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Cookies are small data files that are placed on your
                    computer or mobile device when you visit a website. Cookies
                    are widely used by website owners to make their websites
                    work, or to work more efficiently, as well as to provide
                    reporting information.
                  </p>
                ),
              },
              {
                title: "Types of cookies we use",
                content: (
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Essential Cookies:
                      </span>{" "}
                      These are necessary for the website to function properly,
                      including authentication and security.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Performance Cookies:
                      </span>{" "}
                      These help us understand how visitors interact with our
                      website by collecting anonymous information.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Functional Cookies:
                      </span>{" "}
                      These enable enhanced functionality and personalization,
                      such as remembering your preferences.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Marketing Cookies:
                      </span>{" "}
                      These track visitors across websites to display relevant
                      advertisements.
                    </p>
                  </div>
                ),
              },
              {
                title: "How to manage cookies",
                content: (
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      You can control and manage cookies in various ways:
                    </p>
                    <ul className="pl-6 list-disc text-gray-600 dark:text-gray-300 space-y-2">
                      <li>
                        Browser settings: Most browsers allow you to refuse or
                        accept cookies
                      </li>
                      <li>
                        Cookie preferences: Use our cookie consent banner to
                        manage your preferences
                      </li>
                      <li>
                        Delete cookies: You can delete existing cookies from
                        your browser
                      </li>
                      <li>
                        Opt-out tools: Use industry opt-out tools for
                        advertising cookies
                      </li>
                    </ul>
                  </div>
                ),
              },
              {
                title: "Third-party cookies",
                content: (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    We may use third-party services that place cookies on your
                    device, including analytics services like Google Analytics,
                    payment processors, and social media platforms. These third
                    parties have their own privacy policies and cookie policies.
                  </p>
                ),
              },
              {
                title: "Contact us",
                content: (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    If you have any questions about our use of cookies, please
                    contact us at{" "}
                    <a
                      href="mailto:privacy@justforview.in"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      privacy@justforview.in
                    </a>
                  </p>
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
          </div>
        </div>
      </div>
    </ThemeAwareBox>
  );
}
