import { LegalPageLayout } from "@letitrip/react-library";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Let It Rip",
  description:
    "Read the Terms of Service for using Let It Rip platform. User agreement, rules, and conditions for buyers and sellers.",
  robots: "index, follow",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="November 7, 2025"
      version="2.0"
      effectiveDate="November 1, 2025"
    >
      <h2>1. Acceptance of Terms</h2>
      <p>
        Welcome to Let It Rip. By accessing or using our platform, you agree to
        be bound by these Terms of Service ("Terms"). If you do not agree to
        these Terms, do not use our services.
      </p>
      <p>
        These Terms constitute a legally binding agreement between you and Let
        It Rip ("we," "us," or "our"). We reserve the right to update these
        Terms at any time. Your continued use of the platform after changes
        constitutes acceptance of the new Terms.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li>
          <strong>"Platform"</strong> refers to the Let It Rip website, mobile
          app, and all associated services
        </li>
        <li>
          <strong>"User"</strong> means any person who accesses or uses the
          Platform
        </li>
        <li>
          <strong>"Buyer"</strong> means a User who purchases products or bids
          on auctions
        </li>
        <li>
          <strong>"Seller"</strong> means a User who creates a shop and lists
          products or auctions
        </li>
        <li>
          <strong>"Content"</strong> means text, images, videos, and other
          materials posted on the Platform
        </li>
        <li>
          <strong>"Order"</strong> means a purchase transaction between a Buyer
          and Seller
        </li>
        <li>
          <strong>"Auction"</strong> means a listing where Users bid to purchase
          an item
        </li>
      </ul>

      <h2>3. Account Registration</h2>

      <h3>3.1 Eligibility</h3>
      <p>To use our services, you must:</p>
      <ul>
        <li>Be at least 18 years of age</li>
        <li>Have the legal capacity to enter into contracts</li>
        <li>Provide accurate and complete registration information</li>
        <li>Not be prohibited from using our services under applicable law</li>
        <li>Not have been previously banned or suspended from the Platform</li>
      </ul>

      <h3>3.2 Account Security</h3>
      <p>You are responsible for:</p>
      <ul>
        <li>Maintaining the confidentiality of your password</li>
        <li>All activities that occur under your account</li>
        <li>Notifying us immediately of any unauthorized use</li>
        <li>Using a strong, unique password</li>
      </ul>
      <p>
        We are not liable for any loss or damage arising from your failure to
        protect your account.
      </p>

      <h3>3.3 Account Termination</h3>
      <p>We may suspend or terminate your account if you:</p>
      <ul>
        <li>Violate these Terms</li>
        <li>Engage in fraudulent or illegal activity</li>
        <li>Receive multiple complaints from other Users</li>
        <li>Fail to pay fees owed to us</li>
        <li>Provide false information</li>
      </ul>
      <p>You may delete your account at any time through account settings.</p>

      <h2>4. User Conduct</h2>

      <h3>4.1 Prohibited Activities</h3>
      <p>You agree NOT to:</p>
      <ul>
        <li>Post false, misleading, or fraudulent listings</li>
        <li>Sell counterfeit or illegal products</li>
        <li>Manipulate auctions through shill bidding or bid rigging</li>
        <li>Harass, threaten, or abuse other Users</li>
        <li>Violate intellectual property rights</li>
        <li>Scrape or copy content from the Platform</li>
        <li>Circumvent our fees or payment systems</li>
        <li>Create multiple accounts to evade restrictions</li>
        <li>Use bots or automated systems without permission</li>
        <li>Interfere with Platform operations</li>
      </ul>

      <h3>4.2 Content Guidelines</h3>
      <p>All User Content must:</p>
      <ul>
        <li>Be accurate and truthful</li>
        <li>Not contain offensive or inappropriate material</li>
        <li>Not violate any laws or third-party rights</li>
        <li>Not contain spam or unsolicited advertising</li>
        <li>Use actual product photos (not stock images unless disclosed)</li>
      </ul>

      <h2>5. Buying on Let It Rip</h2>

      <h3>5.1 Product Listings</h3>
      <p>
        Product listings are created by independent Sellers. We do not guarantee
        the accuracy, quality, safety, or legality of products listed. Sellers
        are responsible for their listings.
      </p>

      <h3>5.2 Placing Orders</h3>
      <p>When you place an order:</p>
      <ul>
        <li>You make a binding offer to purchase</li>
        <li>The Seller may accept or reject your order</li>
        <li>You agree to pay the total price including fees and shipping</li>
        <li>You authorize us to charge your payment method</li>
      </ul>

      <h3>5.3 Payment</h3>
      <p>
        Payment is processed through third-party payment processors (Razorpay,
        PayPal). You must comply with their terms of service. We do not store
        your full credit card information.
      </p>

      <h3>5.4 Order Cancellation</h3>
      <p>You may cancel an order:</p>
      <ul>
        <li>Before the Seller ships the item</li>
        <li>If the Seller agrees to cancellation</li>
        <li>If the item is significantly delayed</li>
      </ul>
      <p>Cancellation fees may apply if you frequently cancel orders.</p>

      <h2>6. Auctions</h2>

      <h3>6.1 Bidding</h3>
      <p>When you place a bid:</p>
      <ul>
        <li>Your bid is a binding commitment to purchase if you win</li>
        <li>You cannot retract a bid once placed</li>
        <li>You agree to complete payment within 48 hours of winning</li>
        <li>Bids must be higher than the current highest bid</li>
      </ul>

      <h3>6.2 Winning</h3>
      <p>If you win an auction:</p>
      <ul>
        <li>You must complete payment within 48 hours</li>
        <li>Failure to pay may result in account suspension</li>
        <li>You may be charged a non-payment fee</li>
        <li>The item will be listed again if you don't pay</li>
      </ul>

      <h3>6.3 Reserve Prices</h3>
      <p>
        Some auctions have reserve prices. If bidding doesn't reach the reserve,
        the item won't be sold even to the highest bidder. Reserve prices are
        not disclosed.
      </p>

      <h3>6.4 Shill Bidding Prohibited</h3>
      <p>
        Sellers and their associates cannot bid on their own auctions. Shill
        bidding results in immediate account suspension and potential legal
        action.
      </p>

      <h2>7. Selling on Let It Rip</h2>

      <h3>7.1 Shop Creation</h3>
      <p>
        Regular Users can create <strong>1 shop</strong>. To create a shop, you
        must:
      </p>
      <ul>
        <li>Provide accurate business information</li>
        <li>Verify your identity</li>
        <li>Agree to Seller-specific terms</li>
        <li>Comply with all applicable laws</li>
      </ul>

      <h3>7.2 Product Listings</h3>
      <p>Sellers must:</p>
      <ul>
        <li>Accurately describe products</li>
        <li>Use actual product photos</li>
        <li>Set fair and honest prices</li>
        <li>Only sell items they have in stock</li>
        <li>Ship items within stated timeframes</li>
        <li>Choose a leaf category (no parent categories)</li>
      </ul>

      <h3>7.3 Auction Listings</h3>
      <p>
        Sellers can create up to <strong>5 active auctions per shop</strong>.
        Admins have no limit.
      </p>
      <p>Auction listings must:</p>
      <ul>
        <li>Have a fair starting bid</li>
        <li>Accurately represent the item</li>
        <li>Include clear photos and descriptions</li>
        <li>Specify shipping costs and policies</li>
      </ul>

      <h3>7.4 Seller Fees</h3>
      <p>We charge:</p>
      <ul>
        <li>
          <strong>Commission:</strong> 5-15% of each sale (varies by category)
        </li>
        <li>
          <strong>Payment processing fee:</strong> Charged by payment processor
        </li>
        <li>
          <strong>No monthly fees:</strong> Listing is free
        </li>
      </ul>
      <p>Fees are deducted from your payout amount.</p>

      <h3>7.5 Payouts</h3>
      <p>
        Payments are held for 7-14 days after delivery to allow for returns. You
        can request payouts to your bank account or UPI. Payouts are processed
        within 3-5 business days.
      </p>

      <h3>7.6 Order Fulfillment</h3>
      <p>Sellers must:</p>
      <ul>
        <li>Ship orders within stated timeframes</li>
        <li>Provide tracking information</li>
        <li>Pack items securely</li>
        <li>Ship to the provided address only</li>
        <li>Respond to Buyer inquiries promptly</li>
      </ul>

      <h2>8. Returns and Refunds</h2>
      <p>
        See our <a href="/refund-policy">Refund Policy</a> for complete details.
      </p>
      <ul>
        <li>Most items can be returned within 30 days</li>
        <li>Items must be unused and in original packaging</li>
        <li>Buyers pay return shipping unless item is defective</li>
        <li>Refunds are processed within 5-7 business days</li>
      </ul>

      <h2>9. Reviews and Ratings</h2>

      <h3>9.1 Posting Reviews</h3>
      <p>Only verified purchasers can review products. Reviews must:</p>
      <ul>
        <li>Be honest and based on personal experience</li>
        <li>Not contain offensive or inappropriate content</li>
        <li>Not violate privacy or intellectual property</li>
        <li>Not be posted in exchange for compensation</li>
      </ul>

      <h3>9.2 Review Moderation</h3>
      <p>We reserve the right to remove reviews that:</p>
      <ul>
        <li>Violate our content guidelines</li>
        <li>Contain false information</li>
        <li>Are posted by Sellers about their own products</li>
        <li>Appear to be fake or manipulated</li>
      </ul>

      <h2>10. Intellectual Property</h2>

      <h3>10.1 Platform Content</h3>
      <p>
        All Platform content (logos, design, text, software) is owned by Let It
        Rip or our licensors. You may not copy, reproduce, or use our content
        without permission.
      </p>

      <h3>10.2 User Content</h3>
      <p>By posting content, you grant us a:</p>
      <ul>
        <li>Worldwide, non-exclusive, royalty-free license</li>
        <li>To display, reproduce, and distribute your content</li>
        <li>For the purpose of operating the Platform</li>
      </ul>
      <p>
        You retain ownership of your content but grant us the right to use it on
        the Platform.
      </p>

      <h3>10.3 Copyright Infringement</h3>
      <p>
        If you believe content on our Platform infringes your copyright, contact
        us at dmca@letitrip.com with:
      </p>
      <ul>
        <li>Description of copyrighted work</li>
        <li>Location of infringing content</li>
        <li>Your contact information</li>
        <li>Statement of good faith belief</li>
        <li>Statement under penalty of perjury</li>
        <li>Your physical or electronic signature</li>
      </ul>

      <h2>11. Limitation of Liability</h2>
      <p>
        <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
      </p>
      <ul>
        <li>We provide the Platform "AS IS" without warranties</li>
        <li>We are not liable for User conduct or content</li>
        <li>We are not responsible for product quality or accuracy</li>
        <li>
          We are not liable for indirect, incidental, or consequential damages
        </li>
        <li>
          Our total liability is limited to the amount you paid us in the past
          12 months
        </li>
      </ul>

      <h2>12. Indemnification</h2>
      <p>
        You agree to indemnify and hold us harmless from claims arising from:
      </p>
      <ul>
        <li>Your violation of these Terms</li>
        <li>Your violation of any law or third-party rights</li>
        <li>Your use of the Platform</li>
        <li>Content you post on the Platform</li>
        <li>Products you sell (if you're a Seller)</li>
      </ul>

      <h2>13. Dispute Resolution</h2>

      <h3>13.1 Buyer-Seller Disputes</h3>
      <p>
        We provide dispute resolution assistance but are not obligated to
        resolve disputes.
      </p>

      <h3>13.2 Arbitration</h3>
      <p>
        Any dispute with Let It Rip will be resolved through binding arbitration
        rather than court, except for small claims. Arbitration is conducted
        under [Arbitration Rules].
      </p>

      <h3>13.3 Class Action Waiver</h3>
      <p>
        You agree to resolve disputes individually and waive the right to
        participate in class actions, class arbitrations, or representative
        actions.
      </p>

      <h2>14. Governing Law</h2>
      <p>
        These Terms are governed by the laws of [Jurisdiction], without regard
        to conflict of law provisions.
      </p>

      <h2>15. Changes to Terms</h2>
      <p>We may modify these Terms at any time by:</p>
      <ul>
        <li>Posting updated Terms on this page</li>
        <li>Updating the "Last Updated" date</li>
        <li>Notifying you via email for material changes</li>
      </ul>
      <p>Your continued use after changes constitutes acceptance.</p>

      <h2>16. Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable, the
        remaining provisions will remain in full force and effect.
      </p>

      <h2>17. Entire Agreement</h2>
      <p>
        These Terms, along with our Privacy Policy and other policies,
        constitute the entire agreement between you and Let It Rip.
      </p>

      <h2>18. Contact Information</h2>
      <p>For questions about these Terms, contact us at:</p>
      <ul>
        <li>
          <strong>Email:</strong> legal@letitrip.com
        </li>
        <li>
          <strong>Support:</strong>{" "}
          <a href="/support/ticket">Create a Support Ticket</a>
        </li>
        <li>
          <strong>Mail:</strong> Let It Rip Legal Department, [Company Address]
        </li>
      </ul>

      <hr />

      <p className="text-sm text-gray-600 mt-8">
        <strong>Version History:</strong>
        <br />
        Version 2.0 (November 1, 2025): Added auction terms, shop limits, review
        policies
        <br />
        Version 1.0 (January 1, 2024): Initial terms of service
      </p>
    </LegalPageLayout>
  );
}
