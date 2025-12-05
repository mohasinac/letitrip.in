/**
 * @fileoverview Configuration
 * @module src/app/admin/demo/components/config
 * @description This file contains functionality related to config
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

import {
  Tag,
  Users,
  Store,
  Package,
  Gavel,
  DollarSign,
  Star,
  ShoppingCart,
  Settings,
  CreditCard,
  Truck,
  RotateCcw,
  Ticket,
  Wallet,
  MapPin,
  Image,
  FileText,
  Heart,
  MessageSquare,
  Bell,
} from "lucide-react";
import { DemoStep } from "@/services/demo-data.service";
import { DemoStepConfig } from "./types";

// Step configuration for generation
/**
 * Generation Steps
 * @constant
 */
export const GENERATION_STEPS: DemoStepConfig[] = [
  {
    /** Id */
    id: "categories",
    /** Label */
    label: "Categories",
    /** Icon */
    icon: Tag,
    /** Description */
    description: "Create category tree",
  },
  {
    /** Id */
    id: "users",
    /** Label */
    label: "Users",
    /** Icon */
    icon: Users,
    /** Description */
    description: "Create users with roles (scale × 10)",
  },
  {
    /** Id */
    id: "shops",
    /** Label */
    label: "Shops",
    /** Icon */
    icon: Store,
    /** Description */
    description: "Create shops (scale ÷ 2)",
  },
  {
    /** Id */
    id: "products",
    /** Label */
    label: "Products",
    /** Icon */
    icon: Package,
    /** Description */
    description: "Create products (scale × 100)",
  },
  {
    /** Id */
    id: "auctions",
    /** Label */
    label: "Auctions",
    /** Icon */
    icon: Gavel,
    /** Description */
    description: "Create auctions (scale × 25)",
  },
  {
    /** Id */
    id: "bids",
    /** Label */
    label: "Bids",
    /** Icon */
    icon: DollarSign,
    /** Description */
    description: "Create bids (scale × 250+)",
  },
  {
    /** Id */
    id: "reviews",
    /** Label */
    label: "Reviews",
    /** Icon */
    icon: Star,
    /** Description */
    description: "Create reviews (scale × 150+)",
  },
  {
    /** Id */
    id: "orders",
    /** Label */
    label: "Orders",
    /** Icon */
    icon: ShoppingCart,
    /** Description */
    description: "Create orders & payments",
  },
  {
    /** Id */
    id: "extras",
    /** Label */
    label: "Extras",
    /** Icon */
    icon: Settings,
    /** Description */
    description: "Hero slides, carts, etc.",
  },
  {
    /** Id */
    id: "settings",
    /** Label */
    label: "Settings",
    /** Icon */
    icon: Settings,
    /** Description */
    description: "Admin content settings",
  },
];

// Cleanup steps configuration (reverse order for dependencies)
/**
 * Cleanup Step Config
 * @constant
 */
export const CLEANUP_STEP_CONFIG: DemoStepConfig[] = [
  {
    /** Id */
    id: "settings",
    /** Label */
    label: "Settings",
    /** Icon */
    icon: Settings,
    /** Description */
    description: "Admin content settings",
  },
  {
    /** Id */
    id: "extras",
    /** Label */
    label: "Extras",
    /** Icon */
    icon: Settings,
    /** Description */
    description: "Hero slides, carts, notifications",
  },
  {
    /** Id */
    id: "orders",
    /** Label */
    label: "Orders",
    /** Icon */
    icon: ShoppingCart,
    /** Description */
    description: "Orders, payments, shipments",
  },
  {
    /** Id */
    id: "reviews",
    /** Label */
    label: "Reviews",
    /** Icon */
    icon: Star,
    /** Description */
    description: "Product reviews",
  },
  {
    /** Id */
    id: "bids",
    /** Label */
    label: "Bids",
    /** Icon */
    icon: DollarSign,
    /** Description */
    description: "Auction bids",
  },
  {
    /** Id */
    id: "auctions",
    /** Label */
    label: "Auctions",
    /** Icon */
    icon: Gavel,
    /** Description */
    description: "Auctions",
  },
  {
    /** Id */
    id: "products",
    /** Label */
    label: "Products",
    /** Icon */
    icon: Package,
    /** Description */
    description: "Products",
  },
  { id: "shops", label: "Shops", icon: Store, description: "Shops" },
  { id: "users", label: "Users", icon: Users, description: "Users" },
  {
    /** Id */
    id: "categories",
    /** Label */
    label: "Categories",
    /** Icon */
    icon: Tag,
    /** Description */
    description: "Categories",
  },
];

// Collection icon and color mapping
/**
 * Collection Config
 * @constant
 */
export const COLLECTION_CONFIG: Record<
  string,
  {
    /** Icon */
    icon: React.ComponentType<{ className?: string }>;
    /** Color */
    color: string;
    /** Label */
    label: string;
  }
