$b = "d:\proj\letitrip.in\src\app\[locale]"
function W($rel, $txt) {
  $path = Join-Path $b $rel
  [System.IO.File]::WriteAllText($path, $txt, [System.Text.Encoding]::UTF8)
  Write-Host "OK: $rel"
}

# Pack E - Content/Editorial
W "events\page.tsx" 'import { EventsListView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page() {
  return <EventsListView />;
}
'
W "events\[id]\page.tsx" 'import { EventDetailView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page({ params }: { params: { id: string } }) {
  return <EventDetailView eventId={params.id} />;
}
'
W "events\[id]\participate\page.tsx" 'import { EventParticipateView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <EventParticipateView eventId={params.id} />;
}
'
W "blog\page.tsx" 'import { BlogIndexPageView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page() {
  return <BlogIndexPageView />;
}
'
W "blog\[slug]\page.tsx" 'import { BlogPostView } from "@mohasinac/appkit";

export const revalidate = 300;

export default function Page({ params }: { params: { slug: string } }) {
  return <BlogPostView slug={params.slug} />;
}
'
W "about\page.tsx" 'import { AboutView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <AboutView />;
}
'
W "contact\page.tsx" 'import { HelpPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HelpPageView />;
}
'
W "help\page.tsx" 'import { HelpPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HelpPageView />;
}
'
W "fees\page.tsx" 'import { FeesView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <FeesView />;
}
'
W "security\page.tsx" 'import { SecurityPrivacyView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <SecurityPrivacyView />;
}
'
W "privacy\page.tsx" 'import { PolicyPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <PolicyPageView policy="privacy" />;
}
'
W "terms\page.tsx" 'import { PolicyPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <PolicyPageView policy="terms" />;
}
'
W "cookies\page.tsx" 'import { PolicyPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <PolicyPageView policy="cookies" />;
}
'
W "refund-policy\page.tsx" 'import { PolicyPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <PolicyPageView policy="refund" />;
}
'
W "shipping-policy\page.tsx" 'import { ShippingPolicyView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <ShippingPolicyView />;
}
'
W "seller-guide\page.tsx" 'import { SellerGuideView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <SellerGuideView />;
}
'
W "how-auctions-work\page.tsx" 'import { HowAuctionsWorkView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HowAuctionsWorkView />;
}
'
W "how-checkout-works\page.tsx" 'import { HowCheckoutWorksView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HowCheckoutWorksView />;
}
'
W "how-offers-work\page.tsx" 'import { HowOffersWorkView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HowOffersWorkView />;
}
'
W "how-orders-work\page.tsx" 'import { HowOrdersWorkView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HowOrdersWorkView />;
}
'
W "how-payouts-work\page.tsx" 'import { HowPayoutsWorkView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HowPayoutsWorkView />;
}
'
W "how-pre-orders-work\page.tsx" 'import { HowPreOrdersWorkView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HowPreOrdersWorkView />;
}
'
W "how-reviews-work\page.tsx" 'import { HowReviewsWorkView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <HowReviewsWorkView />;
}
'

# Pack F - FAQ
W "faqs\page.tsx" 'import { FAQPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <FAQPageView />;
}
'
W "faqs\[category]\page.tsx" 'import { FAQPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page({ params }: { params: { category: string } }) {
  return <FAQPageView category={params.category} />;
}
'

# Pack H - Checkout
W "cart\page.tsx" 'import { CartView } from "@mohasinac/appkit";

export default function Page() {
  return <CartView />;
}
'
W "checkout\page.tsx" 'import { CheckoutView } from "@mohasinac/appkit";

export default function Page() {
  return <CheckoutView />;
}
'
W "checkout\success\page.tsx" 'import { CheckoutSuccessView } from "@mohasinac/appkit";

export default function Page() {
  return <CheckoutSuccessView />;
}
'
W "track\page.tsx" 'import { TrackOrderView } from "@mohasinac/appkit";

export default function Page() {
  return <TrackOrderView />;
}
'

# Pack I - User Account
W "user\page.tsx" 'import { UserAccountHubView } from "@mohasinac/appkit";

export default function Page() {
  return <UserAccountHubView />;
}
'
W "user\profile\page.tsx" 'import { ProfileView } from "@mohasinac/appkit";

export default function Page() {
  return <ProfileView />;
}
'
W "user\settings\page.tsx" 'import { UserSettingsView } from "@mohasinac/appkit";

export default function Page() {
  return <UserSettingsView />;
}
'
W "user\orders\page.tsx" 'import { UserOrdersView } from "@mohasinac/appkit";

export default function Page() {
  return <UserOrdersView />;
}
'
W "user\orders\view\[id]\page.tsx" 'import { OrderDetailView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <OrderDetailView orderId={params.id} />;
}
'
W "user\orders\[id]\track\page.tsx" 'import { UserOrderTrackView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <UserOrderTrackView orderId={params.id} />;
}
'
W "user\messages\page.tsx" 'import { MessagesView } from "@mohasinac/appkit";

