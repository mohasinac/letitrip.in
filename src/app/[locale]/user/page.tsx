"use client";
import { Row, Stack, normalizeError } from "@mohasinac/appkit";
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
  Button,
  Div,
  Span,
} from "@mohasinac/appkit/client";
import { useNotifications } from "@mohasinac/appkit";
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
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const __P = {
  p5: "p-5",
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
      className="rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3 shadow-sm hover:border-[var(--appkit-color-primary)] hover:shadow-md transition-colors"
    >
      <Div textSize="2xl" textWeight="bold" className="text-[var(--appkit-color-text)] leading-tight">{value}</Div>
      <Div textSize="xs" className="text-[var(--appkit-color-text-muted)] mt-0.5">{label}</Div>
    </Link>
  );
}

function formatINR(paise: number): string {
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export default function Page() {
  const { user, loading: userLoading } = useAuth();
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
  const totalSpentPaise = allOrdersForStats.reduce(
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
              <Div
                className="absolute top-0 left-0 right-0 h-[3px]"
                // audit-inline-style-ok: runtime brand gradient
                style={{ background: BRAND_GRAD }}
                aria-hidden="true"
              />
              <Button rounded="full" 
                variant="ghost"
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile photo"
                className="group relative h-16 w-16 flex-shrink-0 overflow-hidden ring-2 ring-[var(--appkit-color-border)] p-0 min-h-0 focus:outline-none focus:ring-2 focus:ring-[var(--appkit-color-primary)]"
              >
                {user.photoURL ? (
                  // eslint-disable-next-line lir/no-raw-media-elements, @next/next/no-img-element
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Row textWeight="bold" 
                    className="h-full w-full text-white text-xl" align="center" justify="center"
                    // audit-inline-style-ok: runtime brand gradient
                    style={{ background: BRAND_GRAD }}
                  >
                    {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                  </Row>
                )}
                <Row surface="overlay-xs" className="absolute inset-0 bg-black/0 group-hover: transition-colors opacity-0 group-hover:opacity-100" align="center" justify="center">
                  <Camera className="w-5 h-5 text-white" />
                </Row>
                {uploading && (
                  <Row textWeight="semibold" surface="overlay-lg" className="absolute inset-0 text-white text-[10px]" align="center" justify="center">
                    Saving…
                  </Row>
                )}
              </Button>
              {/* audit-raw-form-input-ok: hidden native file picker, no appkit equivalent */}
              {/* eslint-disable-next-line lir/no-raw-html-elements */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
              />
              <Div className="min-w-0 flex-1">
                <Div textWeight="semibold" className="text-[var(--appkit-color-text)] truncate">
                  {user.displayName ?? "My Account"}
                </Div>
                {user.email && (
                  <Div textSize="sm" className="text-[var(--appkit-color-text-muted)] truncate">{user.email}</Div>
                )}
                <Link
                  href={String(ROUTES.USER.PROFILE)}
                  className="text-xs font-medium text-[var(--appkit-color-primary)] hover:underline"
                >
                  View / edit profile →
                </Link>
              </Div>
            </Row>

            <Div layout="grid" gap="3" className="grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
              <StatCard label="Orders"        value={totalOrders}                   href={String(ROUTES.USER.ORDERS)} />
              <StatCard label="Total spent"   value={formatINR(totalSpentPaise)}    href={String(ROUTES.USER.ORDERS)} />
              <StatCard label="Wishlist"      value={wishlistCount ?? 0}            href={String(ROUTES.USER.WISHLIST)} />
              <StatCard label="Unread alerts" value={unreadCount ?? 0}              href={String(ROUTES.USER.NOTIFICATIONS)} />
              <StatCard label="Support"       value={"Open"}                         href={String(ROUTES.USER.SUPPORT)} />
            </Div>
          </Stack>
        ) : null
      }
      renderNav={() => (
        <Div layout="grid" gap="3" className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {NAV_LINKS.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={String(href)}
              className="group flex items-center gap-3 rounded-xl border border-[var(--appkit-color-border)] bg-[var(--appkit-color-surface)] px-4 py-3.5 text-sm font-medium text-[var(--appkit-color-text)] hover:border-[var(--appkit-color-primary)] hover:text-[var(--appkit-color-primary)] transition-colors shadow-sm hover:shadow-md"
            >
              <Span layout="flex-center" 
                className="flex-shrink-0 w-7 h-7" rounded="md"
                // audit-inline-style-ok: runtime brand gradient
                style={{ background: BRAND_GRAD }}
              >
                <Icon className="w-3.5 h-3.5 text-white" />
              </Span>
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
                className="text-xs text-[var(--appkit-color-primary)] hover:underline"
              >
                View all →
              </Link>
            </Row>
            <OrdersList orders={orders} isLoading={ordersLoading} emptyLabel="No orders yet" />
          </>
        ) : null
      }
    />
  );
}
