import { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Refund & Return Policy - Let It Rip",
  description:
    "Understand our return and refund policy for imported products. Video unboxing requirement, return eligibility, and refund process for India deliveries.",
  robots: "index, follow",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund & Return Policy"
      lastUpdated="November 7, 2025"
      version="2.0"
      effectiveDate="November 1, 2025"
    >
      <h2>1. Overview</h2>
      <p>
        At Let It Rip, we want you to be completely satisfied with your
        purchase. This Refund & Return Policy outlines the conditions and
        procedures for returning products and receiving refunds. Please read
        this policy carefully before making a purchase.
      </p>
      <p>
        <strong>Important:</strong> Due to the nature of imported products
        from various countries (Japan, China, Hong Kong, USA, UK, etc.), all returns and refunds require proper documentation
        including unboxing video and same-day timestamp images as specified
        below.
      </p>

      <h2>2. Mandatory Documentation for Returns</h2>

      <h3>2.1 Unboxing Video Requirement ⚠️</h3>
      <p>
        <strong className="text-red-600">
          To be eligible for return or refund, you MUST provide an unboxing
          video.
        </strong>
      </p>
      <p>The unboxing video must:</p>
      <ul>
        <li>
          Be recorded in <strong>one continuous take</strong> (no cuts or edits)
        </li>
        <li>
          Show the{" "}
          <strong>sealed package with shipping label clearly visible</strong> at
          the start
        </li>
        <li>
          Capture the <strong>entire unboxing process</strong> from start to
          finish
        </li>
        <li>
          Show all <strong>sides of the product and packaging</strong>
        </li>
        <li>
          Clearly display any <strong>damage, defects, or discrepancies</strong>
        </li>
        <li>
          Include <strong>timestamp/date visible</strong> on video (enable
          camera timestamp)
        </li>
        <li>
          Have <strong>good lighting</strong> to see product details clearly
        </li>
        <li>
          Be recorded on the <strong>same day as delivery</strong>
        </li>
      </ul>
      <p className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
        <strong>
          ⚠️ Without unboxing video, return requests will be automatically
          rejected.
        </strong>
        <br />
        We recommend recording unboxing for all international shipments to
        protect your purchase.
      </p>

      <h3>2.2 Same-Day Timestamp Images 📸</h3>
      <p>In addition to the video, you must provide:</p>
      <ul>
        <li>
          <strong>Minimum 5-10 clear photos</strong> of the product from all
          angles
        </li>
        <li>
          Photos must show <strong>visible timestamp/date</strong> (use camera
          timestamp feature or timestamp app)
        </li>
        <li>
          Photos must be taken on the <strong>same day as delivery</strong>
        </li>
        <li>Show product defects, damage, or issues clearly</li>
        <li>Include photos of packaging if damaged</li>
        <li>Include photos of any missing items or accessories</li>
      </ul>

      <h3>2.3 Why These Requirements?</h3>
      <p>These strict requirements protect both buyers and sellers because:</p>
      <ul>
        <li>Products are imported internationally and may have multiple handlers</li>
        <li>Products are often high-value collectibles and electronics</li>
        <li>It helps identify when and where damage occurred</li>
        <li>Prevents fraudulent claims and ensures fair resolution</li>
        <li>Required by our shipping insurance for claim processing</li>
      </ul>

      <h2>3. Return Eligibility</h2>

      <h3>3.1 Eligible Returns (Within 30 Days)</h3>
      <p>
        You may return a product within <strong>30 days of delivery</strong> if
        it meets the following conditions:
      </p>
      <ul>
        <li>
          <strong>Damaged or Defective:</strong> Product arrived damaged or has
          manufacturing defects
        </li>
        <li>
          <strong>Wrong Item:</strong> You received a different product than
          ordered
        </li>
        <li>
          <strong>Missing Parts:</strong> Product is incomplete or missing
          accessories
        </li>
        <li>
          <strong>Significantly Not as Described:</strong> Product differs
          materially from listing
        </li>
        <li>
          <strong>Quality Issues:</strong> Product is counterfeit, fake, or
          significantly lower quality than described
        </li>
      </ul>
      <p>
        <strong>Buyer's Remorse Returns:</strong> Change of mind returns are
        accepted if product is unused, unopened, in original packaging, with all
        tags and seals intact. Buyer pays return shipping.
      </p>

      <h3>3.2 Non-Returnable Items ❌</h3>
      <p>The following items cannot be returned:</p>
      <ul>
        <li>Items marked as "Final Sale" or "Non-Returnable" in the listing</li>
        <li>
          Opened collectibles (TCG booster packs, blind boxes, sealed
          merchandise)
        </li>
        <li>Digital products, gift cards, or vouchers</li>
        <li>Custom-made or personalized items</li>
        <li>Intimate items (underwear, swimwear) if seal is broken</li>
        <li>Perishable goods (food, cosmetics past 7 days)</li>
        <li>Items damaged due to misuse or neglect by buyer</li>
        <li>Items returned without proper documentation (video + photos)</li>
        <li>Items where seller explicitly disabled returns</li>
      </ul>

      <h3>3.3 Return Window</h3>
      <ul>
        <li>
          <strong>Standard Returns:</strong> 30 days from delivery date
        </li>
        <li>
          <strong>Damaged/Defective:</strong> Report within 48 hours, return
          within 30 days
        </li>
        <li>
          <strong>Wrong Item:</strong> Report within 48 hours, return within 30
          days
        </li>
        <li>
          <strong>Late Claims:</strong> Claims made after 48 hours may require
          additional proof
        </li>
      </ul>

      <h2>4. Return Process</h2>

      <h3>Step 1: Report the Issue (Within 48 Hours)</h3>
      <ol>
        <li>Log into your account</li>
        <li>Go to "My Orders" → Select the order → Click "Return Item"</li>
        <li>Select return reason from dropdown</li>
        <li>Provide detailed description of the issue</li>
        <li>
          <strong>Upload unboxing video</strong> (required, max 500MB, MP4/MOV
          format)
        </li>
        <li>
          <strong>Upload timestamp photos</strong> (5-10 images, JPG/PNG format)
        </li>
        <li>Submit return request</li>
      </ol>

      <h3>Step 2: Seller Review (24-48 Hours)</h3>
      <ul>
        <li>Seller reviews your return request and documentation</li>
        <li>Seller may approve, reject, or request more information</li>
        <li>You'll receive email notification of the decision</li>
        <li>If rejected, you can escalate to admin for review</li>
      </ul>

      <h3>Step 3: Ship the Product Back</h3>
      <p>If return is approved:</p>
      <ul>
        <li>Pack item securely in original packaging (if available)</li>
        <li>
          Print the return shipping label (provided by us or self-arranged)
        </li>
        <li>Ship within 7 days of approval to our India warehouse address</li>
        <li>Upload tracking number in return request</li>
        <li>
          <strong>Keep proof of shipment</strong> until refund is processed
        </li>
      </ul>
      <p>
        <strong>Return Shipping Costs:</strong>
      </p>
      <ul>
        <li>
          <strong>Damaged/Defective/Wrong Item:</strong> We pay (prepaid
          label provided or reimbursement)
        </li>
        <li>
          <strong>Buyer's Remorse:</strong> Buyer pays (self-arrange return
          shipping within India)
        </li>
        <li>
          Domestic return shipping within India: ₹100-300 depending on weight and location
        </li>
      </ul>

      <h3>Step 4: Inspection & Refund Processing</h3>
      <ul>
        <li>We inspect returned item (1-3 business days after receipt at our warehouse)</li>
        <li>If approved, refund is processed within 3-5 business days</li>
        <li>You'll receive email confirmation when refund is issued</li>
      </ul>

      <h2>5. Refund Methods & Timeline</h2>

      <h3>5.1 Refund Methods</h3>
      <p>Refunds are issued to your original payment method:</p>
      <ul>
        <li>
          <strong>UPI:</strong> 1-3 business days (instant to 24 hours
          typically)
        </li>
        <li>
          <strong>Credit/Debit Card:</strong> 5-7 business days (depends on
          bank)
        </li>
        <li>
          <strong>Net Banking:</strong> 3-5 business days
        </li>
        <li>
          <strong>Wallet (Paytm, PhonePe):</strong> 1-3 business days
        </li>
        <li>
          <strong>Let It Rip Wallet:</strong> Instant (can be used for future
          purchases)
        </li>
      </ul>

      <h3>5.2 Refund Amount</h3>
      <p>Your refund includes:</p>
      <ul>
        <li>
          <strong>Product price:</strong> Full amount paid
        </li>
        <li>
          <strong>Original shipping:</strong> Refunded if item was
          damaged/defective/wrong
        </li>
        <li>
          <strong>Return shipping:</strong> Reimbursed if seller was at fault
        </li>
      </ul>
      <p>Refund deductions:</p>
      <ul>
        <li>
          <strong>Restocking fee:</strong> 10-20% for buyer's remorse returns
          (if item was used)
        </li>
        <li>
          <strong>Return shipping:</strong> Deducted for buyer's remorse returns
        </li>
        <li>
          <strong>Missing parts:</strong> Prorated refund if accessories are
          missing
        </li>
        <li>
          <strong>Damage:</strong> Partial refund if item returned damaged (not
          as received)
        </li>
      </ul>

      <h3>5.3 Partial Refunds</h3>
      <p>Partial refunds may be issued if:</p>
      <ul>
        <li>Item is returned significantly later than expected</li>
        <li>Item shows signs of use beyond inspection</li>
        <li>Missing original packaging or accessories</li>
        <li>Item condition doesn't match unboxing video</li>
        <li>Both parties agree to partial refund instead of full return</li>
      </ul>

      <h2>6. Damaged or Defective Items</h2>

      <h3>6.1 Reporting Damage</h3>
      <p>
        <strong>Report damage within 48 hours of delivery.</strong>
      </p>
      <p>Provide:</p>
      <ul>
        <li>Unboxing video showing damage</li>
        <li>Same-day timestamp photos of damaged item</li>
        <li>Photos of outer packaging showing shipping damage</li>
        <li>Description of what's damaged</li>
      </ul>

      <h3>6.2 Resolution Options</h3>
      <p>For damaged or defective items, you may choose:</p>
      <ol>
        <li>
          <strong>Full Refund:</strong> Return item for complete refund
        </li>
        <li>
          <strong>Replacement:</strong> Exchange for same item (if available)
        </li>
        <li>
          <strong>Partial Refund:</strong> Keep item with discount (if damage is
          minor)
        </li>
        <li>
          <strong>Repair:</strong> Seller arranges repair (for electronics)
        </li>
      </ol>

      <h3>6.3 Shipping Damage vs. Product Defect</h3>
      <ul>
        <li>
          <strong>Shipping Damage:</strong> Covered by shipping insurance,
          faster resolution
        </li>
        <li>
          <strong>Product Defect:</strong> Our responsibility, handled at our India warehouse
        </li>
        <li>Unboxing video helps determine which category applies</li>
      </ul>

      <h2>7. Wrong Item or Missing Items</h2>
      <p>If you receive wrong or incomplete items:</p>
      <ul>
        <li>Report within 48 hours with unboxing video proof</li>
        <li>Do not use or open the wrong item (keep sealed if possible)</li>
        <li>Seller will arrange pickup/return and ship correct item</li>
        <li>No cost to buyer for seller's shipping errors</li>
        <li>Priority processing for wrong item claims</li>
      </ul>

      <h2>8. Seller Disputes & Admin Intervention</h2>

      <h3>8.1 Escalation Process</h3>
      <p>If seller rejects your return request:</p>
      <ol>
        <li>Review seller's rejection reason</li>
        <li>Click "Escalate to Admin" in return request</li>
        <li>Provide additional evidence if needed</li>
        <li>Admin reviews case within 24-48 hours</li>
        <li>Admin decision is final and binding</li>
      </ol>

      <h3>8.2 Admin Intervention Scenarios</h3>
      <p>Admin may intervene when:</p>
      <ul>
        <li>Seller unreasonably rejects valid claim</li>
        <li>Buyer and seller cannot agree on resolution</li>
        <li>Evidence is conflicting or unclear</li>
        <li>Item value exceeds ₹10,000</li>
        <li>Multiple complaints against same seller</li>
      </ul>

      <h3>8.3 Admin Resolution Powers</h3>
      <p>Admin can:</p>
      <ul>
        <li>Override seller decision and approve return</li>
        <li>Issue partial refund from platform funds</li>
        <li>Penalize seller for unfair rejection</li>
        <li>Require additional documentation from either party</li>
        <li>Close case if evidence is insufficient</li>
      </ul>

      <h2>9. Auction Items</h2>
      <p>
        <strong>Special rules apply to auction items:</strong>
      </p>
      <ul>
        <li>All auction sales are final unless item is not as described</li>
        <li>Items must match auction description and photos exactly</li>
        <li>Unboxing video is mandatory for all auction purchases</li>
        <li>"As-is" auction items cannot be returned for quality issues</li>
        <li>Only damaged-in-shipping claims are accepted</li>
        <li>Report issues within 24 hours for auction items</li>
      </ul>

      <h2>10. Refund Processing Time</h2>
      <p>
        <strong>Total refund timeline:</strong>
      </p>
      <ul>
        <li>
          <strong>Return request submission:</strong> 24-48 hours for review
        </li>
        <li>
          <strong>Return shipping:</strong> 3-7 days (within India to our warehouse)
        </li>
        <li>
          <strong>Inspection:</strong> 1-3 business days
        </li>
        <li>
          <strong>Refund processing:</strong> 3-5 business days
        </li>
        <li>
          <strong>Total:</strong> 7-14 days from return approval to refund in
          account
        </li>
      </ul>

      <h2>11. Consumer Rights (India)</h2>
      <p>
        Under the Consumer Protection Act, 2019 (India), you have the right to:
      </p>
      <ul>
        <li>Return defective or substandard products</li>
        <li>Receive refund for products not matching description</li>
        <li>File complaint with consumer forum if unfairly treated</li>
        <li>Seek compensation for defective products causing harm</li>
      </ul>
      <p>
        Let It Rip complies with all Indian consumer protection laws and
        regulations.
      </p>

      <h2>12. Non-Delivery & Lost Packages</h2>

      <h3>12.1 Package Not Received</h3>
      <p>If your package shows "Delivered" but you didn't receive it:</p>
      <ul>
        <li>Check with neighbors, building security, or family members</li>
        <li>Verify delivery address in your order</li>
        <li>Contact courier company (we'll provide contact details)</li>
        <li>Report to us within 48 hours if still not found</li>
        <li>
          We'll file claim with shipping company and refund if package is
          confirmed lost
        </li>
      </ul>

      <h3>12.2 Package Lost in Transit</h3>
      <p>If tracking shows package is lost:</p>
      <ul>
        <li>We'll track with shipping company for 7 days</li>
        <li>If not found, we'll issue full refund or reship (your choice)</li>
        <li>Insurance covers lost packages (no cost to you)</li>
      </ul>

      <h2>13. Exceptions & Special Cases</h2>

      <h3>13.1 High-Value Items (₹50,000+)</h3>
      <ul>
        <li>May require additional documentation for returns</li>
        <li>Admin approval required for refund processing</li>
        <li>Extended inspection period (7-10 days)</li>
        <li>Mandatory insurance claim filing</li>
      </ul>

      <h3>13.2 Electronics & Gadgets</h3>
      <ul>
        <li>30-day warranty on all electronics (unless otherwise stated)</li>
        <li>DOA (Dead on Arrival) returns accepted within 7 days</li>
        <li>Manufacturer warranty applies after return window</li>
        <li>Software issues not covered (consult manufacturer)</li>
      </ul>

      <h3>13.3 Import Duty Refunds</h3>
      <p>If you paid customs duty and return the item:</p>
      <ul>
        <li>Customs duty is typically non-refundable</li>
        <li>You may claim refund from customs department directly</li>
        <li>We'll provide necessary documentation for your claim</li>
        <li>Process can take 3-6 months (handled by customs, not us)</li>
      </ul>

      <h2>14. Tips for Smooth Returns</h2>
      <ul>
        <li>
          <strong>Always record unboxing:</strong> Enable camera timestamp
          before delivery
        </li>
        <li>
          <strong>Inspect immediately:</strong> Check item within hours of
          delivery
        </li>
        <li>
          <strong>Keep packaging:</strong> Retain original box and materials for
          30 days
        </li>
        <li>
          <strong>Document everything:</strong> Photos, videos, screenshots of
          listing
        </li>
        <li>
          <strong>Report quickly:</strong> Don't wait until last day to report
          issues
        </li>
        <li>
          <strong>Communicate clearly:</strong> Provide detailed description of
          issues
        </li>
        <li>
          <strong>Be reasonable:</strong> Don't claim damage for normal wear
          from shipping
        </li>
      </ul>

      <h2>15. Contact Support</h2>
      <p>Need help with a return or refund?</p>
      <ul>
        <li>
          <strong>Email:</strong> returns@letitrip.com
        </li>
        <li>
          <strong>Support Ticket:</strong>{" "}
          <a href="/support/ticket">Create Ticket</a>
        </li>
        <li>
          <strong>Phone:</strong> +91-XXXX-XXXXXX (Mon-Sat, 10 AM - 7 PM IST)
        </li>
        <li>
          <strong>WhatsApp:</strong> +91-XXXX-XXXXXX (Quick queries)
        </li>
      </ul>

      <hr />

      <p className="text-sm text-gray-600 mt-8">
        <strong>Version History:</strong>
        <br />
        Version 2.0 (November 1, 2025): Added mandatory unboxing video and
        timestamp photo requirements, India-specific payment methods, auction
        return policy
        <br />
        Version 1.0 (January 1, 2024): Initial refund policy
      </p>
    </LegalPageLayout>
  );
}
