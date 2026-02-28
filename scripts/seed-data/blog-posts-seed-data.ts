/**
 * Blog Posts Seed Data
 * Sample blog posts across all categories for development and testing
 */

import type { BlogPostDocument } from "@/db/schema";
import { BLOG_POST_FIELDS } from "@/db/schema";

export const blogPostsSeedData: Partial<BlogPostDocument>[] = [
  // ── Featured / Published ──────────────────────────────────────────────
  {
    id: "blog-top-trekking-destinations-india-2026-guides",
    title: "Top 10 Trekking Destinations in India for 2026",
    slug: "top-10-trekking-destinations-india-2026",
    excerpt:
      "From the snow-capped trails of Himachal to the lush ghats of Kerala — discover the finest trekking routes India has to offer this year.",
    content: `<h2>1. Roopkund Trek, Uttarakhand</h2><p>Known as the 'Mystery Lake Trail', Roopkund sits at 5,029 m and rewards trekkers with panoramic Himalayan views and an eerie glacial lake containing ancient skeletal remains. Best season: May–June and September–October.</p><h2>2. Hampta Pass, Himachal Pradesh</h2><p>A dramatic crossover between the lush Kullu Valley and the stark Spiti landscape, Hampta Pass (4,270 m) is perfect for first-time high-altitude trekkers.</p><h2>3. Bali Pass, Uttarakhand</h2><p>One of the more demanding trails, Bali Pass connects the Yamunotri region to Har Ki Dun and offers unmatched views of the Swargarohini massif.</p><p>… and seven more incredible trails await inside.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=630&fit=crop",
    category: BLOG_POST_FIELDS.CATEGORY_VALUES.GUIDES,
    tags: [
      "trekking",
      "india",
      "hiking",
      "adventure",
      "uttarakhand",
      "himachal",
    ],
    isFeatured: true,
    status: BLOG_POST_FIELDS.STATUS_VALUES.PUBLISHED,
    publishedAt: new Date("2026-01-10T08:00:00Z"),
    authorId: "user-admin-user-admin",
    authorName: "Admin User",
    readTimeMinutes: 8,
    views: 4723,
    metaTitle: "10 Best Trekking Destinations in India 2026 | LetItRip",
    metaDescription:
      "Explore the top trekking trails across India in 2026 — from Roopkund to Bali Pass. Curated routes for every skill level.",
    createdAt: new Date("2026-01-08T10:00:00Z"),
    updatedAt: new Date("2026-01-10T08:00:00Z"),
  },

  {
    id: "blog-how-to-choose-trekking-gear-beginners-tips",
    title: "How to Choose Trekking Gear: A Beginner's Complete Guide",
    slug: "how-to-choose-trekking-gear-beginners-guide",
    excerpt:
      "Overwhelmed by the sheer volume of gear options? This comprehensive checklist helps beginners pick the right boots, backpacks, and layers without breaking the bank.",
    content: `<h2>Why Gear Matters</h2><p>Poor gear choices are the number-one reason beginners abandon a trek mid-way. The right equipment keeps you safe, comfortable, and prepared for sudden weather changes.</p><h2>The Essential Checklist</h2><ul><li><strong>Boots:</strong> Waterproof ankle-support boots are non-negotiable for anything above 2,000 m.</li><li><strong>Backpack:</strong> A 40–50 L pack with a hip-belt distributes weight across your hips, not your shoulders.</li><li><strong>Base Layers:</strong> Merino wool or synthetic moisture-wicking fabrics — never cotton.</li><li><strong>Shell Jacket:</strong> A windproof, waterproof shell that packs down small.</li></ul><h2>Budget vs. Premium</h2><p>You don't need to blow ₹50,000 on your first kit. We break down which items are worth splurging on and where you can safely save.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&h=630&fit=crop",
    category: BLOG_POST_FIELDS.CATEGORY_VALUES.TIPS,
    tags: [
      "gear",
      "beginners",
      "trekking",
      "backpack",
      "boots",
      "buying-guide",
    ],
    isFeatured: true,
    status: BLOG_POST_FIELDS.STATUS_VALUES.PUBLISHED,
    publishedAt: new Date("2026-01-18T09:00:00Z"),
    authorId: "user-admin-user-admin",
    authorName: "Admin User",
    readTimeMinutes: 10,
    views: 6891,
    metaTitle: "Trekking Gear Guide for Beginners 2026 | LetItRip",
    metaDescription:
      "Complete beginner's guide to choosing trekking gear: boots, backpacks, layers, and more. Budget-smart recommendations included.",
    createdAt: new Date("2026-01-16T11:00:00Z"),
    updatedAt: new Date("2026-01-18T09:00:00Z"),
  },

  {
    id: "blog-letitrip-launches-auction-feature-news",
    title: "LetItRip Launches Live Auction Feature for Outdoor Gear",
    slug: "letitrip-launches-live-auction-feature-outdoor-gear",
    excerpt:
      "Today we're thrilled to announce our new live auction platform — the best way to score premium outdoor gear at prices set by the community.",
    content: `<h2>Introducing Live Auctions</h2><p>LetItRip's auction feature lets verified sellers list quality outdoor equipment — from vintage cameras to premium tents — and buyers bid in real time. Every listing is verified by our team before it goes live.</p><h2>How It Works</h2><ol><li>Browse open auctions on the <a href="/auctions">Auctions page</a>.</li><li>Place a bid — you'll be instantly notified if outbid.</li><li>Win the auction and check out securely within 24 hours.</li></ol><h2>Seller Benefits</h2><p>Sellers get competitive, market-driven prices without the race to the bottom. Payouts are processed within 3–5 business days after buyer confirmation.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&h=630&fit=crop",
    category: BLOG_POST_FIELDS.CATEGORY_VALUES.NEWS,
    tags: ["auctions", "platform", "feature", "launch", "news"],
    isFeatured: false,
    status: BLOG_POST_FIELDS.STATUS_VALUES.PUBLISHED,
    publishedAt: new Date("2026-01-25T10:00:00Z"),
    authorId: "user-admin-user-admin",
    authorName: "Admin User",
    readTimeMinutes: 4,
    views: 3210,
    metaTitle: "LetItRip Launches Live Auction Platform | Platform News",
    metaDescription:
      "LetItRip announces its new live auction feature for outdoor gear. Bid, win and explore premium equipment at fair market prices.",
    createdAt: new Date("2026-01-24T14:00:00Z"),
    updatedAt: new Date("2026-01-25T10:00:00Z"),
  },

  {
    id: "blog-buyer-seller-protection-policy-updates-updates",
    title: "Updated Buyer & Seller Protection Policies — What's New",
    slug: "updated-buyer-seller-protection-policies-2026",
    excerpt:
      "We've strengthened our protection policies to give every transaction on LetItRip more confidence — here's a clear breakdown of what changed.",
    content: `<h2>Key Changes Effective 1 February 2026</h2><p><strong>Buyers:</strong> The return window for physical goods is extended from 7 to 14 days for all categories except digital items. Refunds are now processed within 5 business days — down from 10.</p><p><strong>Sellers:</strong> We've introduced a dispute resolution SLA; all buyer claims will be reviewed within 48 hours. Sellers with a dispute rate below 0.5% get a 'Trusted Seller' badge automatically.</p><h2>Why We Made These Changes</h2><p>Feedback from our community surveys — over 2,400 responses — made it clear that faster refunds and clearer dispute timelines were the top priorities. We listened.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop",
    category: BLOG_POST_FIELDS.CATEGORY_VALUES.UPDATES,
    tags: ["policy", "protection", "returns", "refunds", "updates"],
    isFeatured: false,
    status: BLOG_POST_FIELDS.STATUS_VALUES.PUBLISHED,
    publishedAt: new Date("2026-02-01T08:00:00Z"),
    authorId: "user-admin-user-admin",
    authorName: "Admin User",
    readTimeMinutes: 5,
    views: 1845,
    metaTitle: "Updated Protection Policies Feb 2026 | LetItRip",
    metaDescription:
      "LetItRip updates buyer and seller protection policies — extended return windows, faster refunds, and a new Trusted Seller programme.",
    createdAt: new Date("2026-01-30T12:00:00Z"),
    updatedAt: new Date("2026-02-01T08:00:00Z"),
  },

  {
    id: "blog-seller-tips-better-product-photos-tips",
    title: "5 Pro Tips for Taking Better Product Photos on a Budget",
    slug: "5-pro-tips-better-product-photos-budget",
    excerpt:
      "You don't need a DSLR to take great listing photos. Learn how to use natural light, simple backgrounds, and your phone camera to make your products irresistible.",
    content: `<h2>Tip 1 — Chase Natural Light</h2><p>Place your product near a north-facing window for soft, diffused light with no harsh shadows. Golden hour (7–9 AM or 4–6 PM) gives warm tones that work beautifully for outdoor gear.</p><h2>Tip 2 — Keep Backgrounds Simple</h2><p>A plain white foam board costs ₹50 at any stationery shop. It removes distractions and makes your product the sole focus.</p><h2>Tip 3 — Shoot Multiple Angles</h2><p>Buyers want to see front, back, sides, close-ups of details, and any wear or damage. Aim for 6–8 photos per listing.</p><h2>Tip 4 — Use Portrait Mode Sparingly</h2><p>Portrait mode blurs backgrounds, but over-blurring hides useful context. Use it for hero shots only, not detail shots where sharpness is key.</p><h2>Tip 5 — Edit Minimally</h2><p>Adjust brightness and contrast only — never change colours. Buyers should receive exactly what they see in the photo.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&h=630&fit=crop",
    category: BLOG_POST_FIELDS.CATEGORY_VALUES.TIPS,
    tags: ["seller", "photography", "listing", "tips", "product-photos"],
    isFeatured: false,
    status: BLOG_POST_FIELDS.STATUS_VALUES.PUBLISHED,
    publishedAt: new Date("2026-02-05T09:30:00Z"),
    authorId: "user-admin-user-admin",
    authorName: "Admin User",
    readTimeMinutes: 6,
    views: 2234,
    metaTitle: "Better Product Photos on a Budget — Seller Tips | LetItRip",
    metaDescription:
      "5 actionable tips to improve your product listing photos using just your smartphone. No expensive camera required.",
    createdAt: new Date("2026-02-03T11:00:00Z"),
    updatedAt: new Date("2026-02-05T09:30:00Z"),
  },

  {
    id: "blog-community-spotlight-jan-2026-community",
    title: "Community Spotlight: January 2026 Top Sellers & Reviewers",
    slug: "community-spotlight-january-2026",
    excerpt:
      "Meet the outstanding community members who made January 2026 a record month — from our top-rated sellers to the most helpful reviewers.",
    content: `<h2>Top Sellers of January</h2><p><strong>TechHub Electronics</strong> — 47 orders fulfilled at a 4.9-star average. Their iPhone and Samsung listings consistently hit the featured section thanks to detailed descriptions and fast shipping.</p><p><strong>Fashion Boutique</strong> — specialising in sustainable clothing, they earned the 'Trusted Seller' badge in January with a zero-dispute month.</p><h2>Top Reviewers</h2><p><strong>John Doe</strong> — 4 in-depth reviews in January, each with detailed pros/cons and real-world usage context. John's review of the iPhone 15 Pro Max has been marked helpful by 24 community members.</p><h2>New Members</h2><p>330 new buyers and 18 new sellers joined LetItRip in January — a 34% month-on-month increase. Welcome to the community!</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop",
    category: BLOG_POST_FIELDS.CATEGORY_VALUES.COMMUNITY,
    tags: ["community", "spotlight", "sellers", "reviewers", "january-2026"],
    isFeatured: false,
    status: BLOG_POST_FIELDS.STATUS_VALUES.PUBLISHED,
    publishedAt: new Date("2026-02-10T10:00:00Z"),
    authorId: "user-admin-user-admin",
    authorName: "Admin User",
    readTimeMinutes: 5,
    views: 987,
    metaTitle: "Community Spotlight January 2026 | LetItRip",
    metaDescription:
      "Celebrating our top sellers and reviewers from January 2026 and welcoming the hundreds of new members who joined the LetItRip community.",
    createdAt: new Date("2026-02-08T13:00:00Z"),
    updatedAt: new Date("2026-02-10T10:00:00Z"),
  },

  // ── Draft ─────────────────────────────────────────────────────────────
  {
    id: "blog-camping-checklist-essentials-2026-guides-draft",
    title: "The Ultimate Camping Checklist for 2026",
    slug: "ultimate-camping-checklist-2026",
    excerpt:
      "Whether it's a weekend car camp or a 7-day backcountry expedition, this checklist covers everything you need to pack — and nothing you don't.",
    content: `<h2>Shelter & Sleep</h2><p>- Tent rated for your expected conditions (3-season vs 4-season)</p><p>- Ground sheet / footprint</p><p>- Sleeping bag (temperature rating matters)</p><p>- Sleeping pad (R-value ≥ 3 for cold ground)</p><h2>Cooking & Water</h2><p>- Compact stove + fuel canister</p><p>- Pot / pan set</p><p>- Water filter or purification tablets</p><p>[Draft — more sections coming]</p>`,
    category: BLOG_POST_FIELDS.CATEGORY_VALUES.GUIDES,
    tags: ["camping", "checklist", "gear", "outdoor", "beginners"],
    isFeatured: false,
    status: BLOG_POST_FIELDS.STATUS_VALUES.DRAFT,
    authorId: "user-admin-user-admin",
    authorName: "Admin User",
    readTimeMinutes: 12,
    views: 0,
    createdAt: new Date("2026-02-20T09:00:00Z"),
    updatedAt: new Date("2026-02-20T09:00:00Z"),
  },

  // ── Archived ─────────────────────────────────────────────────────────
  {
    id: "blog-festive-sale-dec-2025-recap-community-archived",
    title: "Festive Sale December 2025 — A Recap",
    slug: "festive-sale-december-2025-recap",
    excerpt:
      "December's mega sale was our biggest ever — here's a look at the numbers, the bestsellers, and what the community loved most.",
    content: `<p>This post has been archived. For current deals and updates, visit our <a href="/blog">blog</a>.</p>`,
    coverImage:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&h=630&fit=crop",
    category: BLOG_POST_FIELDS.CATEGORY_VALUES.COMMUNITY,
    tags: ["sale", "december", "2025", "recap"],
    isFeatured: false,
    status: BLOG_POST_FIELDS.STATUS_VALUES.ARCHIVED,
    publishedAt: new Date("2025-12-28T10:00:00Z"),
    authorId: "user-admin-user-admin",
    authorName: "Admin User",
    readTimeMinutes: 3,
    views: 5602,
    createdAt: new Date("2025-12-27T14:00:00Z"),
    updatedAt: new Date("2026-01-15T08:00:00Z"),
  },
];
