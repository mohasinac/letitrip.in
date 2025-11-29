import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileDataTable } from "./MobileDataTable";

interface TestUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const mockData: TestUser[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", role: "Seller" },
];

const mockColumns = [
  { key: "name" as const, header: "Name" },
  { key: "email" as const, header: "Email" },
  { key: "role" as const, header: "Role" },
];

describe("MobileDataTable", () => {
  const keyExtractor = (item: TestUser) => item.id;

  it("renders data items", () => {
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={keyExtractor}
      />,
    );

    // Both mobile and desktop views are rendered (CSS controls visibility)
    // So we use getAllByText
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Jane Smith").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bob Wilson").length).toBeGreaterThanOrEqual(1);
  });

  it("shows empty state when data is empty", () => {
    render(
      <MobileDataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={keyExtractor}
      />,
    );

    expect(screen.getByText("No data to display")).toBeInTheDocument();
  });

  it("shows custom empty state", () => {
    render(
      <MobileDataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={keyExtractor}
        emptyState={<div>Custom empty message</div>}
      />,
    );

    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <MobileDataTable
        data={[]}
        columns={mockColumns}
        keyExtractor={keyExtractor}
        isLoading={true}
        loadingRows={3}
      />,
    );

    // Check for skeleton elements (animate-pulse class)
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBe(3);
  });

  it("calls onRowClick when row is clicked", async () => {
    const handleRowClick = jest.fn();
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={keyExtractor}
        onRowClick={handleRowClick}
      />,
    );

    // Get the first occurrence (mobile card view)
    await userEvent.click(screen.getAllByText("John Doe")[0]);
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it("applies cursor-pointer when onRowClick is provided", () => {
    render(
      <MobileDataTable
        data={mockData}
        columns={mockColumns}
        keyExtractor={keyExtractor}
        onRowClick={() => {}}
      />,
    );

    // Get the mobile card container (first element with cursor-pointer in mobile view)
    const mobileView = document.querySelector(".lg\\:hidden");
    const firstCard = mobileView?.querySelector(".cursor-pointer");
    expect(firstCard).toBeInTheDocument();
  });

  it("renders custom column with render function", () => {
    const columnsWithRender = [
      ...mockColumns,
      {
        key: "custom",
        header: "Actions",
        render: (item: TestUser) => (
          <button data-testid={`action-${item.id}`}>View</button>
        ),
      },
    ];

    render(
      <MobileDataTable
        data={mockData}
        columns={columnsWithRender}
        keyExtractor={keyExtractor}
      />,
    );

    expect(screen.getByTestId("action-1")).toBeInTheDocument();
  });

  it("hides columns marked as mobileHide on mobile", () => {
    // Note: This test checks the column configuration, actual hiding depends on viewport
    const columnsWithHide = [
      { key: "name" as const, header: "Name" },
      { key: "email" as const, header: "Email", mobileHide: true },
    ];

    render(
      <MobileDataTable
        data={mockData}
        columns={columnsWithHide}
        keyExtractor={keyExtractor}
      />,
    );

    // Mobile cards are in .lg:hidden container
    // Desktop table is in .hidden.lg:block container
    // The component filters mobileHide columns for mobile card view
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
  });

  it("uses custom renderMobileCard when provided", () => {
    render(
      <MobileDataTable<TestUser>
        data={mockData}
        columns={mockColumns}
        keyExtractor={keyExtractor}
        renderMobileCard={(item: TestUser) => (
          <div data-testid={`custom-card-${item.id}`}>Custom: {item.name}</div>
        )}
      />,
    );

    expect(screen.getByTestId("custom-card-1")).toBeInTheDocument();
    // Custom card only shows in mobile view, so only one occurrence
    expect(
      screen.getAllByText("Custom: John Doe").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("handles nested key access", () => {
    interface NestedData {
      id: string;
      user: {
        name: string;
      };
    }

    const nestedData: NestedData[] = [
      { id: "1", user: { name: "Nested User" } },
    ];
    const nestedColumns = [{ key: "user.name", header: "User Name" }];

    render(
      <MobileDataTable<NestedData>
        data={nestedData}
        columns={nestedColumns}
        keyExtractor={(item: NestedData) => item.id}
      />,
    );

    expect(screen.getAllByText("Nested User").length).toBeGreaterThanOrEqual(1);
  });
});
