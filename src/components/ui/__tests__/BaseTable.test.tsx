import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { BaseTable, TableColumn as BaseTableColumn } from "../BaseTable";

interface TestData {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
}

describe("BaseTable - Generic Table Component", () => {
  const mockData: TestData[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      status: "active",
      role: "admin",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      status: "inactive",
      role: "user",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      status: "active",
      role: "user",
    },
  ];

  const defaultColumns: BaseTableColumn<TestData>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "role", label: "Role" },
  ];

  const defaultKeyExtractor = (row: TestData, index: number) => row.id;

  describe("Basic Rendering", () => {
    it("should render table with data", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("should render all column headers", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Role")).toBeInTheDocument();
    });

    it("should render all rows", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("should have overflow-x-auto", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const wrapper = container.querySelector(".overflow-x-auto");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have rounded-lg border", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const wrapper = container.querySelector(".rounded-lg.border");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have border-gray-200", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const wrapper = container.querySelector(".border-gray-200");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have bg-white", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const wrapper = container.querySelector(".bg-white");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should render skeleton when isLoading is true", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          isLoading={true}
        />
      );
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should render 5 skeleton rows", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          isLoading={true}
        />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(5);
    });

    it("should render skeleton for each column", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          isLoading={true}
        />
      );
      const firstRow = container.querySelector("tbody tr");
      const cells = firstRow?.querySelectorAll("td");
      expect(cells).toHaveLength(defaultColumns.length);
    });

    it("should have bg-gray-200 on skeleton cells", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          isLoading={true}
        />
      );
      const skeletonCell = container.querySelector(".bg-gray-200");
      expect(skeletonCell).toBeInTheDocument();
    });

    it("should have rounded skeleton cells", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          isLoading={true}
        />
      );
      const skeletonCell = container.querySelector(".rounded");
      expect(skeletonCell).toBeInTheDocument();
    });

    it("should have h-4 height on skeleton cells", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          isLoading={true}
        />
      );
      const skeletonCell = container.querySelector(".h-4");
      expect(skeletonCell).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should render empty message when no data and not loading", () => {
      render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          emptyMessage="No records found"
        />
      );
      expect(screen.getByText("No records found")).toBeInTheDocument();
    });

    it("should use default empty message when not provided", () => {
      render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should have text-center on empty state", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const emptyState = container.querySelector(".text-center");
      expect(emptyState).toBeInTheDocument();
    });

    it("should have py-12 padding on empty state", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const emptyState = container.querySelector(".py-12");
      expect(emptyState).toBeInTheDocument();
    });

    it("should have text-gray-500 on empty message", () => {
      render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const message = screen.getByText("No data available");
      expect(message).toHaveClass("text-gray-500");
    });

    it("should not render empty state when loading", () => {
      render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          isLoading={true}
          emptyMessage="No data"
        />
      );
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });

    it("should not render empty state when data exists", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          emptyMessage="No data"
        />
      );
      expect(screen.queryByText("No data")).not.toBeInTheDocument();
    });
  });

  describe("Column Configuration", () => {
    it("should apply custom width to columns", () => {
      const columnsWithWidth: BaseTableColumn<TestData>[] = [
        { key: "name", label: "Name", width: "200px" },
        { key: "email", label: "Email", width: "300px" },
      ];
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={columnsWithWidth}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const headers = container.querySelectorAll("th");
      expect(headers[0]).toHaveStyle({ width: "200px" });
      expect(headers[1]).toHaveStyle({ width: "300px" });
    });

    it("should apply left alignment by default", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("text-left");
    });

    it("should apply center alignment when specified", () => {
      const columnsWithAlign: BaseTableColumn<TestData>[] = [
        { key: "name", label: "Name", align: "center" },
      ];
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={columnsWithAlign}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("text-center");
    });

    it("should apply right alignment when specified", () => {
      const columnsWithAlign: BaseTableColumn<TestData>[] = [
        { key: "name", label: "Name", align: "right" },
      ];
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={columnsWithAlign}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("text-right");
    });

    it("should render custom header with headerRender", () => {
      const columnsWithCustomHeader: BaseTableColumn<TestData>[] = [
        {
          key: "name",
          label: "Name",
          headerRender: () => <span>Custom Header</span>,
        },
      ];
      render(
        <BaseTable
          data={mockData}
          columns={columnsWithCustomHeader}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("Custom Header")).toBeInTheDocument();
    });

    it("should render custom cell content with render function", () => {
      const columnsWithRender: BaseTableColumn<TestData>[] = [
        {
          key: "name",
          label: "Name",
          render: (value) => <strong>{value.toUpperCase()}</strong>,
        },
      ];
      render(
        <BaseTable
          data={mockData}
          columns={columnsWithRender}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("JOHN DOE")).toBeInTheDocument();
    });

    it("should pass row and index to render function", () => {
      const renderMock = jest.fn((value, row, index) => <span>{value}</span>);
      const columnsWithRender: BaseTableColumn<TestData>[] = [
        {
          key: "name",
          label: "Name",
          render: renderMock,
        },
      ];
      render(
        <BaseTable
          data={mockData}
          columns={columnsWithRender}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(renderMock).toHaveBeenCalledWith("John Doe", mockData[0], 0);
      expect(renderMock).toHaveBeenCalledWith("Jane Smith", mockData[1], 1);
    });

    it("should add hover effect to sortable columns", () => {
      const sortableColumns: BaseTableColumn<TestData>[] = [
        { key: "name", label: "Name", sortable: true },
      ];
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={sortableColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("cursor-pointer");
      expect(header).toHaveClass("hover:bg-gray-100");
    });

    it("should not add hover effect to non-sortable columns", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).not.toHaveClass("cursor-pointer");
    });
  });

  describe("Row Click Handling", () => {
    it("should call onRowClick when row is clicked", () => {
      const mockRowClick = jest.fn();
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          onRowClick={mockRowClick}
        />
      );
      const row = screen.getByText("John Doe").closest("tr");
      fireEvent.click(row!);
      expect(mockRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it("should add cursor-pointer when onRowClick provided", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          onRowClick={jest.fn()}
        />
      );
      const row = screen.getByText("John Doe").closest("tr");
      expect(row).toHaveClass("cursor-pointer");
    });

    it("should add hover:bg-gray-50 when onRowClick provided", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          onRowClick={jest.fn()}
        />
      );
      const row = screen.getByText("John Doe").closest("tr");
      expect(row).toHaveClass("hover:bg-gray-50");
    });

    it("should not add cursor-pointer when onRowClick not provided", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const row = screen.getByText("John Doe").closest("tr");
      expect(row).not.toHaveClass("cursor-pointer");
    });

    it("should call onRowClick for correct row", () => {
      const mockRowClick = jest.fn();
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          onRowClick={mockRowClick}
        />
      );
      const secondRow = screen.getByText("Jane Smith").closest("tr");
      fireEvent.click(secondRow!);
      expect(mockRowClick).toHaveBeenCalledWith(mockData[1]);
    });
  });

  describe("Custom Row Styling", () => {
    it("should apply custom rowClassName", () => {
      const rowClassName = (row: TestData) =>
        row.status === "active" ? "bg-green-50" : "bg-red-50";
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          rowClassName={rowClassName}
        />
      );
      const firstRow = screen.getByText("John Doe").closest("tr");
      expect(firstRow).toHaveClass("bg-green-50");
      const secondRow = screen.getByText("Jane Smith").closest("tr");
      expect(secondRow).toHaveClass("bg-red-50");
    });

    it("should call rowClassName function for each row", () => {
      const rowClassNameMock = jest.fn(() => "custom-class");
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          rowClassName={rowClassNameMock}
        />
      );
      expect(rowClassNameMock).toHaveBeenCalledTimes(mockData.length);
    });
  });

  describe("Sticky Features", () => {
    it("should make header sticky when stickyHeader is true", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          stickyHeader={true}
        />
      );
      const thead = container.querySelector("thead");
      expect(thead).toHaveClass("sticky", "top-0", "z-20");
    });

    it("should not make header sticky when stickyHeader is false", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          stickyHeader={false}
        />
      );
      const thead = container.querySelector("thead");
      expect(thead).not.toHaveClass("sticky");
    });

    it("should make first column sticky when stickyFirstColumn is true", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          stickyFirstColumn={true}
        />
      );
      const firstHeader = container.querySelector("thead th");
      expect(firstHeader).toHaveClass("sticky", "left-0", "z-30");
    });

    it("should make first cell sticky in body when stickyFirstColumn is true", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          stickyFirstColumn={true}
        />
      );
      const firstCell = container.querySelector("tbody td");
      expect(firstCell).toHaveClass("sticky", "left-0", "z-10");
    });

    it("should not make first column sticky by default", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const firstHeader = container.querySelector("thead th");
      expect(firstHeader).not.toHaveClass("sticky");
    });
  });

  describe("Compact Mode", () => {
    it("should use compact padding when compact is true", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          compact={true}
        />
      );
      const cell = container.querySelector("td");
      expect(cell).toHaveClass("px-3", "py-2");
    });

    it("should use default padding when compact is false", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          compact={false}
        />
      );
      const cell = container.querySelector("td");
      expect(cell).toHaveClass("px-6", "py-4");
    });
  });

  describe("Dark Mode Support", () => {
    it("should have dark:bg-gray-800 on wrapper", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const wrapper = container.querySelector(".dark\\:bg-gray-800");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have dark:border-gray-700 on wrapper", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const wrapper = container.querySelector(".dark\\:border-gray-700");
      expect(wrapper).toBeInTheDocument();
    });

    it("should have dark:bg-gray-900 on header", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const thead = container.querySelector("thead");
      expect(thead).toHaveClass("dark:bg-gray-900");
    });

    it("should have dark:text-gray-400 on header text", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const th = container.querySelector("th");
      expect(th).toHaveClass("dark:text-gray-400");
    });

    it("should have dark:text-white on body cells", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const td = container.querySelector("td");
      expect(td).toHaveClass("dark:text-white");
    });

    it("should have dark:divide-gray-700 on tbody", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const tbody = container.querySelector("tbody");
      expect(tbody).toHaveClass("dark:divide-gray-700");
    });

    it("should have dark:hover:bg-gray-700 on clickable rows", () => {
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          onRowClick={jest.fn()}
        />
      );
      const row = screen.getByText("John Doe").closest("tr");
      expect(row).toHaveClass("dark:hover:bg-gray-700");
    });

    it("should have dark:hover:bg-gray-800 on sortable headers", () => {
      const sortableColumns: BaseTableColumn<TestData>[] = [
        { key: "name", label: "Name", sortable: true },
      ];
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={sortableColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("dark:hover:bg-gray-800");
    });

    it("should have dark:text-gray-400 on empty state", () => {
      render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const message = screen.getByText("No data available");
      expect(message).toHaveClass("dark:text-gray-400");
    });

    it("should have dark:bg-gray-700 on skeleton cells", () => {
      const { container } = render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          isLoading={true}
        />
      );
      const skeleton = container.querySelector(".dark\\:bg-gray-700");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("Header Styling", () => {
    it("should have uppercase text on headers", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("uppercase");
    });

    it("should have text-xs on headers", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("text-xs");
    });

    it("should have font-medium on headers", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("font-medium");
    });

    it("should have text-gray-500 on headers", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("text-gray-500");
    });

    it("should have tracking-wider on headers", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const header = container.querySelector("th");
      expect(header).toHaveClass("tracking-wider");
    });
  });

  describe("Cell Styling", () => {
    it("should have text-sm on cells", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const cell = container.querySelector("td");
      expect(cell).toHaveClass("text-sm");
    });

    it("should have text-gray-900 on cells", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const cell = container.querySelector("td");
      expect(cell).toHaveClass("text-gray-900");
    });

    it("should have whitespace-nowrap on cells", () => {
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const cell = container.querySelector("td");
      expect(cell).toHaveClass("whitespace-nowrap");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single row", () => {
      render(
        <BaseTable
          data={[mockData[0]]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
    });

    it("should handle single column", () => {
      const singleColumn: BaseTableColumn<TestData>[] = [
        { key: "name", label: "Name" },
      ];
      render(
        <BaseTable
          data={mockData}
          columns={singleColumn}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.queryByText("Email")).not.toBeInTheDocument();
    });

    it("should handle large dataset", () => {
      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        status: "active",
        role: "user",
      }));
      render(
        <BaseTable
          data={largeData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("User 0")).toBeInTheDocument();
      expect(screen.getByText("User 99")).toBeInTheDocument();
    });

    it("should handle missing values in cells", () => {
      const dataWithMissing: TestData[] = [
        { id: "1", name: "John", email: "", status: "active", role: "admin" },
      ];
      render(
        <BaseTable
          data={dataWithMissing}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("should use keyExtractor with index fallback", () => {
      const keyExtractor = jest.fn((row, index) => `row-${index}`);
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={keyExtractor}
        />
      );
      expect(keyExtractor).toHaveBeenCalledTimes(mockData.length);
    });

    it("should handle custom emptyMessage", () => {
      render(
        <BaseTable
          data={[]}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          emptyMessage="Custom empty message"
        />
      );
      expect(screen.getByText("Custom empty message")).toBeInTheDocument();
    });

    it("should handle multiple sortable columns", () => {
      const sortableColumns: BaseTableColumn<TestData>[] = [
        { key: "name", label: "Name", sortable: true },
        { key: "email", label: "Email", sortable: true },
        { key: "status", label: "Status", sortable: false },
      ];
      const { container } = render(
        <BaseTable
          data={mockData}
          columns={sortableColumns}
          keyExtractor={defaultKeyExtractor}
        />
      );
      const headers = container.querySelectorAll("th");
      expect(headers[0]).toHaveClass("cursor-pointer");
      expect(headers[1]).toHaveClass("cursor-pointer");
      expect(headers[2]).not.toHaveClass("cursor-pointer");
    });
  });

  describe("Performance", () => {
    it("should render without crashing with all props", () => {
      const allProps = {
        data: mockData,
        columns: [
          {
            key: "name" as const,
            label: "Name",
            width: "200px",
            align: "left" as const,
            sortable: true,
            render: (value: string) => <strong>{value}</strong>,
            headerRender: () => <span>Custom</span>,
          },
        ],
        keyExtractor: defaultKeyExtractor,
        isLoading: false,
        emptyMessage: "Empty",
        onRowClick: jest.fn(),
        rowClassName: () => "custom",
        stickyHeader: true,
        stickyFirstColumn: true,
        compact: true,
      };
      expect(() => {
        render(<BaseTable {...allProps} />);
      }).not.toThrow();
    });

    it("should handle rapid row clicks", () => {
      const mockClick = jest.fn();
      render(
        <BaseTable
          data={mockData}
          columns={defaultColumns}
          keyExtractor={defaultKeyExtractor}
          onRowClick={mockClick}
        />
      );
      const row = screen.getByText("John Doe").closest("tr");
      for (let i = 0; i < 10; i++) {
        fireEvent.click(row!);
      }
      expect(mockClick).toHaveBeenCalledTimes(10);
    });
  });
});
