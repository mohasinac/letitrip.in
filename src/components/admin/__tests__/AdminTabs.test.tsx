import { render, screen } from "@testing-library/react";
import type React from "react";
import { AdminTabs } from "@/components";
import { ADMIN_TAB_ITEMS } from "@/constants";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe("AdminTabs", () => {
  it("renders SectionTabs with admin tabs", () => {
    render(<AdminTabs />);

    // Check that the navigation element exists
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    // Check that the first tab is rendered (Dashboard appears in both desktop and mobile)
    const dashboardElements = screen.getAllByText(ADMIN_TAB_ITEMS[0].label);
    expect(dashboardElements.length).toBeGreaterThan(0);
  });
});
