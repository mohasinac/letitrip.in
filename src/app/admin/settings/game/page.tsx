"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  useTheme,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Casino as BeybladeIcon,
} from "@mui/icons-material";
import BeybladeManagement from "../../../../components/admin/BeybladeManagement";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`game-settings-tabpanel-${index}`}
      aria-labelledby={`game-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GameSettingsPage() {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <SettingsIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" fontWeight="bold">
            Game Settings
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage game configurations, Beyblade stats, and gameplay settings
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              minHeight: 64,
            },
          }}
        >
          <Tab
            icon={<BeybladeIcon />}
            iconPosition="start"
            label="Beyblade Management"
            id="game-settings-tab-0"
            aria-controls="game-settings-tabpanel-0"
          />
          {/* Future tabs can be added here */}
          {/* <Tab
            icon={<TuneIcon />}
            iconPosition="start"
            label="Game Balance"
            id="game-settings-tab-1"
            aria-controls="game-settings-tabpanel-1"
          /> */}
        </Tabs>
      </Card>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <BeybladeManagement />
      </TabPanel>

      {/* Future tab panels */}
      {/* <TabPanel value={currentTab} index={1}>
        <GameBalanceSettings />
      </TabPanel> */}
    </Container>
  );
}
