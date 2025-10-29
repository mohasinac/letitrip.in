"use client";

import { Box, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import SettingsLayout from "@/components/admin/settings/SettingsLayout";
import HeroCarouselSettings from "@/components/admin/settings/hero/HeroCarouselSettings";
import HeroProductSettings from "@/components/admin/settings/hero/HeroProductSettings";

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
    <SettingsLayout>
      {/* Sub-tabs for Hero Settings */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="hero settings tabs"
        >
          <Tab
            label="Carousel Backgrounds"
            id="hero-tab-0"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          <Tab
            label="Featured Products"
            id="hero-tab-1"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <HeroCarouselSettings />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <HeroProductSettings />
      </TabPanel>
    </SettingsLayout>
  );
}

export default function HeroSettings() {
  return (
    <RoleGuard requiredRole="admin">
      <HeroSettingsContent />
    </RoleGuard>
  );
}
