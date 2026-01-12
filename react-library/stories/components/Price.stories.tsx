import type { Meta, StoryObj } from "@storybook/react";
import { Price } from "../../src/components/values/Price";

const meta = {
  title: "Components/Values/Price",
  component: Price,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Price display component with Indian Rupee formatting, discounts, and responsive sizing.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Price>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    amount: 1499.99,
  },
};

export const WithoutDecimals: Story = {
  args: {
    amount: 1499,
    showDecimals: false,
  },
};

export const WithDiscount: Story = {
  args: {
    amount: 1499,
    originalPrice: 1999,
  },
};

export const LargePrice: Story = {
  args: {
    amount: 150000,
    size: "lg",
  },
};

export const SmallPrice: Story = {
  args: {
    amount: 499,
    size: "sm",
  },
};

export const ExtraLargePrice: Story = {
  args: {
    amount: 2499,
    size: "xl",
    showDecimals: false,
  },
};

export const HighDiscount: Story = {
  args: {
    amount: 999,
    originalPrice: 2999,
    size: "lg",
  },
};

export const PriceSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <strong>Extra Small:</strong>
        <br />
        <Price amount={499} size="xs" />
      </div>
      <div>
        <strong>Small:</strong>
        <br />
        <Price amount={1499} size="sm" />
      </div>
      <div>
        <strong>Medium (default):</strong>
        <br />
        <Price amount={2499} size="md" />
      </div>
      <div>
        <strong>Large:</strong>
        <br />
        <Price amount={9999} size="lg" />
      </div>
      <div>
        <strong>Extra Large:</strong>
        <br />
        <Price amount={15000} size="xl" />
      </div>
    </div>
  ),
};

export const WithDiscounts: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <strong>10% Off:</strong>
        <br />
        <Price amount={1799} originalPrice={1999} />
      </div>
      <div>
        <strong>25% Off:</strong>
        <br />
        <Price amount={1499} originalPrice={1999} />
      </div>
      <div>
        <strong>50% Off:</strong>
        <br />
        <Price amount={999} originalPrice={1999} size="lg" />
      </div>
      <div>
        <strong>70% Off (Large):</strong>
        <br />
        <Price amount={599} originalPrice={1999} size="lg" />
      </div>
    </div>
  ),
};

export const PriceRanges: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <strong>Budget (under ₹500):</strong>
        <br />
        <Price amount={399} />
      </div>
      <div>
        <strong>Mid-range (₹500-₹2000):</strong>
        <br />
        <Price amount={1499} />
      </div>
      <div>
        <strong>Premium (₹2000-₹10000):</strong>
        <br />
        <Price amount={7499} size="lg" />
      </div>
      <div>
        <strong>Luxury (₹10000+):</strong>
        <br />
        <Price amount={25000} size="xl" showDecimals={false} />
      </div>
    </div>
  ),
};
