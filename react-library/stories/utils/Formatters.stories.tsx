import type { Meta, StoryObj } from "@storybook/react";
import {
  formatAddress,
  formatBankAccount,
  formatBoolean,
  formatCardNumber,
  formatCompactCurrency,
  formatCompactNumber,
  formatDate,
  formatDateRange,
  formatDuration,
  formatFileSize,
  formatList,
  formatNumber,
  formatOrderId,
  formatPercentage,
  formatPhoneNumber,
  formatPincode,
  formatRating,
  formatRelativeTime,
  formatReviewCount,
  formatShopId,
  formatSKU,
  formatStockStatus,
  formatTimeRemaining,
  formatUPI,
  slugToTitle,
  truncateText,
} from "../../src/utils/formatters";

const meta = {
  title: "Utils/Formatters",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Comprehensive formatting utilities for Indian context. Includes currency, dates, numbers, and text formatting.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to display formatted output
const FormatDisplay = ({ label, value }: { label: string; value: string }) => (
  <div style={{ marginBottom: "16px" }}>
    <strong>{label}:</strong> <code>{value}</code>
  </div>
);

export const CurrencyFormatting: Story = {
  render: () => (
    <div>
      <h3>Currency Formatting (Indian Numbering)</h3>
      <FormatDisplay label="₹1,499" value={formatCompactCurrency(1499)} />
      <FormatDisplay label="₹15,000" value={formatCompactCurrency(15000)} />
      <FormatDisplay
        label="₹1,50,000 (1.5L)"
        value={formatCompactCurrency(150000)}
      />
      <FormatDisplay
        label="₹10,00,000 (10L)"
        value={formatCompactCurrency(1000000)}
      />
      <FormatDisplay
        label="₹1,00,00,000 (1Cr)"
        value={formatCompactCurrency(10000000)}
      />
    </div>
  ),
};

export const DateFormatting: Story = {
  render: () => {
    const now = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return (
      <div>
        <h3>Date Formatting</h3>
        <FormatDisplay
          label="Short"
          value={formatDate(now, { format: "short" })}
        />
        <FormatDisplay
          label="Medium"
          value={formatDate(now, { format: "medium" })}
        />
        <FormatDisplay
          label="Long"
          value={formatDate(now, { format: "long" })}
        />
        <FormatDisplay
          label="With Time"
          value={formatDate(now, { format: "medium", includeTime: true })}
        />
        <h3>Relative Time</h3>
        <FormatDisplay label="Now" value={formatRelativeTime(now)} />
        <FormatDisplay
          label="Yesterday"
          value={formatRelativeTime(yesterday)}
        />
        <FormatDisplay label="Last Week" value={formatRelativeTime(lastWeek)} />
      </div>
    );
  },
};

export const NumberFormatting: Story = {
  render: () => (
    <div>
      <h3>Number Formatting</h3>
      <FormatDisplay
        label="Indian System"
        value={formatNumber(1234567, { locale: "en-IN" })}
      />
      <FormatDisplay label="Compact 1K" value={formatCompactNumber(1000)} />
      <FormatDisplay
        label="Compact 1.5M"
        value={formatCompactNumber(1500000)}
      />
      <FormatDisplay
        label="Compact 2.3B"
        value={formatCompactNumber(2300000000)}
      />
      <FormatDisplay label="Percentage" value={formatPercentage(0.755)} />
      <FormatDisplay
        label="Percentage (1 decimal)"
        value={formatPercentage(0.755, { decimals: 1 })}
      />
    </div>
  ),
};

export const IndianFormatting: Story = {
  render: () => (
    <div>
      <h3>India-Specific Formatting</h3>
      <FormatDisplay
        label="Phone Number"
        value={formatPhoneNumber("+919876543210")}
      />
      <FormatDisplay label="Pincode" value={formatPincode("560001")} />
      <FormatDisplay label="UPI ID" value={formatUPI("user@paytm")} />
      <FormatDisplay
        label="Bank Account"
        value={formatBankAccount("1234567890123456")}
      />
    </div>
  ),
};

export const FileAndDuration: Story = {
  render: () => (
    <div>
      <h3>File Size & Duration</h3>
      <FormatDisplay label="1.5 MB" value={formatFileSize(1500000)} />
      <FormatDisplay label="500 KB" value={formatFileSize(500000)} />
      <FormatDisplay label="2.3 GB" value={formatFileSize(2300000000)} />
      <FormatDisplay label="5m 30s" value={formatDuration(330)} />
      <FormatDisplay label="1h 45m" value={formatDuration(6300)} />
      <FormatDisplay label="2d 3h" value={formatDuration(183600)} />
    </div>
  ),
};

export const BusinessFormatting: Story = {
  render: () => (
    <div>
      <h3>Business-Specific Formatting</h3>
      <FormatDisplay label="Order ID" value={formatOrderId("ABC123XYZ")} />
      <FormatDisplay label="Shop ID" value={formatShopId("shop456")} />
      <FormatDisplay label="SKU" value={formatSKU("prod-abc-123")} />
      <FormatDisplay label="Rating" value={formatRating(4.5, 5)} />
      <FormatDisplay label="Review Count" value={formatReviewCount(1234)} />
      <FormatDisplay label="Stock Status" value={formatStockStatus(15)} />
      <FormatDisplay label="Out of Stock" value={formatStockStatus(0)} />
    </div>
  ),
};

export const TextFormatting: Story = {
  render: () => (
    <div>
      <h3>Text Formatting</h3>
      <FormatDisplay
        label="Truncate"
        value={truncateText(
          "This is a very long text that needs to be truncated",
          30
        )}
      />
      <FormatDisplay
        label="Slug to Title"
        value={slugToTitle("hello-world-from-india")}
      />
      <FormatDisplay
        label="Card Number"
        value={formatCardNumber("1234567812345678")}
      />
      <FormatDisplay label="Boolean Yes" value={formatBoolean(true)} />
      <FormatDisplay label="Boolean No" value={formatBoolean(false)} />
      <FormatDisplay
        label="List (3 items)"
        value={formatList(["Apple", "Banana", "Cherry"])}
      />
    </div>
  ),
};

export const AddressAndRange: Story = {
  render: () => {
    const address = {
      street: "123 Main Street",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      country: "India",
    };
    const start = new Date("2026-01-01");
    const end = new Date("2026-01-15");

    return (
      <div>
        <h3>Address & Date Range</h3>
        <div style={{ marginBottom: "16px" }}>
          <strong>Address:</strong>
          <pre>{formatAddress(address)}</pre>
        </div>
        <FormatDisplay label="Date Range" value={formatDateRange(start, end)} />
        <FormatDisplay
          label="Time Remaining (1d 5h)"
          value={formatTimeRemaining(new Date(Date.now() + 105600000))}
        />
      </div>
    );
  },
};