> = {
  /** Categories */
  categories: { icon: Tag, color: "text-purple-600", label: "Categories" },
  /** Users */
  users: { icon: Users, color: "text-green-600", label: "Users" },
  /** Shops */
  shops: { icon: Store, color: "text-blue-600", label: "Shops" },
  /** Products */
  products: { icon: Package, color: "text-orange-600", label: "Products" },
  /** Auctions */
  auctions: { icon: Gavel, color: "text-red-600", label: "Auctions" },
  /** Bids */
  bids: { icon: DollarSign, color: "text-yellow-600", label: "Bids" },
  /** Orders */
  orders: { icon: ShoppingCart, color: "text-indigo-600", label: "Orders" },
  order_items: {
    /** Icon */
    icon: Package,
    /** Color */
    color: "text-indigo-400",
    /** Label */
    label: "Order Items",
  },
  /** Payments */
  payments: {
    /** Icon */
    icon: CreditCard,
    /** Color */
    color: "text-emerald-600",
    /** Label */
    label: "Payments",
  },
  /** Shipments */
  shipments: { icon: Truck, color: "text-cyan-600", label: "Shipments" },
  /** Reviews */
  reviews: { icon: Star, color: "text-amber-600", label: "Reviews" },
  /** Coupons */
  coupons: { icon: Tag, color: "text-pink-600", label: "Coupons" },
  /** Returns */
  returns: { icon: RotateCcw, color: "text-rose-600", label: "Returns" },
  /** Tickets */
  tickets: { icon: Ticket, color: "text-violet-600", label: "Tickets" },
  /** Payouts */
  payouts: { icon: Wallet, color: "text-lime-600", label: "Payouts" },
  /** Addresses */
  addresses: { icon: MapPin, color: "text-teal-600", label: "Addresses" },
  hero_slides: { icon: Image, color: "text-sky-600", label: "Hero Slides" },
  /** Media */
  media: { icon: Image, color: "text-fuchsia-600", label: "Media" },
  blog_posts: {
    /** Icon */
    icon: FileText,
    /** Color */
    color: "text-slate-600",
    /** Label */
    label: "Blog Posts",
  },
  /** Favorites */
  favorites: { icon: Heart, color: "text-red-500", label: "Favorites" },
  /** Carts */
  carts: { icon: ShoppingCart, color: "text-orange-500", label: "Carts" },
  /** Conversations */
  conversations: {
    /** Icon */
    icon: MessageSquare,
    /** Color */
    color: "text-blue-500",
    /** Label */
    label: "Conversations",
  },
  /** Messages */
  messages: {
    /** Icon */
    icon: MessageSquare,
    /** Color */
    color: "text-blue-400",
    /** Label */
    label: "Messages",
  },
  /** Settings */
  settings: { icon: Settings, color: "text-gray-600", label: "Settings" },
  feature_flags: {
    /** Icon */
    icon: Settings,
    /** Color */
    color: "text-gray-500",
    /** Label */
    label: "Feature Flags",
  },
  /** Notifications */
  notifications: {
    /** Icon */
    icon: Bell,
    /** Color */
    color: "text-yellow-500",
    /** Label */
    label: "Notifications",
  },
};

// Initial step statuses
/**
 * Retrieves initial step statuses
 *
 * @returns {any} The initialstepstatuses result
 *
 * @example
 * getInitialStepStatuses();
 */

/**
 * Retrieves initial step statuses
 *
 * @returns {any} The initialstepstatuses result
 *
 * @example
 * getInitialStepStatuses();
 */

export const getInitialStepStatuses = (): Record<
  DemoStep,
  { status: "pending" }
> => ({
  /** Categories */
  categories: { status: "pending" },
  /** Users */
  users: { status: "pending" },
  /** Shops */
  shops: { status: "pending" },
  /** Products */
  products: { status: "pending" },
  /** Auctions */
  auctions: { status: "pending" },
  /** Bids */
  bids: { status: "pending" },
  /** Reviews */
  reviews: { status: "pending" },
  /** Orders */
  orders: { status: "pending" },
  /** Extras */
  extras: { status: "pending" },
  /** Settings */
  settings: { status: "pending" },
});

// Initial empty summary
/**
 * Retrieves empty summary
 *
 * @returns {any} The emptysummary result
 *
 * @example
 * getEmptySummary();
 */

/**
 * Retrieves empty summary
 *
 * @returns {any} The emptysummary result
 *
 * @example
 * getEmptySummary();
 */

export const getEmptySummary = () => ({
  /** Categories */
  categories: 0,
  /** Users */
  users: 0,
  /** Shops */
  shops: 0,
  /** Products */
  products: 0,
  /** Auctions */
  auctions: 0,
  /** Bids */
  bids: 0,
  /** Orders */
  orders: 0,
  /** Payments */
  payments: 0,
  /** Shipments */
  shipments: 0,
  /** Reviews */
  reviews: 0,
  /** Prefix */
  prefix: "DEMO_",
  /** Created At */
  createdAt: new Date().toISOString(),
});

/**
 * Demo Prefix
 * @constant
 */
export const DEMO_PREFIX = "DEMO_";
