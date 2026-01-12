import type { Meta, StoryObj } from "@storybook/react";
import {
  DateDisplay,
  DateRange,
  RelativeDate,
} from "../../src/components/values/DateDisplay";

const meta = {
  title: "Components/Values/DateDisplay",
  component: DateDisplay,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Date display components with consistent formatting. Includes absolute dates, relative dates, and date ranges.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DateDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    date: new Date("2026-01-15T10:30:00"),
  },
};

export const ShortFormat: Story = {
  args: {
    date: new Date("2026-01-15"),
    format: "short",
  },
};

export const MediumFormat: Story = {
  args: {
    date: new Date("2026-01-15"),
    format: "medium",
  },
};

export const LongFormat: Story = {
  args: {
    date: new Date("2026-01-15"),
    format: "long",
  },
};

export const WithTime: Story = {
  args: {
    date: new Date("2026-01-15T14:30:00"),
    format: "medium",
    includeTime: true,
  },
};

export const InvalidDate: Story = {
  args: {
    date: null,
    fallback: "No date available",
  },
};

export const RelativeDateNow: Story = {
  render: () => <RelativeDate date={new Date()} />,
};

export const RelativeDateHoursAgo: Story = {
  render: () => (
    <RelativeDate date={new Date(Date.now() - 2 * 60 * 60 * 1000)} />
  ),
};

export const RelativeDateDaysAgo: Story = {
  render: () => (
    <RelativeDate date={new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)} />
  ),
};

export const DateRangeExample: Story = {
  render: () => (
    <DateRange start={new Date("2026-01-01")} end={new Date("2026-01-15")} />
  ),
};

export const AllVariants: Story = {
  render: () => {
    const now = new Date();
    const past = new Date("2025-12-01");
    const future = new Date("2026-02-20");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <strong>DateDisplay (current):</strong>
          <br />
          <DateDisplay date={now} format="long" includeTime />
        </div>
        <div>
          <strong>RelativeDate (now):</strong>
          <br />
          <RelativeDate date={now} />
        </div>
        <div>
          <strong>DateRange (past to future):</strong>
          <br />
          <DateRange start={past} end={future} />
        </div>
      </div>
    );
  },
};
