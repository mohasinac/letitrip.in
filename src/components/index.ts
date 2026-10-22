/*
 * ── 🛑 THIS BARREL HAS NO IMPORTERS, AND MUST KEEP HAVING NONE ─────────────
 *
 * 25 of the 31 modules re-exported below import `@mohasinac/appkit/client`,
 * whose first line is `"use client"`. So a Server Component importing from
 * `"@/components"` pulls the client entry into a SERVER graph and instantiates
 * appkit a second time under the client condition — and that second instance
 * has its own EMPTY provider registry. `initProviders()` registers the session
 * provider into one copy while `createRouteHandler` reads the other, so the
 * route answers 401 UNAUTHENTICATED to every valid session. CLAUDE.md records
 * the measurement for the sibling `@/constants` barrel: ten of ten 401s on
 * `/api/payment/create-order` while four other routes behind the identical
 * gate, with the same cookie, in the same batch, all passed. The whole cost
 * was one import string.
 *
 * Measured 2026-10-22: **42 files imported this barrel**, and all but two were
 * `page.tsx` server entries — so the hazard was live on the homepage, both
 * auth flows, cart, checkout, both FAQ pages and every seller listing editor.
 * All 42 were repointed at their defining modules (Root Cause #18), and
 * `audit-component-barrel-import` keeps it that way.
 *
 * 🛑 `audit-client-entry-in-server` does NOT catch this, by design: it scopes
 * to DIRECT imports of `/client` in route entries and async components, and a
 * re-export two hops away is outside it. A 401 reads as "the session is
 * wrong", never as "there are two registries", which is what makes this class
 * expensive to diagnose and worth a rule of its own.
 *
 * The file is kept rather than deleted so the symbol→module map stays in one
 * reviewable place, and so the audit has something to derive its map FROM.
 */
export { ScrollToTop } from "./ScrollToTop";
export { ClientErrorReporterMount } from "./ClientErrorReporterMount";
export { AdminAnalyticsClient } from "./admin/AdminAnalyticsClient";
export { AdRuntimeInitializer } from "./ads/AdRuntimeInitializer";
export { FAQPageClient } from "./faq/FAQPageClient";
export { ForgotPasswordPageClient } from "./auth/ForgotPasswordPageClient";
export { LoginPageClient } from "./auth/LoginPageClient";
export { RegisterPageClient } from "./auth/RegisterPageClient";
export { ResetPasswordPageClient } from "./auth/ResetPasswordPageClient";
export { VerifyEmailPageClient } from "./auth/VerifyEmailPageClient";
// DevToolbar + isMockRazorpayEnabled + isMockShiprocketEnabled deleted in
// Track H. The in-process mock Razorpay provider itself was later removed
// entirely — Razorpay test-mode keys are the only way to exercise the
// payment flow outside manual/COD locally.
export { AfterHeroAdSlot, AfterFeaturedProductsAdSlot, AfterReviewsAdSlot, AfterFAQAdSlot } from "./homepage/AdSlots";
export { HomepageNewsletterForm } from "./homepage/HomepageNewsletterForm";
export { FooterNewsletterSlot } from "./layout/FooterNewsletterSlot";
export { FooterBadgesSlot } from "./layout/FooterBadgesSlot";
export { BrandBadgeImage } from "./layout/BrandBadgeImage";
export { LiveItemActionsClient } from "./live/LiveItemActionsClient";
export { CartRouteClient } from "./routing/CartRouteClient";
export { CheckoutRouteClient } from "./routing/CheckoutRouteClient";
export { CheckoutSuccessRouteClient } from "./routing/CheckoutSuccessRouteClient";
export { RoutePlaceholderView } from "./routing/RoutePlaceholderView";
export { StoreCreateProductShell, StoreEditProductShell } from "./store/SellerProductFormShell";
export { AddAddressClient } from "./user/AddAddressClient";
export { EditAddressClient } from "./user/EditAddressClient";
export { FontToggleClient } from "./user/FontToggleClient";
export { HandModeToggleClient } from "./user/HandModeToggleClient";
export { ProfilePageClient } from "./user/ProfilePageClient";
export { ProfileActivityPanel } from "./user/ProfileActivityPanel";
export { UserAddressesClient } from "./user/UserAddressesClient";
