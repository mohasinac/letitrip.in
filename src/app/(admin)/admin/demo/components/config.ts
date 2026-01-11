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
export const GENERATION_STEPS: DemoStepConfig[] = [
  {
    id: "categories",
    label: "Categories",
    icon: Tag,
    description: "Create category tree",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "Create users with roles (scale × 10)",
  },
  {
    id: "shops",
    label: "Shops",
    icon: Store,
    description: "Create shops (scale ÷ 2)",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    description: "Create products (scale × 100)",
  },
  {
    id: "auctions",
    label: "Auctions",
    icon: Gavel,
    description: "Create auctions (scale × 25)",
  },
  {
    id: "bids",
    label: "Bids",
    icon: DollarSign,
    description: "Create bids (scale × 250+)",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    description: "Create reviews (scale × 150+)",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    description: "Create orders & payments",
  },
  {
    id: "extras",
    label: "Extras",
    icon: Settings,
    description: "Hero slides, carts, etc.",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Admin content settings",
  },
];

// Cleanup steps configuration (reverse order for dependencies)
export const CLEANUP_STEP_CONFIG: DemoStepConfig[] = [
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Admin content settings",
  },
  {
    id: "extras",
    label: "Extras",
    icon: Settings,
    description: "Hero slides, carts, notifications",
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    description: "Orders, payments, shipments",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    description: "Product reviews",
  },
  {
    id: "bids",
    label: "Bids",
    icon: DollarSign,
    description: "Auction bids",
  },
  {
    id: "auctions",
    label: "Auctions",
    icon: Gavel,
    description: "Auctions",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    description: "Products",
  },
  { id: "shops", label: "Shops", icon: Store, description: "Shops" },
  { id: "users", label: "Users", icon: Users, description: "Users" },
  {
    id: "categories",
    label: "Categories",
    icon: Tag,
    description: "Categories",
  },
];

// Collection icon and color mapping
export const COLLECTION_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
  }
> = {
  categories: { icon: Tag, color: "text-purple-600", label: "Categories" },
  users: { icon: Users, color: "text-green-600", label: "Users" },
  shops: { icon: Store, color: "text-blue-600", label: "Shops" },
  products: { icon: Package, color: "text-orange-600", label: "Products" },
  auctions: { icon: Gavel, color: "text-red-600", label: "Auctions" },
  bids: { icon: DollarSign, color: "text-yellow-600", label: "Bids" },
  orders: { icon: ShoppingCart, color: "text-indigo-600", label: "Orders" },
  order_items: {
    icon: Package,
    color: "text-indigo-400",
    label: "Order Items",
  },
  payments: {
    icon: CreditCard,
    color: "text-emerald-600",
    label: "Payments",
  },
  shipments: { icon: Truck, color: "text-cyan-600", label: "Shipments" },
  reviews: { icon: Star, color: "text-amber-600", label: "Reviews" },
  coupons: { icon: Tag, color: "text-pink-600", label: "Coupons" },
  returns: { icon: RotateCcw, color: "text-rose-600", label: "Returns" },
  tickets: { icon: Ticket, color: "text-violet-600", label: "Tickets" },
  payouts: { icon: Wallet, color: "text-lime-600", label: "Payouts" },
  addresses: { icon: MapPin, color: "text-teal-600", label: "Addresses" },
  hero_slides: { icon: Image, color: "text-sky-600", label: "Hero Slides" },
  media: { icon: Image, color: "text-fuchsia-600", label: "Media" },
  blog_posts: {
    icon: FileText,
    color: "text-slate-600",
    label: "Blog Posts",
  },
  favorites: { icon: Heart, color: "text-red-500", label: "Favorites" },
  carts: { icon: ShoppingCart, color: "text-orange-500", label: "Carts" },
  conversations: {
    icon: MessageSquare,
    color: "text-blue-500",
    label: "Conversations",
  },
  messages: {
    icon: MessageSquare,
    color: "text-blue-400",
    label: "Messages",
  },
  settings: { icon: Settings, color: "text-gray-600", label: "Settings" },
  feature_flags: {
    icon: Settings,
    color: "text-gray-500",
    label: "Feature Flags",
  },
  notifications: {
    icon: Bell,
    color: "text-yellow-500",
    label: "Notifications",
  },
};

// Initial step statuses
export const getInitialStepStatuses = (): Record<
  DemoStep,
  { status: "pending" }
> => ({
  categories: { status: "pending" },
  users: { status: "pending" },
  shops: { status: "pending" },
  products: { status: "pending" },
  auctions: { status: "pending" },
  bids: { status: "pending" },
  reviews: { status: "pending" },
  orders: { status: "pending" },
  extras: { status: "pending" },
  settings: { status: "pending" },
});

// Initial empty summary
export const getEmptySummary = () => ({
  categories: 0,
  users: 0,
  shops: 0,
  products: 0,
  auctions: 0,
  bids: 0,
  orders: 0,
  payments: 0,
  shipments: 0,
  reviews: 0,
  prefix: "DEMO_",
  createdAt: new Date().toISOString(),
});

export const DEMO_PREFIX = "DEMO_";
