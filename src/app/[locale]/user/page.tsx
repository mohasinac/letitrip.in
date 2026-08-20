"use client";
import { Row, Stack, normalizeError } from "@mohasinac/appkit/client";
import { useRef, useState } from "react";
import {
  UserAccountHubView,
  useAuth,
  useOrders,
  useWishlistCount,
  useMediaUpload,
  useUpdateProfile,
  useToast,
  OrdersList,
  ROUTES,
  ACTIONS,
  Button,
  Div,
  DynamicBgDiv,
  Input,
  Span,
} from "@mohasinac/appkit/client";
import { useNotifications } from "@mohasinac/appkit/client";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  MessageCircle,
  Bell,
  Star,
  Tag,
  CalendarDays,
  Gift,
  Clock,
  KeyRound,
  Undo2,
  LifeBuoy,
  Gavel,
  Store,
  Camera,
  Archive,
  History,
  Ticket,
  UserCircle,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";

const __P = {
  p5: "p-[var(--appkit-space-5)]",
} as const;

const __O = {
  hidden: "overflow-hidden",
} as const;

const BRAND_GRAD = "linear-gradient(135deg,var(--appkit-color-primary-700) 0%,var(--appkit-color-cobalt) 55%,var(--appkit-color-secondary-400) 100%)";

const NAV_LINKS = [
  { label: "My Orders",         href: ROUTES.USER.ORDERS,         Icon: ShoppingBag },
  { label: "My Bids",           href: ROUTES.USER.BIDS,           Icon: Gavel },
  { label: "My Offers",         href: ROUTES.USER.OFFERS,         Icon: Tag },
  { label: "Wishlist",          href: ROUTES.USER.WISHLIST,       Icon: Heart },
  { label: "Pre-Orders",        href: ROUTES.USER.PRE_ORDERS,     Icon: Clock },
  { label: "Digital Codes",     href: ROUTES.USER.DIGITAL_CODES,  Icon: KeyRound },
  { label: "Prize Draws",       href: ROUTES.USER.PRIZE_DRAWS,    Icon: Gift },
  { label: "Events",            href: ROUTES.USER.EVENTS,         Icon: CalendarDays },
  { label: "Reviews",           href: ROUTES.USER.REVIEWS,        Icon: Star },
  { label: "Returns & Refunds", href: ROUTES.USER.RETURNS,        Icon: Undo2 },
  { label: "Recently Viewed",   href: ROUTES.USER.HISTORY,        Icon: History },
  { label: "My Catalogue",      href: ROUTES.USER.CATALOGUE,      Icon: Archive },
  { label: "My Coupons",        href: ROUTES.USER.CLAIMED_COUPONS, Icon: Ticket },
  { label: "Addresses",         href: ROUTES.USER.ADDRESSES,      Icon: MapPin },
  { label: "Messages",          href: ROUTES.USER.MESSAGES,       Icon: MessageCircle },
  { label: "Notifications",     href: ROUTES.USER.NOTIFICATIONS,  Icon: Bell },
  { label: "Support",           href: ROUTES.USER.SUPPORT,        Icon: LifeBuoy },
  { label: "Settings",          href: ROUTES.USER.SETTINGS,       Icon: Settings },
  { label: "Become a Seller",   href: ROUTES.USER.BECOME_SELLER,  Icon: Store },
];

