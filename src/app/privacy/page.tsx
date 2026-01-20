/**
 * Privacy Policy Page
 *
 * Privacy policy explaining how Let It Rip handles user data.
 *
 * @page /privacy - Privacy policy page
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Let It Rip",
  description:
    "Learn how Let It Rip protects and handles your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Last updated: January 20, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>1. Introduction</h2>
            <p>
              Let It Rip ("we", "our", "us") respects your privacy and is
              committed to protecting your personal data. This Privacy Policy
              explains how we collect, use, share, and protect information about
              you when you use our platform.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <ul>
              <li>Account registration information (name, email, phone)</li>
              <li>Profile information and preferences</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information</li>
              <li>Communications with us and other users</li>
              <li>Seller verification documents</li>
            </ul>

            <h3>2.2 Information Automatically Collected</h3>
            <ul>
              <li>Device information (IP address, browser type, OS)</li>
              <li>Usage data (pages visited, time spent, clicks)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h3>2.3 Information from Third Parties</h3>
            <ul>
              <li>Social media login information</li>
              <li>Payment processor data</li>
              <li>Fraud prevention services</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Process transactions and send notifications</li>
              <li>Verify seller accounts and prevent fraud</li>
              <li>Personalize your experience</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our terms</li>
            </ul>

            <h2>4. Information Sharing</h2>
            <h3>4.1 With Other Users</h3>
            <p>
              When you make a purchase or sell an item, certain information
              (name, shipping address) is shared with the other party to
              complete the transaction.
            </p>

            <h3>4.2 With Service Providers</h3>
            <p>
              We share information with trusted third-party service providers
              who help us operate our platform:
            </p>
            <ul>
              <li>Payment processors</li>
              <li>Shipping and logistics partners</li>
              <li>Cloud hosting providers</li>
              <li>Analytics services</li>
              <li>Customer support tools</li>
            </ul>

            <h3>4.3 For Legal Reasons</h3>
            <p>We may disclose information when required by law or to:</p>
            <ul>
              <li>Comply with legal processes</li>
              <li>Enforce our Terms of Service</li>
              <li>Protect our rights and property</li>
              <li>Prevent fraud or illegal activities</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your
              data:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure payment processing</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2>6. Your Rights and Choices</h2>
            <h3>6.1 Access and Update</h3>
            <p>
              You can access and update your account information through your
              profile settings.
            </p>

            <h3>6.2 Data Deletion</h3>
            <p>
              You can request deletion of your account and personal data by
              contacting us at privacy@letitrip.in. Some information may be
              retained for legal or business purposes.
            </p>

            <h3>6.3 Marketing Communications</h3>
            <p>
              You can opt out of marketing emails by clicking the unsubscribe
              link or updating your notification preferences.
            </p>

            <h3>6.4 Cookies</h3>
            <p>
              You can control cookies through your browser settings. Note that
              disabling cookies may limit platform functionality.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              We retain your information for as long as necessary to provide our
              services and comply with legal obligations. Transaction records
              are retained for 7 years as required by Indian law.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our platform is not intended for users under 18 years of age. We
              do not knowingly collect information from children.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries
              outside India. We ensure appropriate safeguards are in place to
              protect your data.
            </p>

            <h2>10. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will
              notify you of significant changes via email or platform
              notification.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For questions about this Privacy Policy or how we handle your
              data:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a href="mailto:privacy@letitrip.in">privacy@letitrip.in</a>
              </li>
              <li>Phone: +91 1800-LETITRIP</li>
              <li>
                Address: Let It Rip Technologies Pvt. Ltd., Bangalore,
                Karnataka, India
              </li>
            </ul>

            <h2>12. Compliance with Indian Laws</h2>
            <p>
              We comply with applicable Indian data protection laws, including
              the Information Technology Act, 2000 and the Information
              Technology (Reasonable Security Practices and Procedures and
              Sensitive Personal Data or Information) Rules, 2011.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
