// One-off script to expand VD9 + VD10 content in messages/en.json
// Run: node scripts/update-content-vd9-vd10.mjs
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const filePath = resolve("messages/en.json");
const data = JSON.parse(readFileSync(filePath, "utf-8"));

// ─── VD9: becomeSeller ────────────────────────────────────────────────────────

data.becomeSeller = {
  metaTitle: "Open a Store on LetItRip",
  metaDescription:
    "Sell Pokémon cards, Hot Wheels, Beyblades, Gundam kits, and more on India's #1 collectibles marketplace. Apply to open your store today.",
  title: "Open Your Collectibles Store",
  subtitle:
    "Join thousands of collectors and sellers on India's largest collectibles marketplace. Read the guide below and apply to get started.",

  requirementsTitle: "Seller Requirements",
  requirementsIntro:
    "Before opening your store, make sure you meet these requirements:",
  requirement1: "Valid government-issued ID (Aadhaar, PAN card, or Passport)",
  requirement2:
    "Active Indian bank account or UPI handle for weekly payouts",
  requirement3:
    "Genuine collectibles inventory — no counterfeits, reproductions, or bootleg items",
  requirement4:
    "Reachable via WhatsApp or email within 48 hours for buyer queries",
  requirement5:
    "Minimum 1 high-quality product listing ready before going live",

  earningsTitle: "What You'll Earn",
  earningsExample:
    "On a ₹1,000 sale, here is how your payout is calculated:",
  earningsRow1: "Sale price",
  earningsRow1Value: "₹1,000.00",
  earningsRow2: "Platform commission (5%)",
  earningsRow2Value: "−₹50.00",
  earningsRow3: "GST on commission (18%)",
  earningsRow3Value: "−₹9.00",
  earningsRow4: "Payment gateway fee (2.36%)",
  earningsRow4Value: "−₹23.60",
  earningsTotal: "You receive",
  earningsTotalValue: "₹917.40",
  earningsNote:
    "No monthly subscription, no listing fees. You only pay when you sell.",

  tiersTitle: "Seller Tiers",
  tiersIntro:
    "As your monthly sales grow, you unlock higher tiers with greater benefits:",
  tierBasicLabel: "Basic Seller",
  tierBasicSales: "Up to ₹25,000 / month",
  tierBasicPerks: "Standard 5% commission · Standard support",
  tierVerifiedLabel: "Verified Seller",
  tierVerifiedSales: "₹25,001 – ₹1,00,000 / month",
  tierVerifiedPerks:
    "Verified badge on profile · Priority support · Featured in search",
  tierPowerLabel: "Power Seller",
  tierPowerSales: "Above ₹1,00,000 / month",
  tierPowerPerks:
    "Lowest commission · Dedicated account manager · Homepage promotion eligibility",
  tierBadgeNote:
    "Your tier is displayed on your public store profile and updated monthly.",

  applyTitle: "Ready to Apply?",
  applySubtitle:
    "Read and acknowledge all sections of the guide below to unlock your application.",
  applyButton: "Open My Store",

  guide: {
    title: "Store Guide",
    progress: "You have read {read} of {total} sections.",
    allReadMessage:
      "You've read all sections. You're ready to apply!",
    ackLabel: "I have read and understood this section.",
    readAllHint:
      "Please read and acknowledge all sections to enable the Apply button.",
    sections: {
      requirements: {
        title: "Who Can Sell on LetItRip",
        intro:
          "LetItRip is a curated marketplace for genuine collectibles. To qualify as a seller:",
        points: [
          "You must be 18 years or older with a valid Indian ID (Aadhaar, PAN, or Passport).",
          "You must have an active Indian bank account (NEFT/RTGS) or UPI handle for payouts.",
          "All items must be authentic — no knockoffs, counterfeits, or reproduction vintage items.",
          "Sellers dealing in graded cards must clearly indicate the grading company (PSA, BGS, CGC) and grade.",
          "You agree to ship within the handling time stated in your store settings.",
        ],
      },
      howItWorks: {
        title: "How LetItRip Works",
        intro:
          "LetItRip connects collectors and enthusiasts across India. Here is what the platform does for you:",
        points: [
          "Buyers discover your listings through search, homepage sections, and curated category pages.",
          "You manage your own listings, prices, and inventory from your Seller Dashboard.",
          "All payments are processed securely via Razorpay — funds are held in escrow until delivery.",
          "You get a dedicated store page with your logo, banner, policies, and reviews.",
          "Auction listings let serious collectors bid on rare items like 1st-Edition Pokémon cards or vintage Hot Wheels.",
        ],
      },
      whatYouCanSell: {
        title: "What You Can Sell",
        intro:
          "LetItRip is built for the Indian collectibles community. Popular categories include:",
        points: [
          "Trading Cards — Pokémon TCG (sealed ETBs, booster packs, singles, slabs), Yu-Gi-Oh!, Dragon Ball Super Card Game.",
          "Diecast Vehicles — Hot Wheels (mainline, premium, vintage Redlines), Tomica, Matchbox, majorette.",
          "Spinning Tops — Beyblade Burst, Beyblade X, Metal Fight — sealed or used.",
          "Model Kits — Bandai Gunpla (MG, PG, HG, RG), Dragon Ball, Evangelion model kits.",
          "Action Figures — McFarlane, Funko POP!, NECA, Good Smile Company figmas and nendos.",
          "Vintage & Rare — Pre-2000 Pokémon Base Set cards, vintage Star Wars figures, original Hot Wheels Redlines.",
          "Prohibited: counterfeit cards, replica/bootleg figures, any item misrepresented as official.",
        ],
      },
      fees: {
        title: "Fees & Commission",
        intro:
          "LetItRip keeps fees simple and transparent. There are no hidden charges:",
        points: [
          "5% platform commission on every completed sale (deducted automatically before payout).",
          "GST at 18% is charged on the commission amount as required by Indian tax law.",
          "No monthly subscription, no listing fee, no setup fee — you pay only when you sell.",
          "Razorpay payment gateway fee (2.36% + GST) is deducted on the transaction amount.",
          "On a ₹1,000 sale you receive ₹917.40. Use the earnings calculator above.",
          "Refunded or cancelled orders before dispatch are not charged commission.",
        ],
      },
      auctions: {
        title: "Auction Listings",
        intro:
          "LetItRip auctions are designed for rare and high-demand collectibles:",
        points: [
          "Set a starting bid (minimum ₹100) and an optional secret reserve price.",
          "Choose a duration between 1 and 14 days — shorter auctions create more urgency.",
          "Auto-extend: if a bid is placed in the final 5 minutes, the auction extends by 5 minutes to prevent sniping.",
          "The winning bidder is notified instantly and has 48 hours to complete payment.",
          "Shill bidding, bid retraction, and bid manipulation are strictly prohibited and result in account suspension.",
          "Ideal for: PSA/BGS graded Pokémon slabs, vintage Hot Wheels Redlines, sealed first-edition sets.",
        ],
      },
      earnings: {
        title: "Your Earnings & Payouts",
        intro:
          "Understanding your payout schedule and how earnings are calculated:",
        points: [
          "Earnings are held in escrow during the order delivery window (typically 5–10 days).",
          "Once the buyer confirms delivery (or the window expires), funds are released to your payout balance.",
          "Payouts are processed weekly every Monday to your registered bank account or UPI handle.",
          "Minimum payout threshold: ₹500. Balances below this carry over to the next week.",
          "NEFT transfers arrive within 1–2 business days; UPI payouts are typically same-day.",
          "Your full payout history and pending balance are visible in Seller Dashboard → Payouts.",
        ],
      },
      responsibilities: {
        title: "Seller Responsibilities",
        intro:
          "As a seller on LetItRip, you agree to the following obligations:",
        points: [
          "Ship orders within your stated handling time (default 2 business days) and provide valid tracking.",
          "Respond to buyer messages and queries within 48 hours.",
          "Accurately describe condition (Mint, Near Mint, Played, etc.) and authenticity of every item.",
          "Accept returns for items that arrive damaged, significantly not as described, or are confirmed counterfeit.",
          "Keep listings up-to-date — mark items as sold or archived if no longer available.",
          "Comply with all Indian laws including GST obligations if your annual turnover exceeds ₹20 lakh.",
        ],
      },
      tiers: {
        title: "Seller Tiers & Growth",
        intro:
          "LetItRip rewards high-performing sellers with tiered benefits:",
        points: [
          "Basic Seller (up to ₹25,000/month): Standard commission, full platform access.",
          "Verified Seller (₹25,001–₹1,00,000/month): Verified badge, priority support, improved search ranking.",
          "Power Seller (above ₹1,00,000/month): Reduced commission, dedicated account manager, homepage promotion eligibility.",
          "Tiers are evaluated monthly based on completed sales in the previous 30 days.",
          "Tier badges are shown on your public store profile and on your product cards.",
        ],
      },
    },
  },

  states: {
    success: {
      badge: "Application Submitted",
      title: "You're on your way!",
      message:
        "Your seller application has been submitted and is now under review. Our team typically responds within 24–48 hours.",
      note:
        "Your account role will be updated once approved. You may need to sign out and sign back in to access the Seller Portal.",
    },
  },
};

