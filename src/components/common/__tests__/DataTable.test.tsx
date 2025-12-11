import { fireEvent, render, screen } from "@testing-library/react";
import { Column, DataTable } from "../DataTable";

interface TestUser {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface NumericTestData {
  id: string;
  name: string;
  age: number;
}

describe("DataTable", () => {
  const testUsers: TestUser[] = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      status: "active",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      status: "inactive",
    },
    {
      id: "3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      status: "active",
    },
  ];

  const basicColumns: Column<TestUser>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "status", label: "Status", sortable: false },
  ];

  const keyExtractor = (row: TestUser) => row.id;

  describe("Basic Rendering", () => {
    it("renders table with data", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    });

    it("renders column headers", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("renders all rows", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(3);
    });

    it("renders cell data correctly", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );
      expect(screen.getByText("alice@example.com")).toBeInTheDocument();
      const activeCells = screen.getAllByText("active");
      expect(activeCells.length).toBeGreaterThan(0);
    });

    it("uses keyExtractor for row keys", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={(row) => `user-${row.id}`}
        />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(testUsers.length);
    });
  });

  describe("Empty State", () => {
    it("shows empty message when no data", () => {
      render(
        <DataTable
          data={[]}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("shows custom empty message", () => {
      render(
        <DataTable
          data={[]}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          emptyMessage="No users found"
        />
      );
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    it("empty state doesn't render table headers", () => {
      render(
        <DataTable
          data={[]}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );
      expect(screen.queryByText("Name")).not.toBeInTheDocument();
    });

    it("empty state centers message", () => {
      const { container } = render(
        <DataTable
          data={[]}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );
      const emptyDiv = container.querySelector(".text-center");
      expect(emptyDiv).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("shows skeleton rows when loading", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          isLoading={true}
        />
      );
      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("shows 5 skeleton rows by default", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          isLoading={true}
        />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(5);
    });

    it("renders headers during loading", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          isLoading={true}
        />
      );
      expect(screen.getByText("Name")).toBeInTheDocument();
    });

    it("doesn't show data when loading", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          isLoading={true}
        />
      );
      expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
    });

    it("skeleton has correct background colors", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          isLoading={true}
        />
      );
      const skeleton = container.querySelector(".bg-gray-200");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("Sorting - Uncontrolled", () => {
    it("sorts ascending on first click", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      fireEvent.click(nameHeader!);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("Alice Johnson");
      expect(rows[2]).toHaveTextContent("Charlie Brown");
    });

    it("sorts descending on second click", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      fireEvent.click(nameHeader!);
      fireEvent.click(nameHeader!);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("Charlie Brown");
      expect(rows[2]).toHaveTextContent("Alice Johnson");
    });

    it("sorts numeric values correctly", () => {
      const numericData: NumericTestData[] = [
        { id: "1", name: "Alice", age: 30 },
        { id: "2", name: "Bob", age: 25 },
        { id: "3", name: "Charlie", age: 35 },
      ];

      const numericColumns: Column<NumericTestData>[] = [
        { key: "name", label: "Name", sortable: true },
        { key: "age", label: "Age", sortable: true },
      ];

      const { container } = render(
        <DataTable
          data={numericData}
          columns={numericColumns}
          keyExtractor={(row) => row.id}
        />
      );

      const ageHeader = screen.getByText("Age").closest("th");
      fireEvent.click(ageHeader!);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("25");
      expect(rows[2]).toHaveTextContent("35");
    });

    it("changes sort column when different header clicked", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      fireEvent.click(nameHeader!);

      const emailHeader = screen.getByText("Email").closest("th");
      fireEvent.click(emailHeader!);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveTextContent("alice@example.com");
    });

    it("shows sort direction indicator", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      fireEvent.click(nameHeader!);

      expect(screen.getByText("↑")).toBeInTheDocument();
    });
  });

  describe("Sorting - Controlled", () => {
    it("calls onSort when header clicked in controlled mode", () => {
      const onSort = jest.fn();
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          onSort={onSort}
          sortKey="name"
          sortDirection="asc"
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      fireEvent.click(nameHeader!);

      expect(onSort).toHaveBeenCalledWith("name", "desc");
    });

    it("calls onSort with asc when clicking different column", () => {
      const onSort = jest.fn();
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          onSort={onSort}
          sortKey="name"
          sortDirection="desc"
        />
      );

      const emailHeader = screen.getByText("Email").closest("th");
      fireEvent.click(emailHeader!);

      expect(onSort).toHaveBeenCalledWith("email", "asc");
    });

    it("uses external sort state when provided", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          sortKey="name"
          sortDirection="desc"
        />
      );

      expect(screen.getByText("↓")).toBeInTheDocument();
    });
  });

  describe("Custom Renderers", () => {
    it("uses custom render function for cell", () => {
      const customColumns: Column<TestUser>[] = [
        {
          key: "name",
          label: "Name",
          render: (value) => <strong>{value}</strong>,
        },
      ];

      const { container } = render(
        <DataTable
          data={testUsers}
          columns={customColumns}
          keyExtractor={keyExtractor}
        />
      );

      const strongElement = container.querySelector("strong");
      expect(strongElement).toHaveTextContent("Alice Johnson");
    });

    it("passes full row to custom render function", () => {
      const customColumns: Column<TestUser>[] = [
        {
          key: "name",
          label: "Name",
          render: (value, row) => `${value} (${row.email})`,
        },
      ];

      render(
        <DataTable
          data={testUsers}
          columns={customColumns}
          keyExtractor={keyExtractor}
        />
      );

      expect(
        screen.getByText("Alice Johnson (alice@example.com)")
      ).toBeInTheDocument();
    });

    it("falls back to plain value when no render function", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const activeCells = screen.getAllByText("active");
      expect(activeCells.length).toBeGreaterThan(0);
    });
  });

  describe("Row Click Handlers", () => {
    it("calls onRowClick when row is clicked", () => {
      const onRowClick = jest.fn();
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          onRowClick={onRowClick}
        />
      );

      const row = container.querySelector("tbody tr");
      fireEvent.click(row!);

      expect(onRowClick).toHaveBeenCalledWith(testUsers[0]);
    });

    it("adds cursor pointer when onRowClick is provided", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          onRowClick={jest.fn()}
        />
      );

      const row = container.querySelector("tbody tr");
      expect(row).toHaveClass("cursor-pointer");
    });

    it("doesn't add cursor pointer without onRowClick", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const row = container.querySelector("tbody tr");
      expect(row).not.toHaveClass("cursor-pointer");
    });
  });

  describe("Custom Styling", () => {
    it("applies custom className to table", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          className="custom-table"
        />
      );

      const table = container.querySelector("table");
      expect(table).toHaveClass("custom-table");
    });

    it("applies custom rowClassName function", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          rowClassName={(row) => (row.status === "active" ? "active-row" : "")}
        />
      );

      const rows = container.querySelectorAll("tbody tr");
      expect(rows[0]).toHaveClass("active-row");
      expect(rows[1]).not.toHaveClass("active-row");
    });

    it("applies column width when specified", () => {
      const columnsWithWidth: Column<TestUser>[] = [
        { key: "name", label: "Name", width: "200px" },
      ];

      const { container } = render(
        <DataTable
          data={testUsers}
          columns={columnsWithWidth}
          keyExtractor={keyExtractor}
        />
      );

      const th = container.querySelector("th");
      expect(th).toHaveStyle({ width: "200px" });
    });
  });

  describe("Dark Mode", () => {
    it("has dark mode classes on table header", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const thead = container.querySelector("thead");
      expect(thead).toHaveClass("dark:bg-gray-800");
    });

    it("has dark mode classes on header text", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveClass("dark:text-gray-400");
    });

    it("has dark mode classes on table body", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const tbody = container.querySelector("tbody");
      expect(tbody).toHaveClass("dark:bg-gray-900");
    });

    it("has dark mode classes on cell text", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveClass("dark:text-gray-100");
    });

    it("has dark mode classes on row hover", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          onRowClick={jest.fn()}
        />
      );

      const row = container.querySelector("tbody tr");
      expect(row).toHaveClass("dark:hover:bg-gray-800");
    });

    it("has dark mode classes on loading skeleton", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
          isLoading={true}
        />
      );

      const skeleton = container.querySelector(".dark\\:bg-gray-700");
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("has overflow-x-auto for horizontal scrolling", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const wrapper = container.querySelector(".overflow-x-auto");
      expect(wrapper).toBeInTheDocument();
    });

    it("table is full width", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const table = container.querySelector("table");
      expect(table).toHaveClass("w-full");
    });

    it("cells have whitespace-nowrap for mobile", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const cell = container.querySelector("td");
      expect(cell).toHaveClass("whitespace-nowrap");
    });
  });

  describe("TypeScript Generics", () => {
    it("works with custom data types", () => {
      interface Product {
        id: string;
        name: string;
        price: number;
      }

      const products: Product[] = [{ id: "1", name: "Product A", price: 100 }];

      const productColumns: Column<Product>[] = [
        { key: "name", label: "Product" },
        { key: "price", label: "Price" },
      ];

      render(
        <DataTable
          data={products}
          columns={productColumns}
          keyExtractor={(row) => row.id}
        />
      );

      expect(screen.getByText("Product A")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles single row", () => {
      const { container } = render(
        <DataTable
          data={[testUsers[0]]}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(1);
    });

    it("handles many columns", () => {
      const manyColumns: Column<TestUser>[] = Array.from(
        { length: 10 },
        (_, i) => ({
          key: `col${i}`,
          label: `Column ${i}`,
          render: () => testUsers[0].name,
        })
      );

      render(
        <DataTable
          data={testUsers}
          columns={manyColumns}
          keyExtractor={keyExtractor}
        />
      );

      expect(screen.getByText("Column 0")).toBeInTheDocument();
      expect(screen.getByText("Column 9")).toBeInTheDocument();
    });

    it("handles undefined values in cells", () => {
      const dataWithUndefined = [
        { id: "1", name: "Alice", email: undefined, status: "active" },
      ] as any;

      render(
        <DataTable
          data={dataWithUndefined}
          columns={basicColumns}
          keyExtractor={(row) => row.id}
        />
      );

      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    it("handles non-sortable columns without click handler", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const statusHeader = screen.getByText("Status").closest("th");
      expect(statusHeader).not.toHaveClass("cursor-pointer");
    });

    it("handles equal values in sorting", () => {
      const duplicateData = [
        {
          id: "1",
          name: "Same Name",
          email: "a@example.com",
          status: "active",
        },
        {
          id: "2",
          name: "Same Name",
          email: "b@example.com",
          status: "active",
        },
      ];

      const { container } = render(
        <DataTable
          data={duplicateData}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      fireEvent.click(nameHeader!);

      const rows = container.querySelectorAll("tbody tr");
      expect(rows).toHaveLength(2);
    });
  });

  describe("Accessibility", () => {
    it("sortable headers are clickable th elements", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveClass("cursor-pointer");
    });

    it("sort headers have hover states", () => {
      render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      const nameHeader = screen.getByText("Name").closest("th");
      expect(nameHeader).toHaveClass("hover:bg-gray-100");
    });

    it("uses semantic table elements", () => {
      const { container } = render(
        <DataTable
          data={testUsers}
          columns={basicColumns}
          keyExtractor={keyExtractor}
        />
      );

      expect(container.querySelector("table")).toBeInTheDocument();
      expect(container.querySelector("thead")).toBeInTheDocument();
      expect(container.querySelector("tbody")).toBeInTheDocument();
    });
  });
});
