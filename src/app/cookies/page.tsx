import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - JustForView",
  description:
    "Learn about how we use cookies to improve your experience on JustForView.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Cookie Policy
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              This Cookie Policy explains how JustForView uses cookies and
              similar technologies to recognize you when you visit our website.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                What are cookies?
              </h2>
              <p className="text-gray-600 mb-4">
                Cookies are small data files that are placed on your computer or
                mobile device when you visit a website. Cookies are widely used
                by website owners to make their websites work, or to work more
                efficiently, as well as to provide reporting information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                How we use cookies
              </h2>
              <div className="grid gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Essential Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies are necessary for the website to function
                    properly:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>
                      <strong>auth_token</strong> - Keeps you logged in (30
                      days)
                    </li>
                    <li>
                      <strong>user_data</strong> - Stores your user preferences
                      (30 days)
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Functional Cookies
                  </h3>
                  <p className="text-gray-600 mb-2">
                    These cookies enhance your experience:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>
                      <strong>cart_data</strong> - Remembers items in your cart
                      (7 days)
                    </li>
                    <li>
                      <strong>preferences</strong> - Saves your site preferences
                      (1 year)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Cookie Security
              </h2>
              <p className="text-gray-600 mb-4">
                We implement the following security measures for our cookies:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>
                  <strong>Secure flag</strong> - Cookies are only sent over
                  HTTPS connections
                </li>
                <li>
                  <strong>SameSite protection</strong> - Prevents cross-site
                  request forgery attacks
                </li>
                <li>
                  <strong>Limited expiration</strong> - Cookies expire
                  automatically for security
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Managing Cookies
              </h2>
              <p className="text-gray-600 mb-4">
                You can control and/or delete cookies as you wish. You can
                delete all cookies that are already on your computer and you can
                set most browsers to prevent them from being placed.
              </p>
              <p className="text-gray-600">
                However, if you do this, you may have to manually adjust some
                preferences every time you visit the site and some services and
                functionalities may not work.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600">
                If you have any questions about this Cookie Policy, please
                contact us at{" "}
                <a
                  href="mailto:privacy@justforview.in"
                  className="text-primary hover:underline"
                >
                  privacy@justforview.in
                </a>
              </p>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <p className="text-sm text-blue-800">
                <strong>Last updated:</strong> October 24, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
