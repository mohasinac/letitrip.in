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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu,
  ShoppingCart,
  Search,
  Person,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import { useModernTheme } from "@/contexts/ModernThemeContext";
import { useState } from "react";
import Link from "next/link";

interface ModernLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "Game", href: "/game" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
  { name: "Help", href: "/help" },
];

export default function ModernLayout({ children }: ModernLayoutProps) {
  const { mode, toggleTheme } = useModernTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {navigation.map((item) => (
          <ListItem key={item.name} component="a" href={item.href}>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
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
            {/* Mobile menu button */}
            {isHydrated && isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: "text.primary" }}
              >
                <Menu />
              </IconButton>
            )}

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
              }}
            >
              JustForView
            </Typography>

            {/* Desktop Navigation */}
            {isHydrated && !isMobile && (
              <Box sx={{ display: "flex", gap: 2 }}>
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
            )}

            {/* Right side icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton sx={{ color: "text.primary" }}>
                <Search />
              </IconButton>
              <IconButton sx={{ color: "text.primary" }}>
                <ShoppingCart />
              </IconButton>
              <IconButton sx={{ color: "text.primary" }}>
                <Person />
              </IconButton>
              <IconButton onClick={toggleTheme} sx={{ color: "text.primary" }}>
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
                {navigation.slice(0, 4).map((item) => (
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
                  { name: "FAQ", href: "/faq" },
                  { name: "Help Center", href: "/help" },
                  { name: "Contact", href: "/contact" },
                  { name: "Terms", href: "/terms" },
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
  );
}