// ─── VD9: sellerGuide rewrite ─────────────────────────────────────────────────

data.sellerGuide = {
  metaTitle: "Seller Guide — LetItRip Collectibles Marketplace",
  metaDescription:
    "Everything you need to know to succeed as a collectibles seller on LetItRip — from listing Pokémon cards and Gunpla kits to running live auctions and getting paid.",
  title: "Seller Guide",
  subtitle:
    "Your step-by-step guide to opening a store, listing collectibles, running auctions, and growing your business on LetItRip.",

  gettingStartedTitle: "Getting Started",
  gettingStartedText:
    "Create your LetItRip account, submit a store application, and complete your store profile with a logo, banner, and description. Verification typically takes 24 hours. Once approved, you can list products immediately. We recommend setting up shipping zones and payout details before your first listing so buyers can check out without friction.",

  listingTitle: "Creating Listings That Sell",
  listingText:
    "Great listings win trust and rank higher in search. For Pokémon TCG: state the set name, card number (e.g. 108/102), condition (PSA 9, NM, LP), and whether the card is raw or graded. For Hot Wheels: include the casting name, year, colour, and any tampo details — vintage Redlines especially benefit from close-up wheel photos. For Gunpla kits: note the grade (HG/MG/PG/RG), whether the kit is built or unbuilt, and include photos of sprues for unbuilt kits. Upload at least 4 photos per listing — front, back, close-up of any defects, and scale comparison where relevant.",

  pricingTitle: "Pricing Your Collectibles",
  pricingText:
    "Check recent sold listings on LetItRip and comparable platforms to anchor your prices. For raw Pokémon singles, reference TCGPlayer market price and adjust for Indian import premium (typically +15–25%). For PSA/BGS graded cards, the pop report size strongly influences value — lower pops command higher prices. Hot Wheels mainline cards sell at ₹100–₹200; premium and super treasures trade at ₹500–₹2,000. Beyblades: sealed boosters fetch 2–3× the standard retail price in the secondary market. Always price in INR; LetItRip handles GST compliance at checkout.",

  auctionsTitle: "Running Auctions",
  auctionsText:
    "Auctions are ideal for rare or highly sought-after pieces — PSA 10 Charizard 1st Edition, vintage Hot Wheels Redlines, sealed first-edition Pokémon Base Set packs. Set a starting bid low enough to generate early interest; the reserve protects you if bidding falls short. Enable auto-extend (on by default) so last-minute sniping does not shortchange you. Promote your auction via our homepage auction section and notify your followers. After the auction closes, the winning bidder has 48 hours to pay — if they do not, you can relist or offer a Second Chance to the next highest bidder.",

  ordersTitle: "Managing Orders",
  ordersText:
    "When a buyer places an order, you receive an email and an in-platform notification. Ship within your stated handling time — default is 2 business days. For high-value items (above ₹2,000), use Speed Post or a courier with door-to-door tracking (Delhivery, BlueDart, Ecom Express). Always pack graded slabs in a rigid box with foam or bubble wrap — PSA cases crack easily in transit. Enter the tracking number in Seller Dashboard → Orders so the buyer can follow delivery. Mark the order as shipped once the tracking is live.",

  paymentsTitle: "Payments & Payouts",
  paymentsText:
    "All buyer payments are collected securely via Razorpay (UPI, Net Banking, Credit/Debit card, COD). Funds are held in escrow until delivery is confirmed or the 10-day window expires. Your payout balance updates automatically. Payouts are processed every Monday to your registered bank account (NEFT) or UPI handle. Minimum payout threshold is ₹500 — balances below this carry over. NEFT arrives within 1–2 business days; UPI is typically same-day. Your earnings breakdown, deductions, and payout history are all visible in Seller Dashboard → Payouts.",

  policiesTitle: "Seller Policies & Code of Conduct",
  policiesText:
    "LetItRip enforces a strict authenticity policy. Never list counterfeit Pokémon cards (WOTC-era fakes are common — learn to identify them), bootleg Gunpla, or reproduction Hot Wheels marketed as originals. Misrepresentation results in immediate listing removal, and repeat violations lead to account suspension. Respond to buyer questions within 48 hours. Honor your stated return window — LetItRip buyers expect the same standards as any reputable collector-to-collector trade. Sellers with a seller rating below 4.0 may be placed on a performance improvement plan.",

  supportTitle: "Seller Support",
  supportText:
    "Our seller support team is available via the Help Center (Monday–Saturday, 10am–6pm IST). For urgent issues — a buyer dispute, a missing shipment, or a counterfeit complaint — use the Priority Support option in your Seller Dashboard. A dedicated account manager is assigned once you reach the Verified Seller tier. Community advice is also available in our LetItRip Collectors Discord and seller WhatsApp group (invitation sent on approval).",

  onboardDiagramTitle: "Becoming a seller — 3 simple steps",
  onboardS1: "Apply",
  onboardS1Desc: "Sign up and fill your seller profile",
  onboardS2: "Get Verified",
  onboardS2Desc: "Review usually takes ~24 hours",
  onboardS3: "Start Selling!",
  onboardS3Desc: "List your collectibles and run auctions",

  payoutDiagramTitle: "Your payout journey",
  payoutNote:
    "Platform commission and gateway fees are deducted automatically before funds are released.",
  payoutS1: "Sale Made",
  payoutS1Desc: "Buyer pays via Razorpay",
  payoutS2: "Delivered",
  payoutS2Desc: "Delivery confirmed by buyer",
  payoutS3: "Funds Released",
  payoutS3Desc: "Escrow window clears",
  payoutS4: "Request Payout",
  payoutS4Desc: "Dashboard → Payouts → Withdraw",
  payoutS5: "You Get Paid!",
  payoutS5Desc: "NEFT/UPI to your account",

  startSelling: "Start Selling",
  helpCenter: "Help Center",
  contactUs: "Contact Us",
};

