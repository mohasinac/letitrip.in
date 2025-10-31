"use client";

import React, { useState } from "react";
import { Settings as SettingsIcon, Dices as BeybladeIcon } from "lucide-react";
import BeybladeManagement from "@/components/admin/BeybladeManagement";

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
      {value === index && <div className="py-6">{children}</div>}
    </div>
  );
}

export default function GameSettingsPage() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <SettingsIcon className="h-10 w-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Game Settings
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage game configurations, Beyblade stats, and gameplay settings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 mb-6">
        <nav
          className="flex gap-2 p-2 overflow-x-auto"
          aria-label="game settings tabs"
        >
          <button
            onClick={(e) => handleTabChange(e, 0)}
            id="game-settings-tab-0"
            aria-controls="game-settings-tabpanel-0"
            className={`flex items-center gap-3 px-6 py-4 font-semibold text-base rounded-lg transition-colors ${
              currentTab === 0
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <BeybladeIcon className="h-5 w-5" />
            Beyblade Management
          </button>
          {/* Future tabs can be added here */}
        </nav>
      </div>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <BeybladeManagement />
      </TabPanel>

      {/* Future tab panels */}
    </div>
  );
}
