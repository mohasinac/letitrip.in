"use client";

import { Box, Container, Typography, Tabs, Tab } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import {
  Palette as PaletteIcon,
  ViewCarousel as CarouselIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsTabs = [
  { label: "Theme", path: "/admin/settings/theme", icon: <PaletteIcon /> },
  { label: "Hero Slides", path: "/admin/settings/hero", icon: <CarouselIcon /> },
  {
    label: "Featured Categories",
    path: "/admin/settings/featured-categories",
    icon: <CategoryIcon />,
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine current tab based on pathname
  const currentTab = settingsTabs.findIndex((tab) => pathname === tab.path);
  const tabValue = currentTab >= 0 ? currentTab : 0;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    router.push(settingsTabs[newValue].path);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
          Admin Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Configure all aspects of your application. Click on a tab to navigate
          to different settings.
        </Typography>

        {/* Settings Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            {settingsTabs.map((tab, index) => (
              <Tab
                key={tab.path}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                id={`settings-tab-${index}`}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 48,
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Content */}
        <Box>{children}</Box>
      </Container>
    </Box>
  );
}