// ─── VD10: terms ──────────────────────────────────────────────────────────────

data.terms = {
  metaTitle: "Terms & Conditions — LetItRip",
  metaDescription:
    "Terms and conditions governing the use of the LetItRip collectibles marketplace platform, compliant with the IT Act 2000 and Consumer Protection Act 2019.",
  title: "Terms & Conditions",
  subtitle: "Please read these terms carefully before using LetItRip",
  lastUpdated: "Last updated: 1 May 2026",
  contactTitle: "Questions?",
  contactText:
    "For questions about these terms, contact our legal team at legal@letitrip.in.",
  privacyPolicy: "Privacy Policy",
  contactUs: "Contact Us",
  relatedTitle: "Related Policies",
  relatedPrivacy: "Privacy Policy",
  relatedTerms: "Terms of Service",
  relatedCookies: "Cookie Policy",
  relatedRefund: "Refund Policy",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      body: "By accessing or using the LetItRip platform (the 'Platform') at letitrip.in, you agree to be bound by these Terms & Conditions, our Privacy Policy, and our Refund Policy. If you do not agree to any of these terms, you must immediately discontinue your use of the Platform. These terms constitute a legally binding agreement under the Information Technology Act, 2000 (as amended in 2008).",
    },
    {
      heading: "2. Definitions",
      body: "'Platform' means the LetItRip website and mobile application operated by LetItRip Internet Pvt. Ltd. 'User' means any person who accesses or uses the Platform. 'Seller' means a User who has been approved to list and sell products. 'Buyer' means a User who purchases or bids on products. 'Collectible' means any physical trading card, diecast vehicle, spinning top, model kit, action figure, or similar item listed on the Platform. 'INR' means Indian Rupees.",
    },
    {
      heading: "3. Eligibility and Account Registration",
      body: "You must be at least 18 years of age to create an account or make a purchase on the Platform. By registering, you represent that you are legally competent to enter into a binding contract under the Indian Contract Act, 1872. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately at support@letitrip.in of any unauthorised use of your account.",
    },
    {
      heading: "4. Use of the Platform",
      body: "You may use LetItRip solely for lawful purposes and in accordance with these Terms. You agree not to: post false, misleading, or fraudulent listings; harass, threaten, or defame other Users; attempt to circumvent our payment or authentication systems; use automated scraping tools without written permission; or upload malware or any code that may damage the Platform or other Users' devices. Violations may result in immediate account suspension without refund of any fees paid.",
    },
    {
      heading: "5. Seller Obligations and Listing Standards",
      body: "Sellers must accurately describe each item's condition (Mint, Near Mint, Lightly Played, etc.), authenticity, and provenance. Graded items (PSA, BGS, CGC) must clearly display the exact grade and slab population data where available. Sellers must ship within the handling time stated in their store profile and provide valid courier tracking. Sellers are solely responsible for any tax obligations arising from their sales, including GST where applicable. LetItRip is not responsible for disputes arising from inaccurate seller descriptions.",
    },
    {
      heading: "6. Buyer Obligations",
      body: "Buyers must complete payment within 48 hours of a winning auction bid or an accepted offer. Buyers must inspect items promptly upon delivery and raise any disputes within 48 hours using the Platform's dispute resolution tool. Buyers may not engage in bid sniping, shill bidding, or colluding with sellers to manipulate auction outcomes. Buyers who habitually retract bids or fail to complete payment may have their bidding privileges revoked.",
    },
    {
      heading: "7. Prohibited Items",
      body: "The following items are strictly prohibited on LetItRip: (a) counterfeit or replica trading cards (including unauthorised reprints of Pokémon WOTC-era cards or Yu-Gi-Oh! cards); (b) reproduction vintage diecast vehicles marketed as originals (e.g. replica Hot Wheels Redlines); (c) bootleg or unlicensed anime figures; (d) items that infringe third-party intellectual property rights including Pokémon, Bandai, Hasbro, or Mattel trademarks; (e) weapons, controlled substances, or items prohibited under Indian law. LetItRip reserves the right to remove any listing and permanently ban the seller's account without notice.",
    },
    {
      heading: "8. Auction Rules and Binding Bids",
      body: "All bids placed on auction listings are legally binding. By placing a bid, you commit to purchasing the item at that price if you win. The highest bid at the close of the auction constitutes a binding purchase agreement. Auto-extend is active by default — if a bid is placed in the final 5 minutes, the auction extends by 5 minutes. Shill bidding (a seller or associate bidding on their own listing to inflate the price) is a violation of these Terms and constitutes unfair trade practice under the Consumer Protection Act, 2019. Confirmed shill bidding results in permanent account suspension.",
    },
    {
      heading: "9. Payments, Fees, and Payouts",
      body: "All transactions are processed in Indian Rupees (INR) via Razorpay. LetItRip charges sellers a platform commission of 5% (plus 18% GST on the commission) on each completed sale. Payment gateway fees (2.36% per transaction) are also deducted. Buyer payments are held in escrow until delivery confirmation. Seller payouts are processed weekly to the registered bank account or UPI handle. LetItRip does not accept or hold cryptocurrency. All prices displayed on the Platform are inclusive of applicable taxes unless stated otherwise.",
    },
    {
      heading: "10. Intellectual Property",
      body: "All content on the Platform — including the LetItRip logo, UI design, copy, and software — is the property of LetItRip Internet Pvt. Ltd. and is protected under the Copyright Act, 1957. Product images and descriptions uploaded by Sellers remain the property of the respective rights holders. By uploading content, you grant LetItRip a non-exclusive, royalty-free licence to display and use that content for the purpose of operating the Platform. You must not use any third-party trademarks (Pokémon, Hot Wheels, Gundam, etc.) in a way that implies endorsement by those brand owners.",
    },
    {
      heading: "11. Dispute Resolution",
      body: "Buyers and sellers are encouraged to resolve disputes through the Platform's in-built dispute resolution tool before escalating. If no resolution is reached within 7 days, LetItRip's dispute team will review the case and issue a binding decision. LetItRip's decision regarding platform disputes is final. For disputes outside the Platform's scope, both parties agree to attempt resolution through the National Consumer Disputes Redressal Commission (NCDRC) or a state consumer forum under the Consumer Protection Act, 2019 before resorting to litigation. These Terms are governed by the laws of India.",
    },
    {
      heading: "12. Limitation of Liability",
      body: "LetItRip is an intermediary under the IT Act, 2000 and is not the seller or buyer of any listed item. LetItRip is not liable for: the accuracy of seller listings; the authenticity of any item; disputes between buyers and sellers; delays or failures in third-party shipping; or any indirect, incidental, special, or consequential damages arising from your use of the Platform. LetItRip's maximum aggregate liability for any claim shall not exceed the amount paid by you to LetItRip in the 3 months preceding the claim.",
    },
    {
      heading: "13. Account Termination and Suspension",
      body: "LetItRip may suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or conduct detrimental to other Users. Sellers whose accounts are terminated forfeit any unpaid payout balance pending for orders that were disputed or cancelled due to the violation. You may close your account at any time by contacting support@letitrip.in; closure does not entitle you to a refund of any commission or fees already charged.",
    },
    {
      heading: "14. Governing Law and Jurisdiction",
      body: "These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra. If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.",
    },
    {
      heading: "15. Amendments to Terms",
      body: "LetItRip reserves the right to modify these Terms at any time. We will notify Users of material changes by email and via an in-platform notice at least 7 days before the change takes effect. Continued use of the Platform after the effective date of the revised Terms constitutes your acceptance of those changes. We recommend reviewing this page periodically.",
    },
  ],
};

