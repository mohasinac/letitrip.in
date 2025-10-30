"use client";

import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Dashboard,
  ShoppingCart,
  Inventory,
  LocalShipping,
  DiscountOutlined,
  CampaignOutlined,
  NotificationsOutlined,
  AnalyticsOutlined,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModernTheme } from "@/contexts/ModernThemeContext";
import { SELLER_ROUTES } from "@/constants/routes";

interface SellerSidebarProps {
  open?: boolean;
  onToggle?: (open: boolean) => void;
  unreadAlerts?: number;
}

const sellerMenuItems = [
  {
    label: "Dashboard",
    icon: Dashboard,
    href: SELLER_ROUTES.DASHBOARD,
  },
  {
    label: "Shop Setup",
    icon: Store,
    href: SELLER_ROUTES.SHOP_SETUP,
  },
  {
    label: "Products",
    icon: ShoppingCart,
    href: SELLER_ROUTES.PRODUCTS,
  },
  {
    label: "Orders",
    icon: Inventory,
    href: SELLER_ROUTES.ORDERS,
  },
  {
    label: "Coupons",
    icon: DiscountOutlined,
    href: SELLER_ROUTES.COUPONS,
  },
  {
    label: "Sales",
    icon: CampaignOutlined,
    href: SELLER_ROUTES.SALES,
  },
  {
    label: "Shipments",
    icon: LocalShipping,
    href: SELLER_ROUTES.SHIPMENTS,
  },
  {
    label: "Alerts",
    icon: NotificationsOutlined,
    href: SELLER_ROUTES.ALERTS,
    badge: true,
  },
  {
    label: "Analytics",
    icon: AnalyticsOutlined,
    href: SELLER_ROUTES.ANALYTICS,
  },
  {
    label: "Settings",
    icon: Settings,
    href: SELLER_ROUTES.SETTINGS,
  },
];

export default function SellerSidebar({
  open = true,
  onToggle,
  unreadAlerts = 0,
}: SellerSidebarProps) {
  const { isDark } = useModernTheme();
  const pathname = usePathname() || "";
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? 80 : 250;

  const isItemActive = (href: string) => {
    if (href === SELLER_ROUTES.DASHBOARD) {
      return pathname === SELLER_ROUTES.DASHBOARD;
    }
    return pathname.startsWith(href);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? sidebarWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: sidebarWidth,
          boxSizing: "border-box",
          backgroundColor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          overflowX: "hidden",
          transition: "width 0.3s ease-in-out",
          top: "auto",
          position: "relative",
        },
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 64,
        }}
      >
        {!isCollapsed && (
          <Typography variant="subtitle1" fontWeight={700} color="primary">
            Seller Panel
          </Typography>
        )}
        <Tooltip title={isCollapsed ? "Expand" : "Collapse"}>
          <IconButton size="small" onClick={handleToggleCollapse}>
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ flex: 1, py: 2 }}>
        {sellerMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          const showBadge = item.badge && unreadAlerts > 0;

          return (
            <React.Fragment key={item.href}>
              <Tooltip title={isCollapsed ? item.label : ""} placement="right">
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={isActive}
                    sx={{
                      px: 2,
                      py: 1.5,
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": {
                          backgroundColor: "primary.main",
                        },
                        "& .MuiListItemIcon-root": {
                          color: "primary.contrastText",
                        },
                      },
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: isCollapsed ? "auto" : 40,
                        justifyContent: "center",
                        color: isActive ? "primary.contrastText" : "inherit",
                      }}
                    >
                      {showBadge ? (
                        <Badge badgeContent={unreadAlerts} color="error">
                          <Icon />
                        </Badge>
                      ) : (
                        <Icon />
                      )}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: "0.95rem",
                          fontWeight: isActive ? 600 : 500,
                        }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
              {/* Add dividers for visual grouping */}
              {(index === 1 || index === 6) && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          );
        })}
      </List>

      {/* Sidebar Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: "divider",
          textAlign: isCollapsed ? "center" : "left",
        }}
      >
        {!isCollapsed && (
          <Typography variant="caption" color="text.secondary">
            Seller v1.0.0
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}
