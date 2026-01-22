/**
 * FAQ Page
 *
 * Frequently Asked Questions about Let It Rip platform.
 *
 * @page /faq - FAQ page
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Let It Rip India",
  description:
    "Get answers to all your questions about buying, selling, auctions, shipping, payments, returns & more on Let It Rip - India's trusted e-commerce and auction marketplace. Fast support, secure transactions.",
  keywords: [
    "FAQ",
    "frequently asked questions",
    "help",
    "support",
    "customer service",
    "auction help",
    "returns policy",
    "shipping info",
    "payment methods",
    "seller guide",
  ],
  openGraph: {
    title: "FAQ | Let It Rip - Your Questions Answered",
    description:
      "Find comprehensive answers to all your questions about shopping, selling, and auctions on India's leading marketplace",
  },
};

export default function FAQPage() {
  const faqCategories = [
    {
      title: "General",
      icon: "❓",
      faqs: [
        {
          question: "What is Let It Rip?",
          answer:
            "Let It Rip is India's premier online marketplace that combines traditional e-commerce with exciting auction features. We connect buyers and sellers across India, offering a wide range of products from electronics to fashion, home goods, and more. You can buy products at fixed prices or participate in live auctions to get amazing deals.",
        },
        {
          question: "How do I create an account?",
          answer:
            'Click the "Sign Up" button in the top navigation, fill in your details including name, email, and password, then verify your email address through the link sent to your inbox. You can also sign up instantly using your Google or Facebook account for a quicker registration process.',
        },
        {
          question: "Is Let It Rip available across India?",
          answer:
            "Yes! We deliver to 200+ cities and towns across India, covering all major metros, tier-2, and tier-3 cities. Shipping times typically range from 3-7 business days depending on your location. Remote areas may take slightly longer.",
        },
        {
          question: "Are the products on Let It Rip authentic?",
          answer:
            "Absolutely! We verify all sellers and products before listing. Every item is checked for authenticity, and we maintain strict quality standards. We offer 100% original products with proper documentation and warranties where applicable.",
        },
        {
          question: "How can I contact customer support?",
          answer:
            "You can reach us through multiple channels: Email us at support@letitrip.in, call our helpline at +91-XXXXX-XXXXX (10 AM - 7 PM IST, Mon-Sat), use the live chat feature on our website, or visit our Contact page to submit a support ticket.",
        },
      ],
    },
    {
      title: "Products & Ordering",
      icon: "🛒",
      faqs: [
        {
          question: "How do I place an order?",
          answer:
            "Browse products using search or categories, click on a product to view details, select quantity and specifications (size, color, etc.), click 'Add to Cart', review your cart, proceed to checkout, enter/select shipping address, choose payment method, and confirm your order. You'll receive an order confirmation email immediately.",
        },
        {
          question: "Can I track my order?",
          answer:
            "Yes! Once your order ships, you'll receive a tracking number via email and SMS. You can track your order in real-time from your account dashboard under 'My Orders' or by clicking the tracking link in the shipment notification email.",
        },
        {
          question: "What if a product is out of stock?",
          answer:
            "If a product is out of stock, you'll see an 'Out of Stock' or 'Notify Me' button. Click 'Notify Me' to receive an email alert when the product is back in stock. We regularly update our inventory and add new products.",
        },
        {
          question: "Can I order on WhatsApp?",
          answer:
            "Yes! Join our WhatsApp group or message us directly with product details. Our team will assist you with the order process, answer questions, and help complete your purchase. This is especially useful for bulk orders or special requests.",
        },
        {
          question: "Do you offer bulk/wholesale orders?",
          answer:
            "Yes, we provide special pricing for bulk orders. Contact our sales team at sales@letitrip.in with your requirements, and we'll create a custom quote. Minimum order quantities and discounts vary by product category.",
        },
        {
          question: "What payment methods are accepted?",
          answer:
            "We accept multiple payment methods for your convenience: Credit/Debit Cards (Visa, Mastercard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking (all major banks), Digital Wallets (Paytm, PhonePe, Mobikwik), and Cash on Delivery (available for orders under ₹50,000 in select locations). All payments are secured with 256-bit SSL encryption.",
        },
        {
          question: "Is Cash on Delivery (COD) available?",
          answer:
            "Yes, COD is available for orders under ₹50,000 in most serviceable areas. A small COD handling fee may apply. Some products and locations may not be eligible for COD. You'll see the COD option at checkout if available for your order.",
        },
        {
          question: "Can I cancel or modify my order?",
          answer:
            "Yes, you can cancel or modify orders before they're shipped. Log in to your account, go to 'My Orders', and click 'Cancel Order' or 'Modify Order'. If already shipped, you can refuse delivery or initiate a return after receiving the product. Refunds are processed within 5-7 business days.",
        },
        {
          question: "What is your return and refund policy?",
          answer:
            "Most products can be returned within 7-14 days of delivery (category-dependent). Items must be unused, in original condition with tags, packaging, and accessories intact. Refunds are processed to the original payment method within 5-7 business days after we receive the returned item. Certain categories like software, intimate wear, and personalized items are non-returnable.",
        },
        {
          question: "How do I return a product?",
          answer:
            "Go to 'My Orders', select the item, click 'Return', choose reason, and submit. We'll arrange a free pickup or provide return shipping instructions. Pack the item securely with all accessories and original packaging. Once received and inspected, your refund will be processed.",
        },
      ],
    },
    {
      title: "Auctions",
      icon: "⚡",
      faqs: [
        {
          question: "How do auctions work on Let It Rip?",
          answer:
            "Sellers list items with a starting bid price, reserve price (optional), and auction end time. Buyers place bids during the active auction period. Each bid must be higher than the current highest bid by the minimum increment amount. When the auction ends, the highest bidder wins and must complete payment within 48 hours. All bids are legally binding commitments to purchase.",
        },
        {
          question: "What is a reserve price?",
          answer:
            "A reserve price is the minimum price a seller is willing to accept for an item. If bidding doesn't reach the reserve price, the seller is not obligated to sell. Reserve prices are hidden from buyers to encourage competitive bidding.",
        },
        {
          question: "Can I retract or cancel my bid?",
          answer:
            "Bids are binding commitments and generally cannot be retracted. You can only retract a bid within the first hour of placement if you made a genuine error (wrong amount, wrong item). Frequent bid retractions or failure to complete purchases may result in account suspension and bidding restrictions.",
        },
        {
          question: "What happens if I win an auction?",
          answer:
            "Congratulations! You'll receive an email and SMS notification immediately. You must complete payment within 48 hours using any accepted payment method. Once paid, the seller ships the item to your registered address. Track your shipment from 'My Orders' section. Failure to pay within 48 hours may result in account penalties.",
        },
        {
          question:
            "Is there a buyer's premium or additional fees on auctions?",
          answer:
            "No buyer's premium! The final bid amount is your total purchase price. Only standard shipping charges (if applicable) are added. Unlike other platforms, we don't charge extra fees on auction wins, making it truly competitive pricing.",
        },
        {
          question: "How do I know if my bid is the highest?",
          answer:
            "You'll see a green 'Highest Bidder' badge on the auction page and receive real-time notifications. If someone outbids you, you'll get an instant email/SMS alert so you can bid again if interested. You can set up automatic bidding (proxy bidding) to automatically bid up to your maximum amount.",
        },
        {
          question: "What is auto-bidding or proxy bidding?",
          answer:
            "Auto-bidding lets you set your maximum bid amount. The system automatically places incremental bids on your behalf to keep you as the highest bidder, up to your maximum. This way, you don't have to monitor the auction constantly. Your maximum bid remains confidential.",
        },
      ],
    },
    {
      title: "Shipping & Delivery",
      icon: "🚚",
      faqs: [
        {
          question: "What are the shipping charges?",
          answer:
            "Shipping charges vary by product weight, dimensions, and delivery location. Standard shipping starts from ₹40-₹100. We offer FREE shipping on orders above ₹2,999 for most products. Express shipping is available at additional cost. You'll see exact charges at checkout before confirming your order.",
        },
        {
          question: "How long does delivery take?",
          answer:
            "Standard delivery: 5-7 business days for metros, 7-10 days for other cities. Express delivery: 2-4 business days (additional charges apply). Remote locations may take longer. Electronics and large items may require additional 1-2 days for quality checks and special packaging.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Currently, we ship only within India. International shipping will be available soon. Join our newsletter to get notified when we start international shipping.",
        },
        {
          question: "How do you ensure package safety during transit?",
          answer:
            "All products are carefully packed with bubble wrap, foam padding, and sturdy boxes. Fragile items get extra protection and 'Handle with Care' labels. We use trusted courier partners and all shipments are fully insured against damage or loss during transit.",
        },
        {
          question: "What if my package is damaged or lost?",
          answer:
            "If your package arrives damaged, don't accept it and contact us immediately. For lost packages, we'll investigate with the courier. In both cases, we'll either reship the item or provide a full refund. All shipments are insured, so you're fully protected.",
        },
        {
          question: "Can I change my delivery address after ordering?",
          answer:
            "Yes, if the order hasn't shipped yet. Contact customer support immediately with your order number and new address. Once shipped, address changes are not possible, but you can refuse delivery and we'll rearrange delivery to the new address (may incur charges).",
        },
      ],
    },
    {
      title: "Selling on Let It Rip",
      icon: "💼",
      faqs: [
        {
          question: "How do I become a seller?",
          answer:
            "Click 'Become a Seller', complete registration with business/individual details, provide KYC documents (Aadhaar, PAN, GST if applicable), set up your shop profile, and await verification (24-48 hours). Once approved, you can start listing products immediately.",
        },
        {
          question: "What are the seller fees?",
          answer:
            "Commission: 5-15% per sale (category-dependent). Payment gateway charges: ~2%. No listing fees, no monthly subscription. You only pay when you make a sale. First 3 months get 50% commission discount for new sellers!",
        },
        {
          question: "How do I list a product or auction?",
          answer:
            "From your Seller Dashboard, click 'Add Product' or 'Create Auction'. Fill in details (title, description, price, images, category, specifications). For auctions, set starting bid, duration, and optional reserve price. Review and publish. Products go live after quick moderation (2-4 hours).",
        },
        {
          question: "When do I receive payment for my sales?",
          answer:
            "Payments are released 7 days after delivery confirmation or 14 days after shipment (whichever is earlier). This ensures buyer satisfaction. You can track pending and received payments in your Seller Dashboard. Payments are transferred directly to your linked bank account.",
        },
        {
          question: "What if a buyer wants to return a product?",
          answer:
            "You'll be notified of return requests. Review the reason and approve/reject (valid reasons must be approved). Arrange pickup or provide return address. Once received, inspect the product within 2 days. If condition is acceptable, the refund is processed and deducted from your next settlement.",
        },
        {
          question: "Can I promote my products?",
          answer:
            "Yes! We offer various promotion options: Featured listings (appear at top of search results), Sponsored ads (banner placements), Deal of the Day slots, and Email marketing campaigns. Contact our seller support for pricing and packages. Performance analytics help track ROI.",
        },
        {
          question: "How do I handle shipping?",
          answer:
            "Option 1: Use our logistics partners (recommended) - discounted rates, automatic tracking, insurance included. Option 2: Self-ship - arrange your own courier, provide tracking, more responsibility. We recommend Option 1 for hassle-free fulfillment and better buyer experience.",
        },
      ],
    },
    {
      title: "Account & Security",
      icon: "🔒",
      faqs: [
        {
          question: "How do I reset my password?",
          answer:
            "Click 'Forgot Password' on the login page, enter your registered email, and click 'Send Reset Link'. Check your email for the password reset link (check spam folder if not in inbox). Click the link and create a new strong password. For security, the reset link expires in 1 hour.",
        },
        {
          question: "Is my personal and payment information secure?",
          answer:
            "Absolutely! We use industry-standard 256-bit SSL encryption for all data transmission. Payment information is processed by PCI-DSS compliant payment gateways - we never store your card details. Your personal information is protected per our Privacy Policy and never sold to third parties.",
        },
        {
          question: "How do I enable two-factor authentication (2FA)?",
          answer:
            "Go to Account Settings > Security > Enable 2FA. Choose SMS or authenticator app. Follow setup instructions. Once enabled, you'll need to enter a code sent to your phone or generated by your app in addition to your password when logging in. This adds an extra layer of security.",
        },
        {
          question: "Can I delete my account?",
          answer:
            "Yes, go to Account Settings > Privacy > Delete Account. Please note: This action is permanent and irreversible. All your data, order history, wishlists, and seller information (if applicable) will be permanently deleted. You must clear all pending orders and payments before deletion.",
        },
        {
          question: "What should I do if my account is compromised?",
          answer:
            "Immediately reset your password, enable 2FA, and contact our security team at security@letitrip.in. Review recent orders and account activity. We'll investigate and take necessary action. Never share your password or OTP with anyone - our staff will never ask for these.",
        },
      ],
    },
    {
      title: "Offers & Discounts",
      icon: "🎁",
      faqs: [
        {
          question: "How do I apply a coupon code?",
          answer:
            "Add products to cart, proceed to checkout, find the 'Apply Coupon' field, enter your coupon code, and click 'Apply'. The discount will be reflected in your order total. Only one coupon can be used per order. Some coupons have minimum order value or category restrictions.",
        },
        {
          question: "Why isn't my coupon working?",
          answer:
            "Common reasons: Coupon expired, minimum order value not met, applicable only to specific categories/products, already used (single-use coupons), not applicable with other offers. Check coupon terms and conditions. Contact support if you believe there's an error.",
        },
        {
          question: "Do you offer student or military discounts?",
          answer:
            "Yes! Register with your valid student ID or military ID for special discounts. Students get 10% extra off on select categories. Military personnel get 15% off. Verification required. Special discount codes will be sent to your registered email.",
        },
        {
          question: "How can I get notified about deals and offers?",
          answer:
            "Subscribe to our newsletter (footer of website), enable push notifications, follow us on social media (Instagram, Facebook, Twitter), join our WhatsApp broadcast group, or check the 'Deals' page regularly. We send weekly deals roundup every Friday with upcoming offers.",
        },
      ],
    },
    {
      title: "Technical Issues",
      icon: "⚙️",
      faqs: [
        {
          question:
            "The website/app is not loading properly. What should I do?",
          answer:
            "Try these steps: Clear browser cache and cookies, try a different browser (Chrome, Firefox, Safari), check your internet connection, disable browser extensions temporarily, try incognito/private mode, update your browser to the latest version. If issues persist, contact support with screenshots and browser/device details.",
        },
        {
          question: "I'm not receiving OTP or email notifications",
          answer:
            "Check spam/junk folder, ensure correct email/phone number in your account, add noreply@letitrip.in to your contacts, check if you have enough inbox storage, try requesting OTP again after 2 minutes. For persistent issues, update your contact details and contact support.",
        },
        {
          question: "The payment failed but money was deducted. What now?",
          answer:
            "Don't panic! Payment gateway failures sometimes show as deducted but the amount is only blocked, not debited. It will be automatically refunded in 5-7 business days. Check your order history - if order wasn't created, you'll definitely get refunded. Contact support with transaction ID for faster resolution.",
        },
        {
          question: "Product images are not loading",
          answer:
            "This is usually a temporary issue. Try refreshing the page, clearing browser cache, checking internet speed, or using a different device/network. If specific product images aren't loading, it might be under update. Report to support and we'll fix it immediately.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find answers to common questions about buying, selling, auctions,
              and more on Let It Rip - India's leading marketplace
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {faqCategories.map((category, catIndex) => (
              <div key={catIndex} className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                  <span className="text-4xl">{category.icon}</span>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  {category.faqs.map((faq, faqIndex) => (
                    <details
                      key={faqIndex}
                      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </h3>
                        <svg
                          className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </summary>
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}

            {/* Still Need Help */}
            <div className="mt-16 text-center bg-primary/5 dark:bg-primary/10 rounded-2xl p-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Still Need Help?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Can't find the answer you're looking for? Our support team is
                here to help.
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