// ─── VD10: privacy ────────────────────────────────────────────────────────────

data.privacy = {
  metaTitle: "Privacy Policy — LetItRip",
  metaDescription:
    "How LetItRip collects, uses, and protects your personal data, in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).",
  title: "Privacy Policy",
  subtitle: "Your privacy matters to us",
  lastUpdated: "Last updated: 1 May 2026",
  introTitle: "Introduction",
  introText:
    "LetItRip Internet Pvt. Ltd. ('LetItRip', 'we', 'our', 'us') is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and safeguard your data when you use our platform at letitrip.in, in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.",
  intro:
    "LetItRip Internet Pvt. Ltd. ('we', 'our', 'us') is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.",
  termsOfService: "Terms of Service",
  contactUs: "Contact Us",
  relatedTitle: "Related Policies",
  relatedPrivacy: "Privacy Policy",
  relatedTerms: "Terms of Service",
  relatedCookies: "Cookie Policy",
  relatedRefund: "Refund Policy",
  sections: [
    {
      heading: "1. Information We Collect",
      body: "We collect: (a) Account data — name, email address, mobile number, and date of birth when you register. (b) Identity verification data — government ID details (Aadhaar number last 4 digits, PAN) for seller KYC. (c) Payment data — bank account details and UPI handles for seller payouts; card/UPI details are processed by Razorpay and not stored by LetItRip. (d) Transaction data — orders placed, bids, wishlists, and offer history. (e) Device and usage data — IP address, browser type, operating system, pages visited, and clickstream data collected automatically via cookies and server logs.",
    },
    {
      heading: "2. How We Use Your Information",
      body: "We use your personal data to: process orders and facilitate auctions; verify seller identity and prevent fraud; send transactional emails (order confirmation, shipping updates, payout receipts); personalise your browsing experience (recommended listings, recent searches); comply with Indian tax laws (GST filings) and respond to law enforcement requests; and improve platform performance and detect abuse. We do not sell your personal data to third-party advertisers.",
    },
    {
      heading: "3. Sharing Your Information",
      body: "We share your data only as necessary: (a) Sellers receive your shipping name, delivery address, and phone number for order fulfilment — they are contractually prohibited from using this data for any other purpose. (b) Razorpay receives payment data to process transactions. (c) Courier partners (Delhivery, BlueDart, Speed Post) receive your delivery address and phone number to complete deliveries. (d) We may disclose data to government or regulatory authorities when required by law, court order, or to protect LetItRip's legal rights.",
    },
    {
      heading: "4. Data Security",
      body: "We implement industry-standard security measures including TLS 1.3 encryption in transit, AES-256 encryption at rest for sensitive fields, Firebase Authentication with multi-factor support, HMAC blind indices for PII search fields, and role-based access controls restricting staff access to personal data. We conduct periodic security audits. While we strive to protect your data, no Internet transmission is 100% secure, and we cannot guarantee absolute security.",
    },
    {
      heading: "5. Your Rights Under the DPDP Act 2023",
      body: "Under the Digital Personal Data Protection Act, 2023, you have the right to: (a) Access — request a summary of personal data we hold about you. (b) Correction — request correction of inaccurate or incomplete data. (c) Erasure — request deletion of your personal data ('Right to be Forgotten'), subject to legal retention obligations. (d) Grievance Redressal — raise a complaint via our Data Protection Officer at privacy@letitrip.in, who will respond within 48 hours. (e) Nominate — nominate another individual to exercise these rights on your behalf in the event of your death or incapacity. To exercise any right, email privacy@letitrip.in from your registered email address.",
    },
    {
      heading: "6. Data Retention",
      body: "We retain your personal data for as long as your account is active. After account closure: transactional records (orders, payouts) are retained for 7 years to comply with Indian accounting and GST audit requirements. Identity verification data (KYC) is retained for 5 years post-relationship as required by anti-money-laundering guidelines. Device and usage logs are deleted after 90 days. If you request erasure, we will delete or anonymise your data within 30 days, except where retention is mandated by law.",
    },
    {
      heading: "7. Cookies",
      body: "We use cookies to maintain your session, remember preferences, and analyse platform usage. See our Cookie Policy for a full breakdown of cookie categories and opt-out instructions.",
    },
    {
      heading: "8. Children's Privacy",
      body: "LetItRip is not intended for users under 18 years of age. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact privacy@letitrip.in and we will delete it promptly. Parents or guardians who discover that a child has registered without consent should contact us immediately.",
    },
    {
      heading: "9. Cross-Border Data Transfers",
      body: "LetItRip primarily stores data on Google Cloud servers located in Mumbai (asia-south1 region). Some third-party services (Firebase, Razorpay analytics, Google Analytics) may process data outside India. We ensure any cross-border transfer is covered by adequate contractual safeguards consistent with the DPDP Act 2023 and applicable rules notified by the Indian government.",
    },
    {
      heading: "10. Changes to This Policy",
      body: "We may update this Privacy Policy periodically. We will notify you of significant changes by email and via an in-platform notice at least 7 days before the change takes effect. The 'Last updated' date at the top of this page will reflect the most recent revision. Continued use of the Platform after the effective date constitutes your acceptance of the updated Policy.",
    },
    {
      heading: "Contact — Data Protection Officer",
      body: "For privacy-related queries, requests, or complaints, contact our Data Protection Officer at privacy@letitrip.in. We aim to respond within 48 hours. If you are not satisfied with our response, you may file a complaint with the Data Protection Board of India (once constituted under the DPDP Act 2023).",
    },
  ],
};

