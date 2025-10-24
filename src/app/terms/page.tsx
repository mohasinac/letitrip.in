import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: January 1, 2024
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using JustForView.in (the "Service"), you
                accept and agree to be bound by the terms and provision of this
                agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily download one copy of the
                materials on JustForView.in for personal, non-commercial
                transitory viewing only. This is the grant of a license, not a
                transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>modify or copy the materials</li>
                <li>
                  use the materials for any commercial purpose or for any public
                  display (commercial or non-commercial)
                </li>
                <li>
                  attempt to decompile or reverse engineer any software
                  contained on JustForView.in
                </li>
                <li>
                  remove any copyright or other proprietary notations from the
                  materials
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Account Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Account Creation:</strong> You must provide accurate
                  and complete information when creating an account. You are
                  responsible for maintaining the security of your account and
                  password.
                </p>
                <p>
                  <strong>Account Responsibility:</strong> You are responsible
                  for all activities that occur under your account. You must
                  notify us immediately of any unauthorized use of your account.
                </p>
                <p>
                  <strong>Age Requirement:</strong> You must be at least 18
                  years old to create an account and make purchases.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                4. Product Information and Availability
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We strive to provide accurate product descriptions, images,
                  and pricing. However, we do not guarantee that product
                  descriptions or other content is accurate, complete, reliable,
                  current, or error-free.
                </p>
                <p>
                  All products are subject to availability. We reserve the right
                  to discontinue any product at any time without notice. Prices
                  are subject to change without notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                5. Orders and Payments
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Order Acceptance:</strong> Your receipt of an email
                  order confirmation does not signify our acceptance of your
                  order. We reserve the right to accept or decline your order
                  for any reason.
                </p>
                <p>
                  <strong>Pricing:</strong> All prices are in Indian Rupees
                  (INR) and include applicable taxes unless otherwise stated.
                </p>
                <p>
                  <strong>Payment:</strong> Payment must be made at the time of
                  purchase through our approved payment methods. We use secure
                  payment processing services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Auction Terms</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>Bidding:</strong> By placing a bid, you agree to
                  purchase the item at that price if you are the winning bidder.
                  All bids are final and cannot be retracted.
                </p>
                <p>
                  <strong>Auction End:</strong> Auctions end at the specified
                  time. The highest bidder at the end of the auction wins the
                  item.
                </p>
                <p>
                  <strong>Payment:</strong> Winning bidders must complete
                  payment within 24 hours of auction end.
                </p>
                <p>
                  <strong>Reserve Prices:</strong> Some auctions may have
                  reserve prices. If the reserve is not met, the item will not
                  be sold.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                7. Shipping and Delivery
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  We ship to addresses within India only. Shipping costs and
                  delivery times vary based on location and selected shipping
                  method.
                </p>
                <p>
                  Risk of loss and title for items purchased from us pass to you
                  upon delivery to the carrier. We are not responsible for lost
                  or stolen packages.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                8. Returns and Refunds
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Items may be returned within 7 days of delivery for a refund,
                  provided they are in original condition and packaging. Certain
                  items may not be eligible for return.
                </p>
                <p>
                  Auction items have specific return policies as stated in the
                  auction description. Custom or personalized items cannot be
                  returned unless defective.
                </p>
                <p>
                  Refunds will be processed to the original payment method
                  within 7-10 business days after we receive the returned item.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                9. Intellectual Property
              </h2>
              <p className="text-muted-foreground mb-4">
                The Service and its original content, features, and
                functionality are and will remain the exclusive property of
                JustForView.in and its licensors. The Service is protected by
                copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Prohibited Uses</h2>
              <p className="text-muted-foreground mb-4">
                You may not use our Service:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>
                  For any unlawful purpose or to solicit others to act
                  unlawfully
                </li>
                <li>
                  To violate any international, federal, provincial, or state
                  regulations, rules, laws, or local ordinances
                </li>
                <li>
                  To infringe upon or violate our intellectual property rights
                  or the intellectual property rights of others
                </li>
                <li>
                  To harass, abuse, insult, harm, defame, slander, disparage,
                  intimidate, or discriminate
                </li>
                <li>To submit false or misleading information</li>
                <li>
                  To upload or transmit viruses or any other type of malicious
                  code
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Disclaimer</h2>
              <p className="text-muted-foreground mb-4">
                The information on this website is provided on an "as is" basis.
                To the fullest extent permitted by law, this Company excludes
                all representations, warranties, conditions and terms relating
                to our website and the use of this website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                12. Limitation of Liability
              </h2>
              <p className="text-muted-foreground mb-4">
                In no event shall JustForView.in, nor its directors, employees,
                partners, agents, suppliers, or affiliates, be liable for any
                indirect, incidental, special, consequential or punitive
                damages, including without limitation, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from your
                use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground mb-4">
                These Terms shall be governed and construed in accordance with
                the laws of India, without regard to its conflict of law
                provisions. Our failure to enforce any right or provision of
                these Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">14. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. If a revision is material, we
                will try to provide at least 30 days notice prior to any new
                terms taking effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                15. Contact Information
              </h2>
              <div className="text-muted-foreground space-y-2">
                <p>
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:legal@justforview.in"
                    className="text-primary hover:underline"
                  >
                    legal@justforview.in
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
              <Link href="/" className="btn btn-outline">
                ← Back to Home
              </Link>
              <Link href="/privacy" className="btn btn-outline">
                Privacy Policy →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
