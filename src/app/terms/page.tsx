/**
 * Terms of Service Page
 *
 * Legal terms and conditions for using Let It Rip platform.
 *
 * @page /terms - Terms of service page
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Let It Rip",
  description:
    "Read our terms of service and conditions for using Let It Rip platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Last updated: January 20, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Let It Rip ("the Platform"), you accept and
              agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use our platform.
            </p>

            <h2>2. User Accounts</h2>
            <h3>2.1 Registration</h3>
            <p>
              To use certain features of the Platform, you must register for an
              account. You agree to provide accurate, current, and complete
              information during registration.
            </p>
            <h3>2.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities that occur under your
              account.
            </p>

            <h2>3. Seller Requirements</h2>
            <h3>3.1 Verification</h3>
            <p>
              All sellers must complete our verification process before listing
              products or auctions. This includes providing valid business
              documentation and identity verification.
            </p>
            <h3>3.2 Product Listings</h3>
            <p>
              Sellers must ensure all product listings are accurate, complete,
              and comply with Indian laws and regulations. Prohibited items
              include counterfeit goods, illegal substances, and hazardous
              materials.
            </p>

            <h2>4. Buyer Responsibilities</h2>
            <h3>4.1 Purchase Commitments</h3>
            <p>
              When you place an order or bid on an auction, you enter into a
              binding contract with the seller. You agree to complete the
              transaction as per the agreed terms.
            </p>
            <h3>4.2 Payment</h3>
            <p>
              All payments must be made through the Platform's approved payment
              methods. Direct transactions outside the Platform are prohibited.
            </p>

            <h2>5. Auctions</h2>
            <h3>5.1 Bidding</h3>
            <p>
              All bids are binding commitments to purchase. Once you place a
              bid, it cannot be retracted unless the seller cancels the auction
              or makes material changes to the listing.
            </p>
            <h3>5.2 Winning Bids</h3>
            <p>
              The highest bidder at the end of the auction period wins the item
              and must complete the purchase within 48 hours.
            </p>

            <h2>6. Fees and Payments</h2>
            <h3>6.1 Platform Fees</h3>
            <p>
              Sellers pay a commission on completed sales. The commission rate
              varies by category and is clearly disclosed before listing.
            </p>
            <h3>6.2 Payment Processing</h3>
            <p>
              We use third-party payment processors. You agree to comply with
              their terms and conditions.
            </p>

            <h2>7. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul>
              <li>Engage in fraudulent or deceptive practices</li>
              <li>List prohibited or illegal items</li>
              <li>Manipulate auction bids or prices</li>
              <li>Harass or abuse other users</li>
              <li>Circumvent the Platform's fees or payment systems</li>
              <li>Use automated systems to access the Platform</li>
              <li>Infringe on intellectual property rights</li>
            </ul>

            <h2>8. Intellectual Property</h2>
            <p>
              All content on the Platform, including logos, designs, text, and
              graphics, is owned by Let It Rip or its licensors and is protected
              by copyright and trademark laws.
            </p>

            <h2>9. Dispute Resolution</h2>
            <h3>9.1 Buyer-Seller Disputes</h3>
            <p>
              In case of disputes between buyers and sellers, both parties agree
              to first attempt resolution through our dispute resolution system.
            </p>
            <h3>9.2 Arbitration</h3>
            <p>
              Disputes that cannot be resolved through our system will be
              subject to binding arbitration in Bangalore, India.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              Let It Rip acts as a marketplace platform connecting buyers and
              sellers. We are not responsible for the quality, safety, legality,
              or accuracy of products listed by sellers.
            </p>

            <h2>11. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these Terms of Service or engage in prohibited activities.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Continued
              use of the Platform after changes constitutes acceptance of the
              new terms.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes will
              be subject to the exclusive jurisdiction of courts in Bangalore,
              Karnataka.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              For questions about these Terms of Service, contact us at{" "}
              <a href="mailto:legal@letitrip.in">legal@letitrip.in</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
