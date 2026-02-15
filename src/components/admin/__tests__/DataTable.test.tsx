import { render, screen } from "@testing-library/react";
import type React from "react";
import { DataTable } from "@/components";
import { UI_LABELS } from "@/constants";

interface TestItem {
  id: string;
  name: string;
}

describe("DataTable", () => {
  const columns = [
    {
      key: "name" as const,
      header: UI_LABELS.PROFILE.DISPLAY_NAME,
    },
  ];

  it("renders loading state", () => {
    render(
      <DataTable<TestItem>
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={true}
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    render(
      <DataTable<TestItem>
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
      />,
    );

    expect(screen.getByText(UI_LABELS.TABLE.NO_DATA_TITLE)).toBeInTheDocument();
    expect(
      screen.getByText(UI_LABELS.TABLE.NO_DATA_DESCRIPTION),
    ).toBeInTheDocument();
  });

  it("renders table rows", () => {
    const data = [{ id: "1", name: UI_LABELS.ACTIONS.VIEW }];

    render(
      <DataTable<TestItem>
        data={data}
        columns={columns}
        keyExtractor={(item) => item.id}
        showPagination={false}
      />,
    );

    expect(
      screen.getByText(UI_LABELS.PROFILE.DISPLAY_NAME),
    ).toBeInTheDocument();
    expect(screen.getByText(UI_LABELS.ACTIONS.VIEW)).toBeInTheDocument();
  });
});
