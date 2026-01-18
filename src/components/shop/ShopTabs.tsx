/**
 * ShopTabs Component Wrapper
 *
 * @status IMPLEMENTED
 * @epic E021 - System Configuration
 *
 * Reusable tab navigation for shop pages with mobile responsive horizontal scroll.
 */

import {
  ShopTabs as LibraryShopTabs,
  ShopTab,
  ShopTabType,
} from "@letitrip/react-library";
import { Gavel, MessageCircle, Package, Star, Store } from "lucide-react";

export type { ShopTabType };

const DEFAULT_TABS: ShopTab[] = [
  {
    id: "products",
    label: "Products",
    icon: <Package className="w-4 h-4" />,
  },
  {
    id: "auctions",
    label: "Auctions",
    icon: <Gavel className="w-4 h-4" />,
  },
  {
    id: "about",
    label: "About",
    icon: <Store className="w-4 h-4" />,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: <Star className="w-4 h-4" />,
  },
  {
    id: "contact",
    label: "Contact",
    icon: <MessageCircle className="w-4 h-4" />,
  },
];

interface ShopTabsProps {
  activeTab: ShopTabType;
  onTabChange: (tab: ShopTabType) => void;
  tabs?: ShopTab[];
  reviewCount?: number;
  productCount?: number;
  auctionCount?: number;
  className?: string;
}

export function ShopTabs({ tabs = DEFAULT_TABS, ...props }: ShopTabsProps) {
  return <LibraryShopTabs tabs={tabs} {...props} />;
}