function StatCard({ label, value, href }: { label: string; value: string | number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-3)] shadow-sm hover:border-[var(--appkit-color-primary)] hover:shadow-md transition-colors"
    >
      <Div textSize="2xl" textWeight="bold" className="text-[var(--appkit-color-text)] leading-tight">{value}</Div>
      <Div textSize="xs" className="text-[var(--appkit-color-text-muted)] mt-0.5">{label}</Div>
    </Link>
  );
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function Page() {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();
  const { orders, isLoading: ordersLoading } = useOrders({ page: 1, perPage: 3 });
  const { orders: allOrdersForStats } = useOrders({ page: 1, perPage: 100 });
  const { unreadCount } = useNotifications();
  const wishlistCount = useWishlistCount(user?.uid ?? null);
  const { upload } = useMediaUpload();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const updateProfile = useUpdateProfile({
    onSuccess: () => showToast("Profile photo updated.", "success"),
    onError: (err) => showToast(err?.message ?? "Failed to update photo.", "error"),
  });

  async function onPickFile(file: File | null) {
    if (!file || !user) return;
    setUploading(true);
    try {
      const parts = (user.displayName ?? user.email ?? "user").split(" ");
      const url = await upload(file, "avatars", true, {
        type: "user-avatar",
        firstName: parts[0] ?? "user",
        lastName: parts[1] ?? "",
      });
      await updateProfile.mutateAsync({ photoURL: url });
    } catch (e: any) {
      void normalizeError(e);
      showToast(e?.message ?? "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  }

  const totalOrders = allOrdersForStats.length;
  const totalSpent = allOrdersForStats.reduce(
    (acc: number, o: any) => acc + (typeof o?.totalAmount === "number" ? o.totalAmount : 0),
    0,
  );

  return (
    <UserAccountHubView
      labels={{ title: "My Account" }}
      renderProfile={() =>
        userLoading ? null : user ? (
          <Stack gap="md">
            <Row className={`relative border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] ${__O.hidden} ${__P.p5}`} align="center" gap="md" rounded="xl" shadow="sm">
              <DynamicBgDiv
                background={BRAND_GRAD}
                className="absolute top-0 left-0 right-0 h-[3px]"
                aria-hidden="true"
              />
              <Button rounded="full" 
                variant="ghost"
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile photo"
                className="group relative h-16 w-16 flex-shrink-0 overflow-hidden ring-2 ring-[var(--appkit-color-border)] p-[var(--appkit-space-0)] min-h-0 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line lir/no-raw-media-elements, @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <DynamicBgDiv
                    background={BRAND_GRAD}
                    className="h-full w-full flex items-center justify-center text-white font-bold text-[length:var(--appkit-text-xl)]"
                  >
                    {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                  </DynamicBgDiv>
                )}
                <Row surface="overlay-xs" className="absolute inset-0 bg-transparent group-hover:bg-[var(--appkit-color-text)]/40 transition-colors opacity-0 group-hover:opacity-100" align="center" justify="center">
                  <Camera className="w-5 h-5 text-white" />
                </Row>
                {uploading && (
                  <Row textWeight="semibold" surface="overlay-lg" className="absolute inset-0 text-white text-[10px]" align="center" justify="center">
                    Saving…
                  </Row>
                )}
              </Button>
              <Input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                bare
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              <Div className="min-w-0 flex-1">
                <Div textWeight="semibold" className="text-[var(--appkit-color-text)] truncate">
                  {user.displayName ?? "My Account"}
                </Div>
                {user.email && (
                  <Div textSize="sm" className="text-[var(--appkit-color-text-muted)] truncate">{user.email}</Div>
                )}
                <Row gap="md" className="mt-0.5">
                  <Link
                    href={String(ROUTES.USER.PROFILE)}
                    className="text-[length:var(--appkit-text-xs)] font-medium text-[var(--appkit-color-primary)] hover:underline"
                  >
                    View / edit profile →
                  </Link>
                  <Link
                    href={String(ROUTES.PUBLIC.PROFILE(user.uid))}
                    className="text-[length:var(--appkit-text-xs)] font-medium text-[var(--appkit-color-primary)] hover:underline"
                  >
                    View public profile →
                  </Link>
                </Row>
              </Div>
            </Row>

            <Div layout="grid" gap="3" className="grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              <StatCard label="Orders"        value={totalOrders}                   href={String(ROUTES.USER.ORDERS)} />
              <StatCard label="Total spent"   value={formatINR(totalSpent)}    href={String(ROUTES.USER.ORDERS)} />
              <StatCard label="Wishlist"      value={wishlistCount ?? 0}            href={String(ROUTES.USER.WISHLIST)} />
              <StatCard label="Unread alerts" value={unreadCount ?? 0}              href={String(ROUTES.USER.NOTIFICATIONS)} />
              <StatCard label="Support"       value={"Open"}                         href={String(ROUTES.USER.SUPPORT)} />
            </Div>
          </Stack>
        ) : null
      }
      renderNav={() => (
        <Div layout="grid" gap="3" className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {(user
            ? [{ label: "My Public Profile", href: ROUTES.PUBLIC.PROFILE(user.uid), Icon: UserCircle }, ...NAV_LINKS]
            : NAV_LINKS
          ).map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={String(href)}
              className="group flex items-center gap-[var(--appkit-space-3)] rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-[var(--appkit-space-4)] py-[var(--appkit-space-3-5)] text-[length:var(--appkit-text-sm)] font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
            >
              <DynamicBgDiv
                background={BRAND_GRAD}
                className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md"
              >
                <Icon className="w-3.5 h-3.5 text-white" />
              </DynamicBgDiv>
              {label}
            </Link>
          ))}
        </Div>
      )}
      renderRecentOrders={() =>
        orders.length > 0 || ordersLoading ? (
          <>
            <Row className="mb-3" align="center" justify="between">
              <Span size="sm" weight="semibold" className="text-[var(--appkit-color-text)]">
                Recent Orders
              </Span>
              <Link
                href={String(ROUTES.USER.ORDERS)}
                className="text-[length:var(--appkit-text-xs)] text-[var(--appkit-color-primary)] hover:underline"
              >
                View all →
              </Link>
            </Row>
            <OrdersList
              orders={orders}
              isLoading={ordersLoading}
              emptyLabel="No orders yet"
              onOrderClick={(order) =>
                router.push(String(ROUTES.USER.ORDER_DETAIL(order.id)))
              }
              renderActions={(order) => (
                <Button asChild variant="outline" size="sm">
                  <Link href={ROUTES.USER.ORDER_DETAIL(order.id)}>
                    {ACTIONS.USER["view-order"].label}
                  </Link>
                </Button>
              )}
            />
          </>
        ) : null
      }
    />
  );
}