export default function Page() {
  return <MessagesView />;
}
'
W "user\notifications\page.tsx" 'import { UserNotificationsView } from "@mohasinac/appkit";

export default function Page() {
  return <UserNotificationsView />;
}
'
W "user\offers\page.tsx" 'import { UserOffersView } from "@mohasinac/appkit";

export default function Page() {
  return <UserOffersView />;
}
'
W "user\wishlist\page.tsx" 'import { WishlistView } from "@mohasinac/appkit";

export default function Page() {
  return <WishlistView />;
}
'
W "user\addresses\page.tsx" 'import { UserAddressesView } from "@mohasinac/appkit";

export default function Page() {
  return <UserAddressesView />;
}
'
W "user\addresses\add\page.tsx" 'import { UserAddressesView } from "@mohasinac/appkit";

export default function Page() {
  return <UserAddressesView mode="add" />;
}
'
W "user\addresses\edit\[id]\page.tsx" 'import { UserAddressesView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <UserAddressesView mode="edit" addressId={params.id} />;
}
'
W "user\become-seller\page.tsx" 'import { BecomeSellerView } from "@mohasinac/appkit";

export default function Page() {
  return <BecomeSellerView />;
}
'

# Pack J - Seller Console
W "seller\page.tsx" 'import { SellerDashboardView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerDashboardView />;
}
'
W "seller\products\page.tsx" 'import { SellerProductsView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerProductsView />;
}
'
W "seller\products\new\page.tsx" 'import { SellerCreateProductView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerCreateProductView />;
}
'
W "seller\products\[id]\edit\page.tsx" 'import { SellerEditProductView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <SellerEditProductView productId={params.id} />;
}
'
W "seller\auctions\page.tsx" 'import { SellerAuctionsView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerAuctionsView />;
}
'
W "seller\orders\page.tsx" 'import { SellerOrdersView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerOrdersView />;
}
'
W "seller\analytics\page.tsx" 'import { SellerAnalyticsView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerAnalyticsView />;
}
'
W "seller\coupons\page.tsx" 'import { SellerCouponsView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerCouponsView />;
}
'
W "seller\coupons\new\page.tsx" 'import { SellerCouponsView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerCouponsView mode="new" />;
}
'
W "seller\offers\page.tsx" 'import { SellerOffersView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerOffersView />;
}
'
W "seller\payouts\page.tsx" 'import { SellerPayoutsView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerPayoutsView />;
}
'
W "seller\payout-settings\page.tsx" 'import { SellerPayoutSettingsView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerPayoutSettingsView />;
}
'
W "seller\shipping\page.tsx" 'import { SellerShippingView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerShippingView />;
}
'
W "seller\store\page.tsx" 'import { SellerStoreView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerStoreView />;
}
'
W "seller\addresses\page.tsx" 'import { SellerAddressesView } from "@mohasinac/appkit";

export default function Page() {
  return <SellerAddressesView />;
}
'

# Pack K - Admin Console
W "admin\dashboard\page.tsx" 'import { AdminDashboardView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminDashboardView />;
}
'
W "admin\analytics\page.tsx" 'import { AdminAnalyticsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminAnalyticsView />;
}
'
W "admin\products\[[...action]]\page.tsx" 'import { AdminProductsView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminProductsView action={action} resourceId={id} />;
}
'
W "admin\orders\[[...action]]\page.tsx" 'import { AdminOrdersView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminOrdersView action={action} resourceId={id} />;
}
'
W "admin\users\[[...action]]\page.tsx" 'import { AdminUsersView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminUsersView action={action} resourceId={id} />;
}
'
W "admin\reviews\[[...action]]\page.tsx" 'import { AdminReviewsView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminReviewsView action={action} resourceId={id} />;
}
'
W "admin\stores\page.tsx" 'import { AdminStoresView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminStoresView />;
}
'
W "admin\blog\[[...action]]\page.tsx" 'import { AdminBlogView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminBlogView action={action} resourceId={id} />;
}
'
W "admin\events\page.tsx" 'import { AdminEventsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminEventsView />;
}
'
W "admin\events\[id]\entries\page.tsx" 'import { AdminEventEntriesView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <AdminEventEntriesView eventId={params.id} />;
}
'
W "admin\faqs\[[...action]]\page.tsx" 'import { AdminFaqsView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminFaqsView action={action} resourceId={id} />;
}
'
W "admin\coupons\[[...action]]\page.tsx" 'import { AdminCouponsView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminCouponsView action={action} resourceId={id} />;
}
'
W "admin\bids\[[...action]]\page.tsx" 'import { AdminBidsView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminBidsView action={action} resourceId={id} />;
}
'
W "admin\carousel\[[...action]]\page.tsx" 'import { AdminCarouselView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminCarouselView action={action} resourceId={id} />;
}
'
W "admin\categories\[[...action]]\page.tsx" 'import { AdminCategoriesView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { action?: string[] } }) {
  const [action, id] = params.action ?? [];
  return <AdminCategoriesView action={action} resourceId={id} />;
}
'
W "admin\payouts\page.tsx" 'import { AdminPayoutsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminPayoutsView />;
}
'
W "admin\media\page.tsx" 'import { AdminMediaView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminMediaView />;
}
'
W "admin\navigation\page.tsx" 'import { AdminNavigationView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminNavigationView />;
}
'
W "admin\feature-flags\page.tsx" 'import { AdminFeatureFlagsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminFeatureFlagsView />;
}
'
W "admin\site\page.tsx" 'import { AdminSiteView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminSiteView />;
}
'
W "admin\copilot\page.tsx" 'import { AdminCopilotView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminCopilotView />;
}
'
W "admin\sections\[[...action]]\page.tsx" 'import { AdminSectionsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminSectionsView />;
}
'
W "admin\ads\page.tsx" 'import { AdminAdsView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminAdsView />;
}
'
W "admin\ads\new\page.tsx" 'import { AdminAdEditorView } from "@mohasinac/appkit";

