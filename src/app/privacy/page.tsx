import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: January 1, 2024
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                JustForView.in ("we," "our," or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our
                website and use our services.
              </p>
              <p className="text-muted-foreground">
                Please read this Privacy Policy carefully. By using our Service,
                you agree to the collection and use of information in accordance
                with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold mb-3">
                Personal Information
              </h3>
              <p className="text-muted-foreground mb-4">
                We may collect personally identifiable information that you
                voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                <li>Register for an account</li>
                <li>Make a purchase or place an order</li>
                <li>Participate in auctions</li>
                <li>Subscribe to our newsletter</li>
                <li>Contact us for support</li>
                <li>Fill out surveys or forms</li>
              </ul>

              <p className="text-muted-foreground mb-4">
                This information may include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                <li>Name and contact information (email, phone, address)</li>
                <li>
                  Payment information (processed securely by third-party
                  providers)
                </li>
                <li>Account credentials (username, password)</li>
                <li>Purchase history and preferences</li>
                <li>Communication records</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">
                Automatically Collected Information
              </h3>
              <p className="text-muted-foreground mb-4">
                When you visit our website, we may automatically collect certain
                information about your device and usage patterns:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>IP address and browser information</li>
                <li>Device type and operating system</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website or source</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-muted-foreground mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Process transactions and fulfill orders</li>
                <li>Manage your account and provide customer support</li>
                <li>Facilitate auction participation and bidding</li>
                <li>Send you order confirmations and shipping updates</li>
                <li>Communicate with you about our products and services</li>
                <li>Personalize your shopping experience</li>
                <li>Improve our website and services</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information in the following
                circumstances:
              </p>

              <h3 className="text-xl font-semibold mb-3">Service Providers</h3>
              <p className="text-muted-foreground mb-4">
                We work with trusted third-party service providers who help us
                operate our business:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                <li>Payment processors (Razorpay, etc.)</li>
                <li>Shipping and logistics partners</li>
                <li>Email and SMS service providers</li>
                <li>Analytics and advertising platforms</li>
                <li>Cloud storage and hosting services</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Legal Requirements</h3>
              <p className="text-muted-foreground mb-4">
                We may disclose your information if required by law or in
                response to valid legal requests from public authorities.
              </p>

              <h3 className="text-xl font-semibold mb-3">Business Transfers</h3>
              <p className="text-muted-foreground">
                In the event of a merger, acquisition, or sale of assets, your
                information may be transferred as part of the business
                transaction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information against unauthorized
                access, alteration, disclosure, or destruction. These measures
                include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>SSL encryption for data transmission</li>
                <li>Secure servers and databases</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                However, no method of transmission over the Internet or
                electronic storage is 100% secure. While we strive to use
                commercially acceptable means to protect your information, we
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                6. Cookies and Tracking Technologies
              </h2>
              <p className="text-muted-foreground mb-4">
                We use cookies and similar tracking technologies to enhance your
                browsing experience:
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Types of Cookies We Use
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                <li>
                  <strong>Essential Cookies:</strong> Required for basic website
                  functionality
                </li>
                <li>
                  <strong>Performance Cookies:</strong> Help us understand how
                  visitors use our site
                </li>
                <li>
                  <strong>Functional Cookies:</strong> Remember your preferences
                  and settings
                </li>
                <li>
                  <strong>Marketing Cookies:</strong> Used to deliver relevant
                  advertisements
                </li>
              </ul>

              <p className="text-muted-foreground">
                You can control cookies through your browser settings. However,
                disabling cookies may affect your ability to use certain
                features of our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                7. Your Privacy Rights
              </h2>
              <p className="text-muted-foreground mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information (subject to legal obligations)
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your data to
                  another service provider
                </li>
                <li>
                  <strong>Objection:</strong> Object to processing of your
                  information for marketing purposes
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> Withdraw consent for
                  data processing where applicable
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, please contact us using the
                information provided in the "Contact Us" section.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as necessary to
                fulfill the purposes outlined in this Privacy Policy, unless a
                longer retention period is required or permitted by law. When we
                no longer need your information, we will securely delete or
                anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our services are not intended for children under the age of 18.
                We do not knowingly collect personal information from children
                under 18. If we become aware that we have collected personal
                information from a child under 18, we will take steps to delete
                such information promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                10. International Data Transfers
              </h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in
                countries other than your own. We ensure that such transfers are
                conducted in accordance with applicable data protection laws and
                include appropriate safeguards to protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or applicable laws. We will notify you
                of any material changes by posting the updated policy on our
                website and updating the "Last updated" date. Your continued use
                of our services after such changes constitutes acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                12. Third-Party Services
              </h2>
              <p className="text-muted-foreground mb-4">
                Our website may contain links to third-party websites or
                services. This Privacy Policy does not apply to these external
                sites. We encourage you to review the privacy policies of any
                third-party services you use.
              </p>

              <h3 className="text-xl font-semibold mb-3">
                Third-Party Services We Use
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  <strong>Google Analytics:</strong> For website analytics and
                  performance monitoring
                </li>
                <li>
                  <strong>Razorpay:</strong> For secure payment processing
                </li>
                <li>
                  <strong>Firebase:</strong> For authentication and database
                  services
                </li>
                <li>
                  <strong>Social Media Platforms:</strong> For social login and
                  sharing features
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
              <div className="text-muted-foreground space-y-2">
                <p>
                  If you have any questions about this Privacy Policy or our
                  privacy practices, please contact us:
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:privacy@justforview.in"
                    className="text-primary hover:underline"
                  >
                    privacy@justforview.in
                  </a>
                </p>
                <p>
                  Phone:{" "}
                  <a
                    href="tel:+919876543210"
                    className="text-primary hover:underline"
                  >
                    +91 98765 43210
                  </a>
                </p>
                <p>
                  Address: 123 Business Park, 2nd Floor, Andheri East, Mumbai -
                  400069, Maharashtra, India
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t">
            <div className="flex justify-between items-center">
              <Link href="/terms" className="btn btn-outline">
                ← Terms of Service
              </Link>
              <Link href="/" className="btn btn-outline">
                Back to Home →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
