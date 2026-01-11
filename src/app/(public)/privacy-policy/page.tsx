import { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy - Let It Rip",
  description:
    "Learn how Let It Rip collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
  robots: "index, follow",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="November 7, 2025"
      version="2.0"
      effectiveDate="November 1, 2025"
    >
      <h2>1. Introduction</h2>
      <p>
        Welcome to Let It Rip ("we," "our," or "us"). We are committed to
        protecting your personal information and your right to privacy. This
        Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our platform.
      </p>
      <p>
        By using Let It Rip, you agree to the collection and use of information
        in accordance with this Privacy Policy. If you do not agree with our
        policies and practices, please do not use our services.
      </p>

      <h2>2. Information We Collect</h2>

      <h3>2.1 Personal Information You Provide</h3>
      <p>We collect information that you voluntarily provide to us when you:</p>
      <ul>
        <li>
          <strong>Register an account:</strong> Name, email address, password,
          phone number
        </li>
        <li>
          <strong>Make a purchase:</strong> Shipping address, billing address,
          payment information
        </li>
        <li>
          <strong>Create a shop:</strong> Business information, bank account
          details, tax information
        </li>
        <li>
          <strong>Contact support:</strong> Communication content, attachments,
          support ticket details
        </li>
        <li>
          <strong>Participate in auctions:</strong> Bid history, payment
          information
        </li>
        <li>
          <strong>Leave reviews:</strong> Review content, ratings, photos,
          videos
        </li>
      </ul>

      <h3>2.2 Information Automatically Collected</h3>
      <p>When you use our platform, we automatically collect:</p>
      <ul>
        <li>
          <strong>Device information:</strong> IP address, browser type,
          operating system, device identifiers
        </li>
        <li>
          <strong>Usage data:</strong> Pages viewed, time spent on pages, click
          patterns, search queries
        </li>
        <li>
          <strong>Location data:</strong> General location based on IP address
        </li>
        <li>
          <strong>Cookies and tracking:</strong> Cookie identifiers, pixel tags,
          local storage data
        </li>
      </ul>

      <h3>2.3 Information from Third Parties</h3>
      <p>We may receive information from:</p>
      <ul>
        <li>
          <strong>Payment processors:</strong> Transaction details, payment
          status
        </li>
        <li>
          <strong>Shipping providers:</strong> Delivery tracking, shipment
          status
        </li>
        <li>
          <strong>Social media:</strong> If you choose to connect social
          accounts
        </li>
        <li>
          <strong>Analytics providers:</strong> Usage statistics, performance
          metrics
        </li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use collected information for the following purposes:</p>

      <h3>3.1 Service Delivery</h3>
      <ul>
        <li>Process orders and transactions</li>
        <li>Manage auctions and bidding</li>
        <li>Handle shipping and delivery</li>
        <li>Process returns and refunds</li>
        <li>Provide customer support</li>
        <li>Manage seller payouts</li>
      </ul>

      <h3>3.2 Account Management</h3>
      <ul>
        <li>Create and maintain user accounts</li>
        <li>Verify identity and prevent fraud</li>
        <li>Send account notifications and updates</li>
        <li>Manage shop accounts for sellers</li>
      </ul>

      <h3>3.3 Communication</h3>
      <ul>
        <li>Send order confirmations and shipping updates</li>
        <li>Respond to support inquiries</li>
        <li>Send marketing emails (with your consent)</li>
        <li>Notify about auctions and bids</li>
        <li>Send important policy updates</li>
      </ul>

      <h3>3.4 Platform Improvement</h3>
      <ul>
        <li>Analyze usage patterns and trends</li>
        <li>Improve our services and user experience</li>
        <li>Develop new features</li>
        <li>Personalize recommendations</li>
        <li>Prevent fraud and abuse</li>
      </ul>

      <h2>4. How We Share Your Information</h2>
      <p>We may share your information with:</p>

      <h3>4.1 Service Providers</h3>
      <ul>
        <li>
          <strong>Payment processors:</strong> Razorpay, PayPal (to process
          payments)
        </li>
        <li>
          <strong>Shipping companies:</strong> Shiprocket, DHL, FedEx (for
          delivery)
        </li>
        <li>
          <strong>Cloud storage:</strong> Firebase, AWS (for data hosting)
        </li>
        <li>
          <strong>Email services:</strong> SendGrid (for transactional emails)
        </li>
        <li>
          <strong>SMS providers:</strong> Twilio (for OTP verification)
        </li>
      </ul>

      <h3>4.2 Other Users</h3>
      <ul>
        <li>
          <strong>Sellers:</strong> Buyer shipping address, order details
        </li>
        <li>
          <strong>Buyers:</strong> Seller shop information, public reviews
        </li>
        <li>
          <strong>Public information:</strong> Reviews, ratings, shop
          information
        </li>
      </ul>

      <h3>4.3 Legal Requirements</h3>
      <p>We may disclose information when required to:</p>
      <ul>
        <li>Comply with legal obligations and court orders</li>
        <li>Enforce our terms of service</li>
        <li>Protect our rights and property</li>
        <li>Prevent fraud and illegal activities</li>
        <li>Protect user safety</li>
      </ul>

      <h3>4.4 Business Transfers</h3>
      <p>
        In the event of a merger, acquisition, or sale of assets, your
        information may be transferred to the new owner. You will be notified
        via email of any such change.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your
        information:
      </p>
      <ul>
        <li>
          <strong>Encryption:</strong> SSL/TLS encryption for data in transit
        </li>
        <li>
          <strong>Secure storage:</strong> Encrypted databases and secure
          servers
        </li>
        <li>
          <strong>Access controls:</strong> Limited employee access to personal
          data
        </li>
        <li>
          <strong>Payment security:</strong> PCI-DSS compliant payment
          processing
        </li>
        <li>
          <strong>Regular audits:</strong> Security assessments and penetration
          testing
        </li>
        <li>
          <strong>Monitoring:</strong> 24/7 security monitoring and intrusion
          detection
        </li>
      </ul>
      <p>
        However, no method of transmission over the internet is 100% secure.
        While we strive to protect your information, we cannot guarantee
        absolute security.
      </p>

      <h2>6. Your Privacy Rights</h2>

      <h3>6.1 Access and Portability</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Request a copy of your personal data</li>
        <li>Download your data in a portable format</li>
        <li>Access your account information at any time</li>
      </ul>

      <h3>6.2 Correction and Update</h3>
      <p>You can:</p>
      <ul>
        <li>Update your account information in settings</li>
        <li>Correct inaccurate personal data</li>
        <li>Request correction of errors</li>
      </ul>

      <h3>6.3 Deletion</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Delete your account at any time</li>
        <li>Request deletion of specific data</li>
        <li>Object to processing of your data</li>
      </ul>
      <p>
        <em>
          Note: Some data may be retained for legal compliance (e.g.,
          transaction records for 7 years).
        </em>
      </p>

      <h3>6.4 Marketing Communications</h3>
      <p>You can opt-out of marketing emails by:</p>
      <ul>
        <li>Clicking "unsubscribe" in any marketing email</li>
        <li>Updating preferences in account settings</li>
        <li>Contacting support</li>
      </ul>
      <p>
        <em>
          Note: You will still receive transactional emails (order
          confirmations, shipping updates, etc.).
        </em>
      </p>

      <h2>7. Cookies and Tracking</h2>
      <p>We use cookies and similar tracking technologies for:</p>
      <ul>
        <li>
          <strong>Essential cookies:</strong> Required for site functionality
          (login, cart)
        </li>
        <li>
          <strong>Performance cookies:</strong> Analytics and usage tracking
        </li>
        <li>
          <strong>Functional cookies:</strong> Remember preferences and settings
        </li>
        <li>
          <strong>Marketing cookies:</strong> Personalized advertising (with
          consent)
        </li>
      </ul>
      <p>
        You can control cookies through your browser settings. Disabling cookies
        may limit site functionality. See our{" "}
        <a href="/cookie-policy">Cookie Policy</a> for more details.
      </p>

      <h2>8. Children's Privacy</h2>
      <p>
        Our services are not intended for users under 18 years of age. We do not
        knowingly collect personal information from children under 18. If you
        are a parent and believe your child has provided us with personal
        information, please contact us to request deletion.
      </p>

      <h2>9. International Data Transfers</h2>
      <p>
        Your information may be transferred to and processed in countries other
        than your country of residence. We ensure appropriate safeguards are in
        place for international transfers, including:
      </p>
      <ul>
        <li>Standard contractual clauses</li>
        <li>Adequacy decisions by regulatory authorities</li>
        <li>Your explicit consent when required</li>
      </ul>

      <h2>10. Data Retention</h2>
      <p>We retain your personal information for as long as necessary to:</p>
      <ul>
        <li>Provide our services</li>
        <li>
          Comply with legal obligations (tax, accounting, anti-fraud laws)
        </li>
        <li>Resolve disputes</li>
        <li>Enforce our agreements</li>
      </ul>
      <p>
        <strong>Typical retention periods:</strong>
      </p>
      <ul>
        <li>
          <strong>Account data:</strong> Until account deletion + 90 days
        </li>
        <li>
          <strong>Order history:</strong> 7 years (legal requirement)
        </li>
        <li>
          <strong>Payment records:</strong> 7 years (legal requirement)
        </li>
        <li>
          <strong>Support tickets:</strong> 3 years
        </li>
        <li>
          <strong>Marketing data:</strong> Until opt-out + 30 days
        </li>
      </ul>

      <h2>11. Third-Party Links</h2>
      <p>
        Our platform may contain links to third-party websites or services. We
        are not responsible for the privacy practices of these third parties. We
        encourage you to read their privacy policies before providing any
        information.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you
        of significant changes by:
      </p>
      <ul>
        <li>Posting the new policy on this page</li>
        <li>Updating the "Last Updated" date</li>
        <li>Sending an email notification (for material changes)</li>
        <li>Displaying a prominent notice on our platform</li>
      </ul>
      <p>
        Your continued use of our services after changes become effective
        constitutes acceptance of the new policy.
      </p>

      <h2>13. Contact Information</h2>
      <p>
        For privacy-related inquiries or to exercise your rights, contact us at:
      </p>
      <ul>
        <li>
          <strong>Email:</strong> privacy@letitrip.com
        </li>
        <li>
          <strong>Legal Email:</strong> legal@letitrip.com
        </li>
        <li>
          <strong>Support:</strong>{" "}
          <a href="/support/ticket">Create a Support Ticket</a>
        </li>
        <li>
          <strong>Mail:</strong> Let It Rip Privacy Team, [Company Address]
        </li>
      </ul>

      <h2>14. Regulatory Compliance</h2>
      <p>We comply with applicable privacy laws including:</p>
      <ul>
        <li>
          <strong>GDPR</strong> (European Union)
        </li>
        <li>
          <strong>CCPA</strong> (California, USA)
        </li>
        <li>
          <strong>IT Act, 2000</strong> (India)
        </li>
        <li>
          <strong>Personal Data Protection Bill</strong> (India, pending)
        </li>
      </ul>
      <p>
        If you are in the EU or California, you have additional rights under
        GDPR and CCPA respectively. Contact us for more information.
      </p>

      <hr />

      <p className="text-sm text-gray-600 mt-8">
        <strong>Version History:</strong>
        <br />
        Version 2.0 (November 1, 2025): Added auction privacy details, updated
        third-party services
        <br />
        Version 1.0 (January 1, 2024): Initial privacy policy
      </p>
    </LegalPageLayout>
  );
}