// ─── VD10: cookies ────────────────────────────────────────────────────────────

data.cookies = {
  metaTitle: "Cookie Policy — LetItRip",
  metaDescription:
    "How LetItRip uses cookies and similar tracking technologies, including a full list of cookies by category.",
  title: "Cookie Policy",
  lastUpdated: "Last updated: 1 May 2026",
  subtitle:
    "This Cookie Policy explains how LetItRip uses cookies and similar tracking technologies when you visit our platform.",
  intro:
    "This Cookie Policy explains how LetItRip uses cookies and similar tracking technologies when you visit our platform.",
  privacyPolicy: "Privacy Policy",
  contactUs: "Contact Us",
  relatedTitle: "Related Policies",
  relatedPrivacy: "Privacy Policy",
  relatedTerms: "Terms of Service",
  relatedCookies: "Cookie Policy",
  relatedRefund: "Refund Policy",
  whatTitle: "What Are Cookies?",
  whatText:
    "Cookies are small text files placed on your device when you visit a website. They allow the website to remember information about your visit — such as your login session and cart items — so you do not have to re-enter it on every page. We also use similar technologies like localStorage and sessionStorage for client-side state that does not leave your device.",
  typesTitle: "Types of Cookies We Use",
  typesText:
    "We categorise our cookies into three types: Essential (required for core functionality and cannot be disabled), Analytics (help us understand how visitors use the Platform so we can improve it), and Marketing (used to deliver relevant promotions, currently limited). You can control non-essential cookies from your browser settings.",
  essentialTitle: "Essential Cookies",
  essentialText:
    "These cookies are strictly necessary for the Platform to function and cannot be opted out of. Disabling them may break sign-in, checkout, and cart functionality.",
  analyticsTitle: "Analytics Cookies",
  analyticsText:
    "We use Google Analytics 4 to understand aggregate usage patterns — which pages are most visited, where users drop off, and how search results are used. This data is anonymised and never linked to your personal identity.",
  marketingTitle: "Marketing Cookies",
  marketingText:
    "Marketing cookies help us measure the effectiveness of promotions and show relevant offers. We currently use minimal marketing cookies; future integrations (Google Ads, Meta Pixel) will be listed here before activation.",
  controlTitle: "Managing Your Cookie Preferences",
  controlText:
    "You can refuse or delete non-essential cookies at any time through your browser settings. On Chrome: Settings → Privacy and Security → Cookies. On Safari: Settings → Safari → Privacy. Disabling essential cookies will affect your ability to sign in and complete purchases. You can also clear all LetItRip-related cookies by signing out and clearing site data.",
  thirdPartyTitle: "Third-Party Cookies",
  thirdPartyText:
    "Razorpay (our payment processor) sets cookies during checkout to detect fraud and maintain payment session state. These cookies are governed by Razorpay's Privacy Policy and are only active during the checkout flow.",
  changesTitle: "Changes to This Policy",
  changesText:
    "We may update this Cookie Policy as we add new features or third-party integrations. Any changes will be posted on this page with an updated revision date, and we will notify you via an in-platform banner if material new cookies are introduced.",
  contactTitle: "Contact Us",
  contactText:
    "If you have questions about our use of cookies, please contact us at privacy@letitrip.in.",
  sections: [
    {
      heading: "Essential Cookies",
      body: "• __session (Firebase Auth) — Maintains your signed-in session. Expires on sign-out or after 1 hour of inactivity.\n• lir_cart — Stores your cart items for guest checkouts using browser localStorage. Never sent to our servers.\n• lir_csrf — Cross-site request forgery protection token. Refreshed on each page load.\n• lir_locale — Stores your selected language preference (currently 'en'). Expires after 1 year.",
    },
    {
      heading: "Analytics Cookies",
      body: "• _ga (Google Analytics 4) — Distinguishes unique visitors. Expires after 2 years.\n• _ga_XXXXXX (GA4 session counter) — Tracks session count and engagement. Expires after 2 years.\n• _gid — Identifies a user session within 24 hours. Expires after 24 hours.\nAll analytics data is processed in aggregate. IP addresses are anonymised before storage.",
    },
    {
      heading: "Payment Processor Cookies (Razorpay)",
      body: "• rzp_checkout_anon_id — Anonymised session ID for fraud detection during checkout. Set only when the Razorpay checkout modal is opened. Expires after 30 days.\n• rzp_device_id — Device fingerprint for payment security. Expires after 6 months.\nThese cookies are set by Razorpay and are governed by Razorpay's Privacy Policy.",
    },
    {
      heading: "Managing Your Preferences",
      body: "To opt out of Google Analytics tracking, install the Google Analytics Opt-out Browser Add-on (tools.google.com/dlpage/gaoptout). To block all third-party cookies, use your browser's privacy settings or a tool like uBlock Origin. Note that blocking essential cookies will prevent sign-in and checkout from working correctly.",
    },
  ],
};

