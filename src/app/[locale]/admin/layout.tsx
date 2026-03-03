import { ReactNode } from "react";
import { AdminTabs, Main, Heading, Text, BlockHeader } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

export const metadata = {
  title: "Admin Dashboard - LetItRip",
  description: "Admin panel for managing the LetItRip platform",
  robots: { index: false, follow: false },
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="w-full space-y-0">
      {/* Header */}
      <BlockHeader
        className={`${THEME_CONSTANTS.themed.bgSecondary} border-b ${THEME_CONSTANTS.themed.borderColor}`}
      >
        <div className="py-3 sm:py-4">
          <Heading
            level={1}
            className={`text-xl sm:text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Admin Dashboard
          </Heading>
          <Text size="xs" variant="secondary" className="sm:text-sm mt-1">
            Manage your platform content and settings
          </Text>
        </div>
      </BlockHeader>

      {/* Tab Navigation */}
      <div
        className={`${THEME_CONSTANTS.themed.bgSecondary} border-b ${THEME_CONSTANTS.themed.borderColor} -mx-4 sm:-mx-6 lg:-mx-8`}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <AdminTabs />
        </div>
      </div>

      {/* Main Content */}
      <Main className="py-4 sm:py-6">{children}</Main>
    </div>
  );
}