export default function Page() {
  return <AdminAdEditorView />;
}
'
W "admin\ads\[id]\edit\page.tsx" 'import { AdminAdEditorView } from "@mohasinac/appkit";

export default function Page({ params }: { params: { id: string } }) {
  return <AdminAdEditorView adId={params.id} />;
}
'

# Pack L - Auth/Utility
W "auth\login\page.tsx" 'import { LoginForm } from "@mohasinac/appkit";

export default function Page() {
  return <LoginForm />;
}
'
W "auth\register\page.tsx" 'import { RegisterForm } from "@mohasinac/appkit";

export default function Page() {
  return <RegisterForm />;
}
'
W "auth\forgot-password\page.tsx" 'import { ForgotPasswordView } from "@mohasinac/appkit";

export default function Page() {
  return <ForgotPasswordView />;
}
'
W "auth\reset-password\page.tsx" 'import { ResetPasswordView } from "@mohasinac/appkit";

export default function Page() {
  return <ResetPasswordView />;
}
'
W "auth\verify-email\page.tsx" 'import { VerifyEmailView } from "@mohasinac/appkit";

export default function Page() {
  return <VerifyEmailView />;
}
'
W "auth\oauth-loading\page.tsx" 'import { OAuthLoadingView } from "@mohasinac/appkit";

export default function Page() {
  return <OAuthLoadingView />;
}
'
W "unauthorized\page.tsx" 'import { UnauthorizedView } from "@mohasinac/appkit";

export default function Page() {
  return <UnauthorizedView />;
}
'
W "demo\seed\page.tsx" 'import { DemoSeedView } from "@mohasinac/appkit";

export default function Page() {
  return <DemoSeedView />;
}
'

# Remaining Public pages
W "reviews\page.tsx" 'import { ReviewsIndexPageView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page() {
  return <ReviewsIndexPageView />;
}
'
W "sellers\page.tsx" 'import { SellersListView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page() {
  return <SellersListView />;
}
'
W "sellers\[id]\page.tsx" 'import { PublicProfileView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page({ params }: { params: { id: string } }) {
  return <PublicProfileView userId={params.id} />;
}
'
W "categories\page.tsx" 'import { CategoriesIndexPageView } from "@mohasinac/appkit";

export const revalidate = 300;

export default function Page() {
  return <CategoriesIndexPageView />;
}
'
W "auctions\page.tsx" 'import { AuctionsListView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page() {
  return <AuctionsListView />;
}
'
W "auctions\[id]\page.tsx" 'import { AuctionDetailPageView } from "@mohasinac/appkit";

export const revalidate = 30;

export default function Page({ params }: { params: { id: string } }) {
  return <AuctionDetailPageView auctionId={params.id} />;
}
'
W "pre-orders\page.tsx" 'import { PreOrdersListView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page() {
  return <PreOrdersListView />;
}
'
W "pre-orders\[id]\page.tsx" 'import { PreOrderDetailPageView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page({ params }: { params: { id: string } }) {
  return <PreOrderDetailPageView preOrderId={params.id} />;
}
'
W "products\page.tsx" 'import { ProductsIndexPageView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page() {
  return <ProductsIndexPageView />;
}
'
W "products\[slug]\page.tsx" 'import { ProductDetailPageView } from "@mohasinac/appkit";

export const revalidate = 60;

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductDetailPageView slug={params.slug} />;
}
'
W "profile\[userId]\page.tsx" 'import { PublicProfileView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page({ params }: { params: { userId: string } }) {
  return <PublicProfileView userId={params.userId} />;
}
'
W "stores\page.tsx" 'import { StoresIndexPageView } from "@mohasinac/appkit";

export const revalidate = 120;

export default function Page() {
  return <StoresIndexPageView />;
}
'

Write-Host "ALL DONE"