// ─── VD10: refundPolicy ───────────────────────────────────────────────────────

data.refundPolicy = {
  metaTitle: "Refund Policy — LetItRip",
  metaDescription:
    "LetItRip's refund, return, and exchange policy for collectibles purchases — including sealed products, graded cards, auctions, and pre-orders.",
  title: "Refund Policy",
  lastUpdated: "Last updated: 1 May 2026",
  subtitle:
    "We want every LetItRip purchase to meet your expectations. This policy covers all scenarios specific to the Indian collectibles market.",
  intro:
    "We want every LetItRip purchase to meet your expectations. This policy covers all scenarios specific to the Indian collectibles market.",
  eligibilityTitle: "Refund Eligibility",
  eligibilityText:
    "Refund eligibility depends on the product type. Please read each section carefully. To initiate a return or refund, log in → My Orders → select the order → 'Request Refund', and provide photos where relevant.",
  processTitle: "How to Initiate a Refund",
  processText:
    "Log in to your account, go to My Orders, select the relevant order, and tap 'Request Refund'. Select the reason, upload supporting photos (required for damage or authenticity disputes), and submit. Our team will respond within 2 business days.",
  timelineTitle: "Refund Timeline",
  timelineText:
    "Approved refunds are processed within 5–7 business days via Razorpay reversal to your original payment method. Bank NEFT refunds may take an additional 2–3 business days. UPI refunds are typically faster (1–2 business days). You will receive an email confirmation when the refund is initiated.",
  auctionsTitle: "Auction Purchases",
  auctionsText:
    "Auction wins are binding and final. Refunds are only available if: (a) the seller fails to ship within 7 days and does not respond to queries; or (b) the item received differs significantly from the auction description (e.g. a card listed as PSA 9 arrives as PSA 7). Contact support within 48 hours of delivery with photographic evidence.",
  exchangesTitle: "Exchanges",
  exchangesText:
    "We do not offer direct exchanges. To get a different item, request a refund and place a new order. Sellers may offer exchanges at their discretion through buyer-seller messaging.",
  shippingTitle: "Return Shipping",
  shippingText:
    "Buyers are responsible for return shipping costs unless the item arrived damaged, significantly not as described, or was confirmed counterfeit. Use a trackable courier (Speed Post, Delhivery, BlueDart) for all returns. LetItRip is not responsible for return shipments lost in transit without tracking proof.",
  nonRefundableTitle: "Non-Refundable Items",
  nonRefundableText:
    "The following are not eligible for refund: items clearly marked 'Final Sale' or 'As-Is'; items where the buyer acknowledged minor imperfections at the time of purchase; gift cards; and digital codes.",
  diagramTitle: "How to request a refund",
  diagramS1: "My Orders",
  diagramS1Desc: "Find the order",
  diagramS2: "Request Refund",
  diagramS2Desc: "Pick reason + upload photos",
  diagramS3: "Under Review",
  diagramS3Desc: "Team checks within 2 days",
  diagramS4: "Decision",
  diagramS4Desc: "Approved or declined by email",
  diagramS5: "Money Returned",
  diagramS5Desc: "5–7 business days via Razorpay",
  contactTitle: "Need Help?",
  contactText:
    "If you have questions about this policy or need assistance with a return, contact us via the Help Center or email support@letitrip.in.",
  helpCenter: "Help Center",
  contactUs: "Contact Us",
  relatedTitle: "Related Policies",
  relatedPrivacy: "Privacy Policy",
  relatedTerms: "Terms of Service",
  relatedCookies: "Cookie Policy",
  relatedRefund: "Refund Policy",
  sections: [
    {
      heading: "1. Sealed Products (Unopened)",
      body: "Sealed Pokémon ETBs, booster boxes, Beyblade launchers, Gunpla kits, or any factory-sealed collectible may be returned within 7 days of delivery for a full refund, provided the item is returned in its original sealed condition. Any evidence of tampering (resealing, broken factory seal) disqualifies the return. Return shipping is the buyer's responsibility.",
    },
    {
      heading: "2. Opened or Raw (Ungraded) Items",
      body: "Once opened, raw singles, figures, or diecast vehicles are generally not eligible for return unless the item is materially different from the listing description. 'Materially different' means a card listed as Near Mint (NM) arrives with a significant crease or water damage not disclosed in the listing photos. Minor condition variations within the same grade band are not grounds for a refund. Submit photographic evidence within 48 hours of delivery.",
    },
    {
      heading: "3. PSA / BGS / CGC Graded Cards",
      body: "Graded slabs are shipped in rigid mailers. If the slab arrives cracked or with internal card movement not visible in the seller's listing photos, raise a dispute within 48 hours with clear photographs. If a card's actual PSA grade is lower than the grade stated in the listing (e.g. listed as PSA 9 but slab clearly shows PSA 7), the seller must offer a full refund including return shipping. LetItRip will adjudicate if seller and buyer cannot agree.",
    },
    {
      heading: "4. Auction Wins",
      body: "All auction bids are binding. Auction wins are non-refundable except in two scenarios: (a) The seller does not ship within 7 days and cannot be reached — LetItRip will issue a full refund and suspend the seller. (b) The item received differs significantly from the auction listing (wrong card, wrong grade, undisclosed damage) — raise a dispute within 48 hours with photos. We strongly recommend buyers screenshot auction photos before bidding.",
    },
    {
      heading: "5. Pre-Order Cancellations",
      body: "Pre-orders can be cancelled for a full refund at any time before the seller marks the order as 'Dispatched'. Once dispatched, pre-orders follow the standard refund policy. If a seller is unable to fulfil a pre-order (e.g. delayed restock, import ban), buyers will receive a full refund automatically. Sellers who cancel pre-orders after accepting payment without valid reason may face penalties.",
    },
    {
      heading: "6. Disputed Authenticity",
      body: "If you believe a card or collectible is counterfeit (a Pokémon card that fails the light or rip test, a Hot Wheels Redline with incorrect paint or casting), raise an authenticity dispute within 7 days of delivery. Submit clear macro photographs and, where possible, a side-by-side comparison with a known authentic item. LetItRip reserves the right to request the item be sent to a third-party authenticator. Confirmed counterfeits result in a full refund and the seller's account is permanently suspended.",
    },
    {
      heading: "7. Damaged in Transit",
      body: "If your item arrives damaged due to carrier mishandling (crushed box, water damage), photograph the damage and the outer packaging within 48 hours of delivery. Raise a transit damage dispute via My Orders. LetItRip will investigate with the seller and courier. Where the damage is clearly the carrier's fault and the seller packed appropriately, LetItRip's courier claims process applies and a refund may be issued pending carrier investigation. Do not discard damaged packaging — it is required for courier claims.",
    },
    {
      heading: "8. Return Shipping & Timelines",
      body: "Buyer-initiated returns: buyer pays return shipping (except confirmed counterfeit or seller error). Use a trackable service — LetItRip is not liable for returns lost in transit without a tracking number. Once the seller confirms receipt of the return in original condition, the refund is initiated within 48 hours. Approved refunds credit to your original payment method within 5–7 business days via Razorpay. UPI refunds typically arrive within 1–2 business days; NEFT may take 3–5 business days.",
    },
  ],
};

// ─── Write back ───────────────────────────────────────────────────────────────

writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
console.log("✅ messages/en.json updated — VD9 + VD10 content applied.");
