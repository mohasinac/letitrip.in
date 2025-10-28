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
} from "@mui/material";
import {
  Dashboard,
  ShoppingCart,
  People,
  Settings,
  AnalyticsOutlined,
  Inventory,
  Support,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModernTheme } from "@/contexts/ModernThemeContext";

interface AdminSidebarProps {
  open?: boolean;
  onToggle?: (open: boolean) => void;
}

const adminMenuItems = [
  {
    label: "Dashboard",
    icon: Dashboard,
    href: "/admin",
  },
  {
    label: "Products",
    icon: ShoppingCart,
    href: "/admin/products",
  },
  {
    label: "Orders",
    icon: Inventory,
    href: "/admin/orders",
  },
  {
    label: "Users",
    icon: People,
    href: "/admin/users",
  },
  {
    label: "Analytics",
    icon: AnalyticsOutlined,
    href: "/admin/analytics",
  },
  {
    label: "Support",
    icon: Support,
    href: "/admin/support",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export default function AdminSidebar({
  open = true,
  onToggle,
}: AdminSidebarProps) {
  const { isDark } = useModernTheme();
  const pathname = usePathname() || "";
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    onToggle?.(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? 80 : 250;

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
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
          backgroundColor: isDark ? "#0a0a0a" : "#f8fafc",
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
            Admin
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
        {adminMenuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);

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
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(0, 0, 0, 0.04)",
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
                      <Icon />
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
              {index === 2 && <Divider sx={{ my: 1 }} />}
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
            v1.0.0
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}
