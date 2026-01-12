import type { Meta, StoryObj } from "@storybook/react";
import {
  getTodayDateInputValue,
  isValidDate,
  safeToDate,
  safeToISOString,
  toDateInputValue,
  toISOStringOrDefault,
} from "../../src/utils/date-utils";

const meta = {
  title: "Utils/Date Utils",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Date manipulation utilities with safe handling of invalid dates and null values.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to display date utility output
const DateUtilDisplay = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div style={{ marginBottom: "16px" }}>
    <strong>{label}:</strong> <code>{value}</code>
  </div>
);

export const ISOStringConversion: Story = {
  render: () => {
    const validDate = new Date("2026-01-15T10:30:00");
    const invalidDate = new Date("invalid");
    const nullDate = null;

    return (
      <div>
        <h3>Safe ISO String Conversion</h3>
        <DateUtilDisplay
          label="Valid Date"
          value={safeToISOString(validDate) || "N/A"}
        />
        <DateUtilDisplay
          label="Invalid Date"
          value={safeToISOString(invalidDate) || "N/A"}
        />
        <DateUtilDisplay
          label="Null Date"
          value={safeToISOString(nullDate) || "N/A"}
        />
        <h3>ISO String with Default</h3>
        <DateUtilDisplay
          label="Valid Date"
          value={toISOStringOrDefault(validDate, "No date")}
        />
        <DateUtilDisplay
          label="Invalid Date (fallback)"
          value={toISOStringOrDefault(invalidDate, "No date")}
        />
        <DateUtilDisplay
          label="Null Date (fallback)"
          value={toISOStringOrDefault(nullDate, "No date")}
        />
      </div>
    );
  },
};

export const DateValidation: Story = {
  render: () => {
    const validDate = new Date("2026-01-15");
    const invalidDate = new Date("invalid");
    const nullDate = null;

    return (
      <div>
        <h3>Date Validation</h3>
        <div
          style={{
            marginBottom: "12px",
            padding: "8px",
            backgroundColor: isValidDate(validDate) ? "#d4edda" : "#f8d7da",
            border: `1px solid ${
              isValidDate(validDate) ? "#c3e6cb" : "#f5c6cb"
            }`,
            borderRadius: "4px",
          }}
        >
          <strong>Valid Date Object:</strong>{" "}
          {isValidDate(validDate) ? "✅ Valid" : "❌ Invalid"}
        </div>
        <div
          style={{
            marginBottom: "12px",
            padding: "8px",
            backgroundColor: isValidDate(invalidDate) ? "#d4edda" : "#f8d7da",
            border: `1px solid ${
              isValidDate(invalidDate) ? "#c3e6cb" : "#f5c6cb"
            }`,
            borderRadius: "4px",
          }}
        >
          <strong>Invalid Date Object:</strong>{" "}
          {isValidDate(invalidDate) ? "✅ Valid" : "❌ Invalid"}
        </div>
        <div
          style={{
            marginBottom: "12px",
            padding: "8px",
            backgroundColor: isValidDate(nullDate) ? "#d4edda" : "#f8d7da",
            border: `1px solid ${
              isValidDate(nullDate) ? "#c3e6cb" : "#f5c6cb"
            }`,
            borderRadius: "4px",
          }}
        >
          <strong>Null Date:</strong>{" "}
          {isValidDate(nullDate) ? "✅ Valid" : "❌ Invalid"}
        </div>
      </div>
    );
  },
};

export const DateInputFormatting: Story = {
  render: () => {
    const date = new Date("2026-01-15T10:30:00");
    const today = getTodayDateInputValue();

    return (
      <div>
        <h3>Date Input Value (YYYY-MM-DD)</h3>
        <DateUtilDisplay
          label="Date to Input Value"
          value={toDateInputValue(date) || "N/A"}
        />
        <DateUtilDisplay label="Today's Input Value" value={today} />
        <div style={{ marginTop: "20px" }}>
          <h4>Example Usage:</h4>
          <input
            type="date"
            value={toDateInputValue(date) || ""}
            readOnly
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>
    );
  },
};

export const SafeDateConversion: Story = {
  render: () => {
    const validString = "2026-01-15";
    const validTimestamp = Date.now();
    const validDate = new Date();
    const invalidString = "invalid-date";
    const nullValue = null;

    return (
      <div>
        <h3>Safe Date Conversion</h3>
        <DateUtilDisplay
          label="From ISO String"
          value={safeToDate(validString)?.toLocaleString() || "N/A"}
        />
        <DateUtilDisplay
          label="From Timestamp"
          value={safeToDate(validTimestamp)?.toLocaleString() || "N/A"}
        />
        <DateUtilDisplay
          label="From Date Object"
          value={safeToDate(validDate)?.toLocaleString() || "N/A"}
        />
        <DateUtilDisplay
          label="From Invalid String"
          value={safeToDate(invalidString)?.toLocaleString() || "N/A"}
        />
        <DateUtilDisplay
          label="From Null"
          value={safeToDate(nullValue)?.toLocaleString() || "N/A"}
        />
      </div>
    );
  },
};

export const PracticalExamples: Story = {
  render: () => {
    const birthDate = new Date("1990-05-15");
    const appointmentDate = new Date("2026-02-20T14:30:00");
    const expiryDate = new Date("2027-12-31");

    return (
      <div>
        <h3>Practical Usage Examples</h3>
        <div style={{ marginBottom: "16px" }}>
          <strong>Date of Birth:</strong>
          <div>
            <code>ISO: {safeToISOString(birthDate) || "N/A"}</code>
          </div>
          <div>
            <code>Input: {toDateInputValue(birthDate) || "N/A"}</code>
          </div>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <strong>Appointment:</strong>
          <div>
            <code>
              {appointmentDate.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </code>
          </div>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <strong>Expiry Date:</strong>
          <div>
            <code>{toDateInputValue(expiryDate) || "N/A"}</code>
          </div>
          <div>
            <code>Valid: {isValidDate(expiryDate) ? "Yes" : "No"}</code>
          </div>
        </div>
      </div>
    );
  },
};
