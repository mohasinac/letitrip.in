"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Menu,
  ShoppingCart,
  Search,
  Person,
  LightMode,
  DarkMode,
  Login,
  Logout,
  AccountCircle,
} from "@mui/icons-material";
import { useModernTheme } from "@/contexts/ModernThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Link from "next/link";
import ClientOnly from "@/components/shared/ClientOnly";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useIsAdminRoute } from "@/hooks/useIsAdminRoute";

interface ModernLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Categories", href: "/categories" },
  { name: "Game", href: "/game" },
  { name: "Contact", href: "/contact" },
];

export default function ModernLayout({ children }: ModernLayoutProps) {
  const { mode, toggleTheme } = useModernTheme();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [adminSidebarOpen, setAdminSidebarOpen] = useState(true);
  const isAdminRoute = useIsAdminRoute();

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleProfileMenuClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {navigation.map((item) => (
          <ListItem key={item.name} component="a" href={item.href}>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {/* Mobile Auth Links */}
        {user ? (
          <>
            <ListItem component={Link} href="/profile">
              <ListItemText primary="Profile" />
            </ListItem>
            {user.role === "admin" && (
              <ListItem component={Link} href="/admin">
                <ListItemText primary="Admin Panel" />
              </ListItem>
            )}
            <ListItem
              component="button"
              onClick={handleLogout}
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.hover" },
              }}
            >
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem component={Link} href="/login">
              <ListItemText primary="Sign In" />
            </ListItem>
            <ListItem component={Link} href="/register">
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: isAdminRoute ? "row" : "column",
      }}
    >
      {/* Admin Sidebar - Only show on admin routes */}
      {isAdminRoute && (
        <AdminSidebar open={adminSidebarOpen} onToggle={setAdminSidebarOpen} />
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          width: "100%",
        }}
      >
        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: "background.default",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
              {/* Mobile menu button - only show on mobile */}
              <Box
                sx={{
                  display: { xs: "flex", md: "none" },
                  width: 48,
                  justifyContent: "flex-start",
                }}
              >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: "text.primary" }}
                >
                  <Menu />
                </IconButton>
              </Box>

              {/* Logo */}
              <Typography
                variant="h6"
                component="a"
                href="/"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  textDecoration: "none",
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                  flexGrow: { xs: 1, md: 0 },
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                JustForView
              </Typography>

              {/* Desktop Navigation */}
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
                {navigation.map((item) => (
                  <Button
                    key={item.name}
                    href={item.href}
                    sx={{
                      color: "text.primary",
                      fontWeight: 500,
                      textTransform: "none",
                      fontSize: "0.95rem",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
              </Box>

              {/* Right side icons */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton sx={{ color: "text.primary" }}>
                  <Search />
                </IconButton>
                <IconButton sx={{ color: "text.primary" }}>
                  <ShoppingCart />
                </IconButton>

                {/* Authentication Section */}
                <ClientOnly>
                  {user ? (
                    <>
                      <IconButton
                        onClick={handleProfileMenuOpen}
                        sx={{ color: "text.primary" }}
                        aria-label="account menu"
                      >
                        {user.name ? (
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "0.875rem",
                              bgcolor: "primary.main",
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                        ) : (
                          <AccountCircle />
                        )}
                      </IconButton>
                      <MuiMenu
                        anchorEl={profileMenuAnchor}
                        open={Boolean(profileMenuAnchor)}
                        onClose={handleProfileMenuClose}
                        onClick={handleProfileMenuClose}
                        PaperProps={{
                          elevation: 0,
                          sx: {
                            overflow: "visible",
                            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                            mt: 1.5,
                            "& .MuiAvatar-root": {
                              width: 32,
                              height: 32,
                              ml: -0.5,
                              mr: 1,
                            },
                            "&:before": {
                              content: '""',
                              display: "block",
                              position: "absolute",
                              top: 0,
                              right: 14,
                              width: 10,
                              height: 10,
                              bgcolor: "background.paper",
                              transform: "translateY(-50%) rotate(45deg)",
                              zIndex: 0,
                            },
                          },
                        }}
                        transformOrigin={{
                          horizontal: "right",
                          vertical: "top",
                        }}
                        anchorOrigin={{
                          horizontal: "right",
                          vertical: "bottom",
                        }}
                      >
                        <MenuItem component={Link} href="/profile">
                          <Avatar sx={{ mr: 2 }}>
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </Avatar>
                          Profile
                        </MenuItem>
                        {user.role === "admin" && (
                          <MenuItem component={Link} href="/admin">
                            <AccountCircle sx={{ mr: 2 }} />
                            Admin Panel
                          </MenuItem>
                        )}
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                          <Logout sx={{ mr: 2 }} />
                          Logout
                        </MenuItem>
                      </MuiMenu>
                    </>
                  ) : (
                    <>
                      <Button
                        component={Link}
                        href="/login"
                        variant="outlined"
                        size="small"
                        startIcon={<Login />}
                        sx={{
                          display: { xs: "none", sm: "flex" },
                          textTransform: "none",
                          borderColor: "primary.main",
                          color: "primary.main",
                          "&:hover": {
                            borderColor: "primary.dark",
                            backgroundColor: "primary.main",
                            color: "primary.contrastText",
                          },
                        }}
                      >
                        Sign In
                      </Button>
                      <IconButton
                        component={Link}
                        href="/login"
                        sx={{
                          color: "text.primary",
                          display: { xs: "flex", sm: "none" },
                        }}
                      >
                        <Person />
                      </IconButton>
                    </>
                  )}
                </ClientOnly>

                <IconButton
                  onClick={toggleTheme}
                  sx={{ color: "text.primary" }}
                >
                  {mode === "dark" ? <LightMode /> : <DarkMode />}
                </IconButton>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileMenuOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 250,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          {children}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            backgroundColor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            py: 6,
            mt: 8,
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 4,
              }}
            >
              {/* Company Info */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  JustForView
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your premium destination for authentic Beyblades and hobby
                  collectibles. Quality guaranteed.
                </Typography>
              </Box>

              {/* Quick Links */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Links
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {navigation.slice(0, 5).map((item) => (
                    <Typography
                      key={item.name}
                      variant="body2"
                      component="a"
                      href={item.href}
                      sx={{
                        color: "text.secondary",
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {item.name}
                    </Typography>
                  ))}
                </Box>
              </Box>

              {/* Categories */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Categories
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {[
                    { name: "Beyblade Burst", href: "/game" },
                    { name: "Metal Series", href: "/game" },
                    { name: "Plastic Gen", href: "/game" },
                    { name: "Accessories", href: "/game" },
                  ].map((item) => (
                    <Typography
                      key={item.name}
                      variant="body2"
                      component={Link}
                      href={item.href}
                      sx={{
                        color: "text.secondary",
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {item.name}
                    </Typography>
                  ))}
                </Box>
              </Box>

              {/* Support */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Support
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {[
                    { name: "Contact", href: "/contact" },
                    { name: "Terms", href: "/terms" },
                    { name: "Privacy", href: "/privacy" },
                  ].map((item) => (
                    <Typography
                      key={item.name}
                      variant="body2"
                      component={Link}
                      href={item.href}
                      sx={{
                        color: "text.secondary",
                        textDecoration: "none",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {item.name}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                borderTop: 1,
                borderColor: "divider",
                mt: 4,
                pt: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                © 2025 JustForView. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
