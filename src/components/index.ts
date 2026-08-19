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
export { LiveItemActionsClient } from "./live/LiveItemActionsClient";
export { CartRouteClient } from "./routing/CartRouteClient";
export { CheckoutRouteClient } from "./routing/CheckoutRouteClient";
export { CheckoutSuccessRouteClient } from "./routing/CheckoutSuccessRouteClient";
export { RoutePlaceholderView } from "./routing/RoutePlaceholderView";
export { StoreCreateProductShell, StoreEditProductShell } from "./store/SellerProductFormShell";
export { AddAddressClient } from "./user/AddAddressClient";
export { EditAddressClient } from "./user/EditAddressClient";
export { FontToggleClient } from "./user/FontToggleClient";
export { ProfilePageClient } from "./user/ProfilePageClient";
export { ProfileActivityPanel } from "./user/ProfileActivityPanel";
export { UserAddressesClient } from "./user/UserAddressesClient";
