"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Gift,
  ShoppingCart,
  User,
  ChevronDown,
  Menu,
  Search,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
} from "lucide-react";
import {
  COMPANY_NAME,
  USER_MENU_ITEMS,
  ADMIN_MENU_ITEMS,
  SELLER_MENU_ITEMS,
} from "@/constants/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function MainNavBar({
  onMobileMenuToggle,
  onSearchClick,
}: {
  onMobileMenuToggle: () => void;
  onSearchClick: () => void;
}) {
  const { user, isAuthenticated, loading, isAdmin, isAdminOrSeller } =
    useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isSellerMenuOpen, setIsSellerMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const sellerMenuRef = useRef<HTMLDivElement>(null);

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
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

  // Get profile picture URL
  const getProfilePicture = () => {
    return user?.profile?.avatar || null;
  };

  return (
    <nav id="main-navigation" className="bg-gray-800 text-white py-3 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 hover:bg-gray-700 rounded"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
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
          {/* Available Coupons */}
          <Link
            href="/coupons"
            className="hidden sm:flex items-center gap-1 text-sm hover:bg-gray-700 px-3 py-2 rounded"
          >
            <Gift className="w-5 h-5" />
            <span className="text-yellow-400 font-bold">Coupons</span>
          </Link>

          {/* Admin Menu - Only show if user is admin */}
          {isAuthenticated && isAdmin && (
            <div className="relative hidden lg:block" ref={adminMenuRef}>
              <button
                onClick={() => {
                  setIsAdminMenuOpen(!isAdminMenuOpen);
                  setIsSellerMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1 text-sm hover:bg-gray-700 px-3 py-2 rounded"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Admin</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Admin Dropdown */}
              {isAdminMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 border z-50">
                  {ADMIN_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      {item.id === "dashboard" && (
                        <LayoutDashboard className="w-4 h-4" />
                      )}
                      {item.id === "users" && <Users className="w-4 h-4" />}
                      {item.id === "products" && (
                        <Package className="w-4 h-4" />
                      )}
                      <span>{item.name}</span>
                    </Link>
                  ))}
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
                className="flex items-center gap-1 text-sm hover:bg-gray-700 px-3 py-2 rounded"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Seller</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Seller Dropdown */}
              {isSellerMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 border z-50">
                  {SELLER_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsSellerMenuOpen(false)}
                    >
                      {item.id === "dashboard" && (
                        <LayoutDashboard className="w-4 h-4" />
                      )}
                      {item.id === "products" && (
                        <Package className="w-4 h-4" />
                      )}
                      {item.id === "orders" && (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Icon */}
          <button
            onClick={onSearchClick}
            className="hover:bg-gray-700 p-2 rounded"
            aria-label="Search"
          >
            <Search className="w-6 h-6" />
          </button>

          {/* Cart - Hidden on mobile/tablet when bottom nav is visible */}
          <Link
            href="/cart"
            className="hidden lg:flex relative hover:bg-gray-700 p-2 rounded"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-extrabold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu or Sign In */}
          <div className="relative" ref={userMenuRef}>
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
                >
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center overflow-hidden">
                    {getProfilePicture() ? (
                      <img
                        src={getProfilePicture()!}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-900 font-bold text-sm">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                  <ChevronDown className="w-4 h-4 hidden sm:inline" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg py-2 border z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {USER_MENU_ITEMS.map((item) => (
                      <Link
                        key={item.id}
                        href={item.link}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span>{item.name}</span>
                      </Link>
                    ))}
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
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-2 border z-50">
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
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
