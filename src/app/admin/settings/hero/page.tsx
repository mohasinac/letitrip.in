"use client";

import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
} from "@mui/material";
import { useState } from "react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import HeroCarouselSettings from "@/components/admin/settings/hero/HeroCarouselSettings";
import HeroProductSettings from "@/components/admin/settings/hero/HeroProductSettings";
import NextLink from "next/link";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`hero-tabpanel-${index}`}
      aria-labelledby={`hero-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function HeroSettingsContent() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={NextLink} href="/admin" color="inherit">
            Admin
          </Link>
          <Link component={NextLink} href="/admin/settings" color="inherit">
            Settings
          </Link>
          <Typography color="text.primary">Hero Settings</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          Hero Section Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Customize the hero carousel backgrounds, featured products, and
          promotional content displayed on your homepage.
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="hero settings tabs"
          >
            <Tab label="Carousel Backgrounds" id="hero-tab-0" />
            <Tab label="Featured Products" id="hero-tab-1" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <HeroCarouselSettings />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <HeroProductSettings />
        </TabPanel>
      </Container>
    </Box>
  );
}

export default function HeroSettings() {
  return (
    <RoleGuard requiredRole="admin">
      <HeroSettingsContent />
    </RoleGuard>
  );
}
