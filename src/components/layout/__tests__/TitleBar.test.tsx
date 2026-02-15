import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TitleBar } from "@/components";
import { SITE_CONFIG } from "@/constants";

jest.mock("@/hooks", () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

describe("TitleBar", () => {
  const defaultProps = {
    onToggleSidebar: jest.fn(),
    sidebarOpen: false,
    onSearchToggle: jest.fn(),
    searchOpen: false,
  };

  it("renders primary navigation elements", () => {
    render(<TitleBar {...defaultProps} />);

    const links = screen.getAllByRole("link");
    const homeLink = links.find(
      (link) => link.getAttribute("href") === SITE_CONFIG.nav.home,
    );

    expect(homeLink).toBeDefined();
    expect(screen.getByLabelText("Shopping cart")).toBeInTheDocument();
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
  });
});
