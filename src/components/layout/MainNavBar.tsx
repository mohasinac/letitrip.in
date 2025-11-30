"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  Search,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ShoppingBag,
  Database,
  Bell,
  Wallet,
} from "lucide-react";
import {
  COMPANY_NAME,
  USER_MENU_ITEMS,
  ADMIN_MENU_ITEMS,
  SELLER_MENU_ITEMS,
} from "@/constants/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useHeaderStats } from "@/hooks/useHeaderStats";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default function MainNavBar({
  onMobileMenuToggle,
  onSearchClick,
}: {
  onMobileMenuToggle: () => void;
  onSearchClick: () => void;
}) {
  const { user, isAuthenticated, isAdmin, isAdminOrSeller } = useAuth();
  const { cart } = useCart();
  const {
    cartCount: apiCartCount,
    notificationCount,
    messagesCount,
    ripLimitBalance,
    hasUnpaidAuctions,
    totalNotifications,
  } = useHeaderStats();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isSellerMenuOpen, setIsSellerMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const sellerMenuRef = useRef<HTMLDivElement>(null);

  // Use cart count from hook (local state) or API as fallback
  const cartCount = cart?.itemCount ?? apiCartCount;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target as Node)
      ) {
        setIsAdminMenuOpen(false);
      }
      if (
        sellerMenuRef.current &&
        !sellerMenuRef.current.contains(event.target as Node)
      ) {
        setIsSellerMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user initials or first letter of name
  const getUserInitials = () => {
    if (!user) return "U";

    // Try displayName first, then fullName, then email
    const name = user.displayName || user.fullName || user.email;
    if (!name) return "U";

    const names = name.split(" ").filter((n) => n.length > 0);
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Get profile picture URL
  const getProfilePicture = () => {
    return user?.photoURL || null;
  };

  // Get display name
  const getDisplayName = () => {
    if (!user) return "Guest";
    return (
      user.displayName ||
      user.fullName ||
      user.firstName ||
      user.email?.split("@")[0] ||
      "User"
    );
  };

  return (
    <nav id="main-navigation" className="bg-gray-800 text-white py-3 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-700 rounded focus-visible-ring touch-target"
          aria-label="Toggle navigation menu"
          aria-expanded="false"
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-white rounded px-3 py-1">
            <span className="text-gray-800 font-bold text-xl">
              {COMPANY_NAME}
            </span>
          </div>
        </Link>

        {/* Spacer to push right actions to the end */}
        <div className="flex-1"></div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Admin Menu - Only show if user is admin */}
          {isAuthenticated && isAdmin && (
            <div className="relative hidden lg:block" ref={adminMenuRef}>
              <button
                onClick={() => {
                  setIsAdminMenuOpen(!isAdminMenuOpen);
                  setIsSellerMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1 text-sm hover:bg-gray-700 px-3 py-2 rounded focus-visible-ring"
                aria-expanded={isAdminMenuOpen}
                aria-haspopup="true"
                aria-label="Admin menu"
              >
                <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
                <span>Admin</span>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Admin Dropdown */}
              {isAdminMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-y-auto">
                  {ADMIN_MENU_ITEMS.map((item) =>
                    item.link ? (
                      <Link
                        key={item.id}
                        href={item.link}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        {item.id === "dashboard" && (
                          <LayoutDashboard className="w-4 h-4" />
                        )}
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <div
                        key={item.id}
                        className="border-t border-gray-200 dark:border-gray-700 first:border-t-0 pt-2 mt-2 first:pt-0 first:mt-0"
                      >
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          {item.name}
                        </div>
                        {item.children?.map((child) => (
                          <Link
                            key={child.id}
                            href={child.link}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                            onClick={() => setIsAdminMenuOpen(false)}
                          >
                            <span className="ml-2">{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* Seller Menu - Show if user is admin or seller */}
          {isAuthenticated && isAdminOrSeller && (
            <div className="relative hidden lg:block" ref={sellerMenuRef}>
              <button
                onClick={() => {
                  setIsSellerMenuOpen(!isSellerMenuOpen);
                  setIsAdminMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1 text-sm hover:bg-gray-700 px-3 py-2 rounded focus-visible-ring"
                aria-expanded={isSellerMenuOpen}
                aria-haspopup="true"
                aria-label="Seller menu"
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                <span>Seller</span>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Seller Dropdown */}
              {isSellerMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-y-auto">
                  {SELLER_MENU_ITEMS.map((item) =>
                    item.link ? (
                      <Link
                        key={item.id}
                        href={item.link}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsSellerMenuOpen(false)}
                      >
                        {item.id === "overview" && (
                          <LayoutDashboard className="w-4 h-4" />
                        )}
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <div
                        key={item.id}
                        className="border-t border-gray-200 dark:border-gray-700 first:border-t-0 pt-2 mt-2 first:pt-0 first:mt-0"
                      >
                        <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          {item.name}
                        </div>
                        {item.children?.map((child) => (
                          <Link
                            key={child.id}
                            href={child.link}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                            onClick={() => setIsSellerMenuOpen(false)}
                          >
                            <span className="ml-2">{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* Demo Link - Only for Admin Users */}
          {isAuthenticated && isAdmin && (
            <Link
              href="/admin/demo"
              className="hidden lg:flex items-center gap-2 text-sm hover:bg-gray-700 px-3 py-2 rounded"
              title="Demo Data & Workflows"
            >
              <Database className="w-5 h-5" />
              <span>DEMO</span>
            </Link>
          )}

          {/* Search Icon */}
          <button
            onClick={onSearchClick}
            className="hover:bg-gray-700 p-2 rounded focus-visible-ring touch-target"
            aria-label="Search products"
          >
            <Search className="w-6 h-6" aria-hidden="true" />
          </button>

          {/* Theme Toggle - Visible on all screen sizes */}
          <ThemeToggle size="sm" />

          {/* Notifications - Mobile/Tablet version */}
          {isAuthenticated && (
            <Link
              href="/user/notifications"
              className="lg:hidden relative hover:bg-gray-700 p-2 rounded"
              aria-label={`Notifications${
                totalNotifications > 0 ? ` (${totalNotifications} unread)` : ""
              }`}
            >
              <Bell className="w-6 h-6" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-extrabold">
                  {totalNotifications > 99 ? "99+" : totalNotifications}
                </span>
              )}
            </Link>
          )}

          {/* RipLimit Balance - For authenticated users */}
          {isAuthenticated && ripLimitBalance !== null && (
            <Link
              href="/user/riplimit"
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                hasUnpaidAuctions
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
              title={
                hasUnpaidAuctions
                  ? "You have unpaid auctions"
                  : "RipLimit Balance"
              }
            >
              <Wallet className="w-4 h-4" />
              <span>{ripLimitBalance.toLocaleString("en-IN")} RL</span>
            </Link>
          )}

          {/* Notifications - Desktop version */}
          {isAuthenticated && (
            <Link
              href="/user/notifications"
              className="hidden lg:flex relative hover:bg-gray-700 p-2 rounded"
              aria-label={`Notifications${
                totalNotifications > 0 ? ` (${totalNotifications} unread)` : ""
              }`}
            >
              <Bell className="w-6 h-6" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-extrabold">
                  {totalNotifications > 99 ? "99+" : totalNotifications}
                </span>
              )}
            </Link>
          )}

          {/* Cart - Hidden on mobile/tablet when bottom nav is visible */}
          <div className="hidden lg:block relative group">
            <Link
              href="/cart"
              className="flex relative hover:bg-gray-700 p-2 rounded"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-extrabold">
                  <span className="animate-pulse">{cartCount}</span>
                </span>
              )}
            </Link>

            {/* Cart Hover Tooltip */}
            {cartCount > 0 && cart && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Cart Summary</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {cartCount} items
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Subtotal:
                      </span>
                      <span className="font-bold text-lg">
                        {cart.formattedSubtotal}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/cart"
                    className="mt-3 block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu or Sign In */}
          {/* Hidden on mobile for authenticated users (use bottom nav Account instead) */}
          <div
            className={`relative ${isAuthenticated ? "hidden lg:block" : ""}`}
            ref={userMenuRef}
          >
            {isAuthenticated && user ? (
              // Logged in - Show user profile with dropdown
              <>
                <button
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen);
                    setIsAdminMenuOpen(false);
                    setIsSellerMenuOpen(false);
                  }}
                  className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center overflow-hidden">
                    {getProfilePicture() ? (
                      <Image
                        src={getProfilePicture()!}
                        alt={getDisplayName()}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-900 font-bold text-sm">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm max-w-[120px] truncate">
                    {getDisplayName()}
                  </span>
                  <ChevronDown className="w-4 h-4 hidden sm:inline" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p
                        className="font-semibold text-sm truncate text-gray-900 dark:text-white"
                        title={getDisplayName()}
                      >
                        {getDisplayName()}
                      </p>
                      <p
                        className="text-xs text-gray-500 dark:text-gray-400 truncate"
                        title={user.email || ""}
                      >
                        {user.email || "No email"}
                      </p>
                      {user.role && (
                        <p className="text-xs text-yellow-600 font-medium mt-1 capitalize">
                          {user.role}
                        </p>
                      )}
                    </div>
                    {USER_MENU_ITEMS.map((item) =>
                      "link" in item && item.link ? (
                        <Link
                          key={item.id}
                          href={item.link}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span>{item.name}</span>
                        </Link>
                      ) : (
                        <div
                          key={item.id}
                          className="border-t border-gray-200 dark:border-gray-700 first:border-t-0 pt-2 mt-2 first:pt-0 first:mt-0"
                        >
                          <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                            {item.name}
                          </div>
                          {"children" in item &&
                            item.children?.map((child) => (
                              <Link
                                key={child.id}
                                href={child.link}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <span className="ml-2">{child.name}</span>
                              </Link>
                            ))}
                        </div>
                      )
                    )}
                  </div>
                )}
              </>
            ) : (
              // Not logged in - Show Sign In button with dropdown caret
              <>
                <div className="flex items-center gap-1">
                  {/* Sign In Button - Clickable, navigates to login */}
                  <Link
                    href="/login"
                    className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded"
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="hidden sm:inline text-sm">Sign In</span>
                  </Link>

                  {/* Dropdown Caret - Shows menu */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsAdminMenuOpen(false);
                      setIsSellerMenuOpen(false);
                    }}
                    className="hover:bg-gray-700 p-2 rounded"
                    aria-label="User menu"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Sign In/Register Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 z-50">
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
