// appkit.config.js — configuration for @mohasinac/appkit CLI tools
// Run "npx appkit-smoke-ssr", "npx appkit-smoke-bundle", etc. after setup.

/** @type {import("@mohasinac/appkit").AppkitConfig} */
const config = {
  baseUrl: "http://localhost:3000",
  locales: ["en"],

  // ─── Brand & identity ────────────────────────────────────────────────────
  brand: {
    name: "LetItRip",
    shortName: "LT",
    description:
      "India's collector-first marketplace for figures, TCG gear, cosplay, and curated collectibles. Trusted sellers, authentic products.",
    madeInText: "Made with ♥ for collectors",
    socialUrls: {
      whatsapp: "https://chat.whatsapp.com/JOlbdSwhVWYDKujolcBZDr",
      github: "https://github.com/mohasinac",
    },
  },

  // ─── Legal entity ────────────────────────────────────────────────────────
  // 🛑 THE one owner of the business's statutory identity, for the same reason
  // `seo.siteUrl` below is the one owner of the canonical host.
  //
  // Before this block the same facts lived in five places that already
  // disagreed: COMPANY_ADDRESS in .env.local (which nothing read —
  // appkit/src/_internal/shared/features/returns/destination.ts says so in a
  // comment), siteSettings.contact, siteSettings.faq.variables,
  // siteSettings.gst, hardcoded literals in ContactPageView.tsx, and
  // messages/en.json. Four different support addresses were published
  // (support@ / legal@ / privacy@ / reply@) and the registered address said
  // Solapur while the warehouse said Hyderabad.
  //
  // None of this is secret. A GSTIN is legally REQUIRED to be published, as
  // are the registered address, the grievance officer and the support
  // channels, under the Consumer Protection (E-Commerce) Rules 2020 and the
  // IT Rules 2021. That is why it lives in a committed, code-reviewed file
  // rather than in env — the env vars below exist to OVERRIDE per deployment,
  // not to hide anything.
  //
  // 🛑 `null` means NOT YET DECIDED, and renders as a visible
  // `[to be confirmed]` marker via <PendingValue>. It must never be replaced
  // with a plausible-looking guess: every one of these appears on a page whose
  // purpose is legal disclosure, and an invented support phone number or
  // refund window is worse than an obviously missing one.
  business: {
    legalName: "Let It Rip India",
    proprietor: "Mohasin Ahamed Chinnapattan",
    structure: "Sole proprietorship",
    gstin: process.env.BUSINESS_GSTIN || "27BILPC5850Q1ZN",
    udyamNumber: process.env.BUSINESS_UDYAM_NUMBER || null,

    registeredAddress: {
      line1: "Flat 503, H. No. 127, C.S. No. 6166",
      line2: "Darus Salam Siddhe",
      city: "Solapur",
      state: "Maharashtra",
      // 🛑 Load-bearing, not decorative. `isIntraStateSupply` in
      // appkit/src/_internal/shared/checkout/order-math.ts decides CGST+SGST
      // vs IGST from the supply states, and 27 is Maharashtra — which must
      // match the first two digits of the GSTIN above. If one changes, both do.
      stateCode: "27",
      postalCode: "413001",
      country: "India",
    },

    support: {
      email: process.env.BUSINESS_SUPPORT_EMAIL || null,
      phone: process.env.BUSINESS_SUPPORT_PHONE || null,
      whatsapp: process.env.BUSINESS_WHATSAPP_NUMBER || null,
      hours: process.env.BUSINESS_SUPPORT_HOURS || null,
    },

    // Mandatory disclosure. Before this existed the only occurrence of the word
    // "grievance" in the entire repo was one sentence inside
    // privacy.sections.4.body — no name, no contact, no response SLA.
    grievance: {
      name: process.env.BUSINESS_GRIEVANCE_NAME || null,
      designation: process.env.BUSINESS_GRIEVANCE_DESIGNATION || null,
      email: process.env.BUSINESS_GRIEVANCE_EMAIL || null,
      phone: process.env.BUSINESS_GRIEVANCE_PHONE || null,
    },

    // Published policy terms. Deliberately strings rather than numbers: these
    // are rendered as prose ("2-3 business days"), and a number would force
    // every page to re-invent the unit.
    policy: {
      processingTime: process.env.BUSINESS_PROCESSING_TIME || null,
      deliveryEstimate: process.env.BUSINESS_DELIVERY_ESTIMATE || null,
      shippingCharges: process.env.BUSINESS_SHIPPING_CHARGES || null,
      cancellationWindow: process.env.BUSINESS_CANCELLATION_WINDOW || null,
      returnWindow: process.env.BUSINESS_RETURN_WINDOW || null,
      refundTimeline: process.env.BUSINESS_REFUND_TIMELINE || null,
    },

    // Where buyers paying by bank transfer send money. The bank is Slice, the
    // business's current-account provider.
    //
    // 🛑 `accountNumber` and `ifsc` are PRIVATE — they reach only a signed-in
    // buyer with an order awaiting payment, never the public
    // GET /api/site-settings. Publishing them is Root Cause #70 exactly.
    bank: {
      name: process.env.BUSINESS_BANK_NAME || "Slice",
      accountName: process.env.BUSINESS_BANK_ACCOUNT_NAME || null,
      branchName: process.env.BUSINESS_BANK_ACCOUNT_BRANCH_NAME || null,
      accountNumber: process.env.BUSINESS_BANK_ACCOUNT_NUMBER || null,
      ifsc: process.env.BUSINESS_BANK_IFSC || null,
      upiVpa: process.env.BUSINESS_UPI_VPA || null,
      // Static, public, and deliberately NOT routed through /api/media — that
      // proxy watermarks every image it serves with no opt-out, and a mark over
      // a QR can corrupt enough modules to break the scan.
      qrImagePath: "/business/payment-qr.jpg",
    },
  },

  // ─── SEO defaults ────────────────────────────────────────────────────────
  // 🛑 `siteUrl` is THE canonical host, and this is its ONLY definition.
  //
  // src/constants/seo.server.ts derives LETITRIP_SEO.siteUrl from this value
  // (via SEO_CONFIG) rather than reading env itself. It used to have its own
  // `NEXT_PUBLIC_APP_URL || NEXT_PUBLIC_SITE_URL || "https://letitrip.in"`
  // chain, and a comment here claiming the two were "kept in sync". They were
  // not: once NEXT_PUBLIC_SITE_URL was set to the www host on Vercel, the
  // env-driven path (page canonicals, og:url, JSON-LD) said www while this
  // hardcoded literal (robots.txt Host/Sitemap, every sitemap <loc>, root
  // metadataBase) still said apex. Result: all 182 sitemap URLs pointed at a
  // host that 307-redirects, and the site fell out of Google.
  //
  // Two owners of one value is the bug. Keep it to one.
  // Enforced by scripts/audit-seo-canonical-host.mjs.
  //
  // Must include the scheme, must NOT have a trailing slash, and must match the
  // Vercel primary domain — the other host 308-redirects to it.
  seo: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.letitrip.in",
    defaultTitle: "LetItRip — India's Collectibles Marketplace",
    defaultDescription:
      "Buy, sell & auction action figures, trading cards, spinning tops, model kits and more. India's largest collectibles marketplace.",
    // 🛑 Root-relative, and the ONLY definition — src/constants/seo.server.ts
    // absolutizes this against `siteUrl` rather than hardcoding its own copy.
    //
    // This read `/media/site-og-image` until 2026-09-14. No such media asset
    // has ever existed: `/media/<slug>` resolves a real row, so the URL 404'd
    // and EVERY social card the site has ever produced was imageless. A slug
    // nobody uploaded is not a default — point this at something that renders.
    // `/opengraph-image` is src/app/opengraph-image.tsx, prerendered at build.
    defaultImage: "/opengraph-image",
    siteName: "LetItRip",
    locale: "en_IN",
  },

  // ─── i18n / next-intl routing ────────────────────────────────────────────
  i18n: {
    // Suppress the Set-Cookie: Next-Locale header so Vercel ISR caching works.
    // Only valid while the app runs a single locale (en).
    localePrefix: "never",
    enableLocaleCookie: false,
  },

  // ─── Smoke tests & theme probes ──────────────────────────────────────────
  routes: {
    smoke: [
      { path: "/", expect: ["LetItRip"] },
      { path: "/en", expect: ["LetItRip"] },
      { path: "/en/products", expect: ["Products", "LetItRip"] },
      { path: "/sitemap.xml", expect: ["<urlset"] },
      { path: "/robots.txt", expect: ["User-agent"] },
    ],
    themeProbe: [
      { path: "/en", screenshotName: "home" },
      { path: "/en/products", screenshotName: "products-list" },
    ],
  },

  bundleForbidden: ["firebase-admin", "node:fs", "node:child_process"],

  // authFixtures: set ADMIN_FIXTURE_TOKEN etc. from your test environment
  // authFixtures: {
  //   admin:  { cookie: "session=ADMIN_FIXTURE_TOKEN" },
  //   seller: { cookie: "session=SELLER_FIXTURE_TOKEN" },
  //   buyer:  { cookie: "session=BUYER_FIXTURE_TOKEN" },
  // },

  themeOverrides: {
    "--appkit-color-primary":   "#FF0066",
    "--appkit-color-secondary": "#0066FF",
  },

  // ─── Firebase ────────────────────────────────────────────────────────────
  firebase: {
    projectId: "letitrip-in",
    indexesPath: "appkit/firebase/base/firestore.indexes.json",
    functionsRegion: "asia-south1",
    extensions: {
      /** @type {import("@mohasinac/appkit").FirestoreIndex[]} */
      indexes: [],
      fieldOverrides: [],
      database: {},
      firestoreRules: "",
      storageRules: "",
    },
  },

  // ─── Vercel ──────────────────────────────────────────────────────────────
  vercel: {
    projectId: "letitrip-in",
    regions: ["bom1"],
  },
};

module.exports = config;
