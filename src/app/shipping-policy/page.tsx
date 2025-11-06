import { Metadata } from "next";
import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Shipping Policy - Let It Rip",
  description:
    "Understand our domestic India shipping for imported products. Delivery times, shipping costs, and tracking information for in-stock and pre-order items.",
  robots: "index, follow",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPageLayout
      title="Shipping Policy"
      lastUpdated="November 7, 2025"
      version="2.0"
      effectiveDate="November 1, 2025"
    >
      <h2>1. Overview</h2>
      <p>
        Let It Rip is an India-based seller/reseller that imports authentic products from Japan, China, Hong Kong, USA, UK, and other countries. 
        We handle ALL import risks, customs duties, and international shipping ourselves. This Shipping Policy explains our domestic India shipping
        process, delivery timelines, and costs. You only pay for shipping within India - no customs hassles!
      </p>

      <h2>2. Shipping Process</h2>

      <h3>2.1 For IN-STOCK Items (Already Imported)</h3>
      <ol>
        <li>
          <strong>Order Placement:</strong> You place an order on Let It Rip
        </li>
        <li>
          <strong>Order Processing:</strong> We prepare your order at our India warehouse (1-2 days)
        </li>
        <li>
          <strong>Shipment:</strong> Package ships from our warehouse to your address within India
        </li>
        <li>
          <strong>Delivery:</strong> You receive the product at your doorstep (2-6 days depending on location)
        </li>
      </ol>

      <h3>2.2 For PRE-ORDER Items (To Be Imported)</h3>
      <ol>
        <li>
          <strong>Order Placement:</strong> You place a pre-order on Let It Rip
        </li>
        <li>
          <strong>International Purchase:</strong> We purchase from international marketplace (2-5 days)
        </li>
        <li>
          <strong>International Shipping:</strong> Item ships to our India warehouse (7-15 days)
        </li>
        <li>
          <strong>Customs Clearance:</strong> We handle customs clearance and pay all duties (2-5 days)
        </li>
        <li>
          <strong>Quality Check:</strong> We inspect the item at our warehouse (1-2 days)
        </li>
        <li>
          <strong>Domestic Shipment:</strong> Package ships from our warehouse to you (2-6 days)
        </li>
      </ol>

      <h3>2.3 Total Delivery Time</h3>
      <ul>
        <li>
          <strong>In-Stock Items:</strong> 3-7 business days (ready to ship from India)
        </li>
        <li>
          <strong>Pre-Order Items:</strong> 15-25 business days (includes international import + domestic delivery)
        </li>
        <li>
          <strong>Express Shipping:</strong> 2-4 business days (available for in-stock items only)
        </li>
      </ul>
      <p>
        <em>
          Note: Times are estimates and may vary due to location, holidays, weather, or carrier delays. Pre-order timelines depend on international supplier availability.
        </em>
      </p>

      <h2>3. Shipping Methods & Carriers</h2>

      <h3>3.1 Domestic India Carriers</h3>
      <p>We use the following trusted carriers for delivery within India:</p>
      <ul>
        <li>
          <strong>Bluedart:</strong> 2-4 days, fully tracked, signature required, reliable nationwide
        </li>
        <li>
          <strong>Delhivery:</strong> 3-5 days, fully tracked, good coverage in metro and tier 2 cities
        </li>
        <li>
          <strong>India Post:</strong> 4-7 days, tracked, reaches rural areas
        </li>
        <li>
          <strong>DTDC:</strong> 3-6 days, tracked, economical
        </li>
        <li>
          <strong>Ecom Express:</strong> 3-5 days, tracked, good for large parcels
        </li>
      </ul>

      <h3>3.2 Carrier Selection</h3>
      <p>Carrier is automatically selected based on:</p>
      <ul>
        <li>Your pin code and location (metro/tier 2/rural)</li>
        <li>Package weight and dimensions</li>
        <li>Product category and shipping requirements</li>
        <li>Shipping method chosen (standard/express)</li>
        <li>Carrier availability for your area</li>
      </ul>
      <p>You'll see the assigned carrier in order confirmation email. For remote areas, India Post may be used for better coverage.</p>

      <h2>4. Shipping Costs</h2>

      <h3>4.1 Cost Calculation</h3>
      <p>Shipping cost is calculated based on:</p>
      <ul>
        <li>
          <strong>Weight:</strong> Actual weight or volumetric weight (whichever
          is higher)
        </li>
        <li>
          <strong>Dimensions:</strong> Large items may have size-based
          surcharges
        </li>
        <li>
          <strong>Destination:</strong> Metro cities vs. remote areas
        </li>
        <li>
          <strong>Shipping speed:</strong> Express costs more than standard
        </li>
        <li>
          <strong>Product category:</strong> Fragile, batteries, liquids have
          additional handling charges
        </li>
      </ul>

      <h3>4.2 Typical Domestic Shipping Costs</h3>
      <p>
        <em>Sample costs for reference (actual costs shown at checkout):</em>
      </p>
      <ul>
        <li>
          <strong>Small package (0-500g):</strong> ₹40-80 (Standard),
          ₹100-150 (Express)
        </li>
        <li>
          <strong>Medium package (500g-2kg):</strong> ₹80-150 (Standard),
          ₹150-300 (Express)
        </li>
        <li>
          <strong>Large package (2-5kg):</strong> ₹150-300 (Standard),
          ₹300-500 (Express)
        </li>
        <li>
          <strong>Heavy package (5kg+):</strong> ₹300+ (Calculated at checkout)
        </li>
        <li>
          <strong>FREE SHIPPING:</strong> On orders above ₹999 (standard shipping only)
        </li>
      </ul>

      <h3>4.3 Free Shipping Promotions</h3>
      <p>Free or discounted shipping may be available when:</p>
      <ul>
        <li>Order value exceeds ₹10,000 (standard shipping)</li>
        <li>Special promotional periods (announced on site)</li>
        <li>Seller offers free shipping on certain items</li>
        <li>Bulk orders or multiple items from same seller</li>
      </ul>

      <h2>5. Delivery Locations</h2>

      <h3>5.1 Serviceable Areas (India)</h3>
      <p>We deliver to:</p>
      <ul>
        <li>
          <strong>All major cities:</strong> Delhi, Mumbai, Bangalore, Kolkata,
          Chennai, Hyderabad, Pune, etc.
        </li>
        <li>
          <strong>Tier 2/3 cities:</strong> Most district headquarters and towns
        </li>
        <li>
          <strong>Rural areas:</strong> Subject to courier serviceability (check
          at checkout)
        </li>
        <li>
          <strong>Remote locations:</strong> May have longer delivery times or
          additional charges
        </li>
      </ul>

      <h3>5.2 Non-Serviceable Areas</h3>
      <p>We cannot deliver to:</p>
      <ul>
        <li>PO Box addresses (residential/commercial address required)</li>
        <li>Military bases or restricted zones (without special clearance)</li>
        <li>Areas where international couriers don't operate</li>
        <li>Disputed territories or border regions (case-by-case basis)</li>
      </ul>
      <p>Pin code serviceability is checked automatically at checkout.</p>

      <h3>5.3 Address Requirements</h3>
      <p>Your shipping address must include:</p>
      <ul>
        <li>Complete street address with landmark</li>
        <li>Apartment/building number and floor</li>
        <li>City, State, and Pin Code</li>
        <li>Valid phone number (for delivery coordination)</li>
        <li>Recipient name (as per government ID for customs)</li>
      </ul>
      <p>
        <strong>Important:</strong> Incorrect addresses may cause delivery
        delays or return to sender. Address changes after shipment may incur
        fees.
      </p>

      <h2>6. Order Tracking</h2>

      <h3>6.1 Tracking Your Order</h3>
      <p>You can track your order at each stage:</p>
      <ol>
        <li>
          <strong>Order Placed:</strong> Confirmation email sent
        </li>
        <li>
          <strong>Processing:</strong> We're purchasing from Japan
        </li>
        <li>
          <strong>Shipped to Japan Warehouse:</strong> Domestic Japan tracking
        </li>
        <li>
          <strong>Quality Check Complete:</strong> Ready for international
          shipping
        </li>
        <li>
          <strong>International Shipping:</strong> International tracking number
          provided
        </li>
        <li>
          <strong>In Transit:</strong> Package on the way to India
        </li>
        <li>
          <strong>Customs Clearance:</strong> Package at Indian customs
        </li>
        <li>
          <strong>Out for Delivery:</strong> Package with local courier
        </li>
        <li>
          <strong>Delivered:</strong> Signature confirmation received
        </li>
      </ol>

      <h3>6.2 Tracking Methods</h3>
      <ul>
        <li>
          <strong>My Orders page:</strong> Real-time status updates
        </li>
        <li>
          <strong>Email notifications:</strong> Updates at each stage
        </li>
        <li>
          <strong>SMS alerts:</strong> Delivery updates (if enabled)
        </li>
        <li>
          <strong>Courier website:</strong> Direct tracking on DHL/FedEx/India
          Post
        </li>
      </ul>

      <h2>7. Customs & Import Duties</h2>

      <h3>7.1 Customs Clearance Process</h3>
      <p>All international shipments go through Indian customs:</p>
      <ul>
        <li>Packages are inspected by customs officials</li>
        <li>Import duties and taxes are calculated</li>
        <li>Duties must be paid before delivery (if applicable)</li>
        <li>Clearance typically takes 1-5 business days</li>
      </ul>

      <h3>7.2 Import Duties & Taxes (India)</h3>
      <p>
        <strong>Who pays?</strong> Buyer is responsible for all customs duties
        and taxes.
      </p>
      <p>Typical charges:</p>
      <ul>
        <li>
          <strong>Basic Customs Duty (BCD):</strong> 0-35% depending on product
          category
        </li>
        <li>
          <strong>GST:</strong> 18% on (product value + shipping + BCD)
        </li>
        <li>
          <strong>Social Welfare Surcharge:</strong> 10% on BCD (if applicable)
        </li>
        <li>
          <strong>Handling fee:</strong> ₹100-500 (charged by courier)
        </li>
      </ul>

      <h3>7.3 Duty-Free Exemptions</h3>
      <p>Personal imports may be duty-free if:</p>
      <ul>
        <li>Total value is below ₹50,000 (INR)</li>
        <li>Item is for personal use (not commercial)</li>
        <li>
          Marked as "gift" with value under $100 (varies by customs officer)
        </li>
      </ul>
      <p>
        <em>
          Note: Exemptions are at customs discretion. We cannot guarantee
          duty-free clearance.
        </em>
      </p>

      <h3>7.4 Paying Customs Duties</h3>
      <p>Payment methods:</p>
      <ul>
        <li>
          <strong>Pay to courier:</strong> Delivery partner collects before
          delivery (COD for duties)
        </li>
        <li>
          <strong>Online payment:</strong> Some couriers allow pre-payment
        </li>
        <li>
          <strong>Direct to customs:</strong> For India Post shipments (at post
          office)
        </li>
      </ul>
      <p>
        <strong>Important:</strong> Refusal to pay customs duties will result in
        package being returned to Japan. Return shipping and restocking fees
        will apply.
      </p>

      <h2>8. Delivery Process</h2>

      <h3>8.1 Delivery Attempts</h3>
      <ul>
        <li>Courier will attempt delivery 3 times</li>
        <li>You'll receive advance notice (call/SMS) before delivery</li>
        <li>
          If you're unavailable, reschedule delivery or provide alternate
          address
        </li>
        <li>
          After 3 failed attempts, package is held at courier facility for 7
          days
        </li>
        <li>Unclaimed packages are returned to sender (fees apply)</li>
      </ul>

      <h3>8.2 Signature Requirement</h3>
      <p>For security, deliveries require:</p>
      <ul>
        <li>
          <strong>Signature:</strong> Recipient or authorized person must sign
        </li>
        <li>
          <strong>ID verification:</strong> Government ID may be requested for
          high-value items
        </li>
        <li>
          <strong>OTP verification:</strong> For certain deliveries
        </li>
      </ul>

      <h3>8.3 Contactless Delivery</h3>
      <p>We offer contactless delivery options:</p>
      <ul>
        <li>Package left at doorstep with photo proof</li>
        <li>Building security can receive on your behalf</li>
        <li>Neighbor delivery (with your pre-authorization)</li>
      </ul>

      <h2>9. Packaging & Insurance</h2>

      <h3>9.1 Our Packaging Standards</h3>
      <p>All items are securely packaged:</p>
      <ul>
        <li>
          <strong>Original packaging preserved:</strong> Items kept in original
          boxes when possible
        </li>
        <li>
          <strong>Protective materials:</strong> Bubble wrap, foam, air pillows
        </li>
        <li>
          <strong>Sturdy outer box:</strong> Double-walled corrugated boxes
        </li>
        <li>
          <strong>Fragile stickers:</strong> For delicate items
        </li>
        <li>
          <strong>Waterproof wrapping:</strong> Plastic wrap for water
          resistance
        </li>
      </ul>

      <h3>9.2 Shipping Insurance</h3>
      <p>All shipments are insured:</p>
      <ul>
        <li>
          <strong>Automatic coverage:</strong> Up to declared value (no extra
          cost)
        </li>
        <li>
          <strong>Loss or damage:</strong> Full refund or replacement if insured
          claim is approved
        </li>
        <li>
          <strong>Claim process:</strong> Requires unboxing video + photos (see
          Refund Policy)
        </li>
        <li>
          <strong>Processing time:</strong> 7-14 days for insurance claims
        </li>
      </ul>

      <h3>9.3 High-Value Items (₹50,000+)</h3>
      <ul>
        <li>Additional insurance automatically added</li>
        <li>Tamper-proof packaging and seals</li>
        <li>GPS tracking for premium shipments</li>
        <li>Signature + ID verification mandatory</li>
      </ul>

      <h2>10. Prohibited & Restricted Items</h2>

      <h3>10.1 Cannot Ship to India</h3>
      <p>Indian customs prohibits import of:</p>
      <ul>
        <li>Weapons, firearms, ammunition, explosives</li>
        <li>Illegal drugs and narcotics</li>
        <li>Counterfeit goods and pirated media</li>
        <li>Obscene or pornographic materials</li>
        <li>Live animals and plants</li>
        <li>Hazardous materials (certain chemicals, flammables)</li>
        <li>Currency and negotiable instruments</li>
        <li>Products violating intellectual property rights</li>
      </ul>

      <h3>10.2 Restricted Items (Special Permits Required)</h3>
      <ul>
        <li>Medicines and pharmaceuticals (need import license)</li>
        <li>Food products (need FSSAI approval)</li>
        <li>Cosmetics with special ingredients (need drug license)</li>
        <li>Electronics with Bluetooth/WiFi (BIS certification required)</li>
        <li>Satellite phones and encryption devices</li>
      </ul>

      <h3>10.3 Shipping Restrictions</h3>
      <p>Carriers have additional restrictions:</p>
      <ul>
        <li>
          <strong>Lithium batteries:</strong> Limited quantity, must be
          installed in device
        </li>
        <li>
          <strong>Liquids:</strong> Max 100ml per container for airmail
        </li>
        <li>
          <strong>Aerosols:</strong> Cannot ship by air
        </li>
        <li>
          <strong>Perfumes/alcohol:</strong> Surface mail only, quantity limits
        </li>
      </ul>
      <p>
        We'll inform you during checkout if an item cannot be shipped to India.
      </p>

      <h2>11. Delays & Issues</h2>

      <h3>11.1 Common Delay Causes</h3>
      <ul>
        <li>
          <strong>Customs inspection:</strong> Random checks can add 2-7 days
        </li>
        <li>
          <strong>Incomplete address:</strong> Courier cannot locate delivery
          address
        </li>
        <li>
          <strong>Recipient unavailable:</strong> Multiple delivery attempts
        </li>
        <li>
          <strong>Holidays:</strong> Indian/Japanese national holidays
        </li>
        <li>
          <strong>Weather:</strong> Natural disasters, heavy rain, floods
        </li>
        <li>
          <strong>Port congestion:</strong> Peak season cargo backlog
        </li>
        <li>
          <strong>Pandemic restrictions:</strong> COVID-related delays
        </li>
      </ul>

      <h3>11.2 What We Do</h3>
      <p>If your shipment is delayed:</p>
      <ul>
        <li>We proactively track all shipments</li>
        <li>Contact carrier to expedite if stuck</li>
        <li>Update you via email/SMS on status</li>
        <li>
          Escalate to courier if delay exceeds 5 days from expected delivery
        </li>
        <li>File claim if package is lost (after 21 days)</li>
      </ul>

      <h3>11.3 Your Rights</h3>
      <p>If delivery is significantly delayed (30+ days):</p>
      <ul>
        <li>Request status update from support</li>
        <li>
          Cancel order and get full refund (if not yet shipped from Japan)
        </li>
        <li>File complaint if delay is due to our error</li>
      </ul>

      <h2>12. Cash on Delivery (COD)</h2>

      <h3>12.1 COD Availability</h3>
      <p>
        <strong>Cash on Delivery is NOT available by default</strong> for
        international shipments from Japan.
      </p>
      <p>
        <strong>Why?</strong> We must pay for the product in Japan before
        shipping, so advance payment is required.
      </p>

      <h3>12.2 Shop-Specific COD</h3>
      <p>Some sellers may offer COD if they:</p>
      <ul>
        <li>Are verified premium sellers</li>
        <li>Offer this option explicitly on product page</li>
        <li>Accept the risk of non-payment</li>
      </ul>
      <p>
        COD availability will be clearly shown at checkout if offered by the
        seller.
      </p>

      <h3>12.3 Accepted Payment Methods</h3>
      <p>
        <strong>We accept the following payment methods (India):</strong>
      </p>
      <ul>
        <li>
          <strong>UPI:</strong> Google Pay, PhonePe, Paytm, BHIM (instant)
        </li>
        <li>
          <strong>Credit/Debit Cards:</strong> Visa, Mastercard, RuPay, Amex
        </li>
        <li>
          <strong>Net Banking:</strong> All major Indian banks
        </li>
        <li>
          <strong>Wallets:</strong> Paytm, PhonePe, Amazon Pay, Mobikwik
        </li>
        <li>
          <strong>EMI:</strong> 3/6/9/12 months (on orders above ₹10,000)
        </li>
        <li>
          <strong>International Cards:</strong> Accepted with currency
          conversion
        </li>
      </ul>
      <p>
        All payments are processed through <strong>Razorpay</strong> (secure,
        PCI-DSS compliant).
      </p>

      <h2>13. Order Cancellation & Shipping</h2>

      <h3>13.1 Cancellation Before Shipping</h3>
      <ul>
        <li>Cancel anytime before item ships from Japan warehouse</li>
        <li>Full refund processed within 5-7 business days</li>
        <li>No cancellation fee</li>
      </ul>

      <h3>13.2 Cancellation After Shipping</h3>
      <ul>
        <li>Cannot cancel once international shipment has started</li>
        <li>You can refuse delivery and return to sender</li>
        <li>
          Return shipping fees will be deducted from refund (₹2,000-5,000)
        </li>
        <li>Refund processed after we receive returned item</li>
      </ul>

      <h2>14. Bulk Orders & Corporate Shipping</h2>
      <p>For bulk orders (10+ items) or corporate purchases:</p>
      <ul>
        <li>
          <strong>Consolidated shipping:</strong> Multiple items in one shipment
          (lower per-item cost)
        </li>
        <li>
          <strong>Customs assistance:</strong> We help with documentation
        </li>
        <li>
          <strong>Commercial invoice:</strong> Provided for business imports
        </li>
        <li>
          <strong>Dedicated support:</strong> Account manager for large orders
        </li>
      </ul>
      <p>
        Contact us at bulk@letitrip.com for corporate shipping arrangements.
      </p>

      <h2>15. Environmental Responsibility</h2>
      <p>We're committed to sustainable shipping:</p>
      <ul>
        <li>
          <strong>Minimal packaging:</strong> Only necessary protective
          materials
        </li>
        <li>
          <strong>Recyclable materials:</strong> Cardboard, paper, biodegradable
          fillers
        </li>
        <li>
          <strong>Reuse original packaging:</strong> When items come in good
          boxes
        </li>
        <li>
          <strong>Carbon offset:</strong> Partner with eco-friendly carriers
          when available
        </li>
        <li>
          <strong>Consolidated shipping:</strong> Multiple orders combined to
          reduce trips
        </li>
      </ul>

      <h2>16. Contact Shipping Support</h2>
      <p>For shipping-related inquiries:</p>
      <ul>
        <li>
          <strong>Email:</strong> shipping@letitrip.com
        </li>
        <li>
          <strong>Support Ticket:</strong>{" "}
          <a href="/support/ticket">Create Ticket</a>
        </li>
        <li>
          <strong>Phone:</strong> +91-XXXX-XXXXXX (Mon-Sat, 10 AM - 7 PM IST)
        </li>
        <li>
          <strong>Track Order:</strong> <a href="/user/orders">My Orders</a>
        </li>
      </ul>

      <hr />

      <p className="text-sm text-gray-600 mt-8">
        <strong>Version History:</strong>
        <br />
        Version 2.0 (November 1, 2025): Updated with India-specific information,
        COD policy, UPI payment methods
        <br />
        Version 1.0 (January 1, 2024): Initial shipping policy
      </p>
    </LegalPageLayout>
  );
}
