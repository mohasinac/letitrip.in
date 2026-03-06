/**
 * BlogTableColumns Tests
 * Verifies useBlogTableColumns hook uses useTranslations - no UI_LABELS in JSX.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useBlogTableColumns } from "../BlogTableColumns";

const tMap: Record<string, Record<string, string>> = {
  adminBlog: {
    formTitle: "Title",
    formCategory: "Category",
    formStatus: "Status",
    formFeatured: "Featured Post",
    author: "Author",
    publishedOn: "Published on",
    views: "Views",
  },
  actions: { edit: "Edit", delete: "Delete" },
};

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => tMap[ns]?.[key] ?? key,
}));

jest.mock("@/constants", () => ({
  THEME_CONSTANTS: {
    themed: { textSecondary: "text-gray-600" },
  },
}));

jest.mock("@/utils", () => ({ formatDate: (d: unknown) => String(d) }));

jest.mock("@/components", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

function TestWrapper({
  onEdit,
  onDelete,
}: {
  onEdit: jest.Mock;
  onDelete: jest.Mock;
}) {
  const { columns } = useBlogTableColumns(onEdit, onDelete);
  return <div data-testid="col-count" data-count={columns.length} />;
}

describe("useBlogTableColumns", () => {
  it("returns 8 columns", () => {
    render(<TestWrapper onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByTestId("col-count").getAttribute("data-count")).toBe(
      "8",
    );
  });

  it("renders edit button with t('edit') label", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const { columns } = (() => {
      let result: ReturnType<typeof useBlogTableColumns> | null = null;
      function Wrapper() {
        result = useBlogTableColumns(onEdit, onDelete);
        return null;
      }
      render(<Wrapper />);
      return result!;
    })();

    const actionsCol = columns.find((c) => c.key === "actions")!;
    const post = {
      id: "p1",
      title: "Post",
      slug: "post",
      status: "published",
      category: "news",
      isFeatured: false,
      authorName: "A",
      views: 0,
      publishedAt: null,
    } as any;
    const { getByText } = render(<>{actionsCol.render(post)}</>);
    expect(getByText("Edit")).toBeInTheDocument();
    expect(getByText("Delete")).toBeInTheDocument();
  });
});

