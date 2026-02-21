import { render, screen, fireEvent } from "@testing-library/react";
import type React from "react";
import { AdminPageHeader } from "@/components";
import { UI_LABELS } from "@/constants";

describe("AdminPageHeader", () => {
  it("renders title, subtitle, and action button", () => {
    const onAction = jest.fn();

    render(
      <AdminPageHeader
        title={UI_LABELS.ADMIN.DASHBOARD.TITLE}
        subtitle={UI_LABELS.ADMIN.DASHBOARD.SUBTITLE}
        actionLabel={UI_LABELS.ACTIONS.REFRESH}
        onAction={onAction}
      />,
    );

    expect(
      screen.getByText(UI_LABELS.ADMIN.DASHBOARD.TITLE),
    ).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.ADMIN.DASHBOARD.SUBTITLE),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: UI_LABELS.ACTIONS.REFRESH }),
    );
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders description when provided", () => {
    render(
      <AdminPageHeader
        title="Test Title"
        description="A helpful description"
      />,
    );
    expect(screen.getByText("A helpful description")).toBeInTheDocument();
  });

  it("renders breadcrumb trail when provided", () => {
    render(
      <AdminPageHeader
        title="Sub Page"
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Sub Page" },
        ]}
      />,
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Sub Page")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeInTheDocument();
  });

  it("renders breadcrumb link with href", () => {
    render(
      <AdminPageHeader
        title="Detail"
        breadcrumb={[{ label: "Products", href: "/admin/products" }]}
      />,
    );
    const link = screen.getByRole("link", { name: "Products" });
    expect(link).toHaveAttribute("href", "/admin/products");
  });
});
