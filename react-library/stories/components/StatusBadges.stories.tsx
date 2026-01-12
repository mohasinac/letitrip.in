import type { Meta, StoryObj } from "@storybook/react";
import { AuctionStatus } from "../../src/components/values/AuctionStatus";
import { PaymentStatus } from "../../src/components/values/PaymentStatus";
import { ShippingStatus } from "../../src/components/values/ShippingStatus";
import { StockStatus } from "../../src/components/values/StockStatus";

// StockStatus Stories
const stockMeta = {
  title: "Components/Values/StockStatus",
  component: StockStatus,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof StockStatus>;

export default stockMeta;

export const InStock: StoryObj<typeof StockStatus> = {
  args: {
    stock: 50,
  },
};

export const LowStock: StoryObj<typeof StockStatus> = {
  args: {
    stock: 5,
  },
};

export const OutOfStock: StoryObj<typeof StockStatus> = {
  args: {
    stock: 0,
  },
};

// AuctionStatus Stories
export const AuctionActive: StoryObj = {
  render: () => <AuctionStatus status="active" />,
};

export const AuctionEnded: StoryObj = {
  render: () => <AuctionStatus status="ended" />,
};

export const AuctionUpcoming: StoryObj = {
  render: () => <AuctionStatus status="upcoming" />,
};

// PaymentStatus Stories
export const PaymentPending: StoryObj = {
  render: () => <PaymentStatus status="pending" />,
};

export const PaymentCompleted: StoryObj = {
  render: () => <PaymentStatus status="completed" />,
};

export const PaymentFailed: StoryObj = {
  render: () => <PaymentStatus status="failed" />,
};

// ShippingStatus Stories
export const ShippingPending: StoryObj = {
  render: () => <ShippingStatus status="pending" />,
};

export const ShippingShipped: StoryObj = {
  render: () => <ShippingStatus status="shipped" />,
};

export const ShippingDelivered: StoryObj = {
  render: () => <ShippingStatus status="delivered" />,
};

// All Status Types
export const AllStatuses: StoryObj = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3>Stock Status</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <StockStatus stock={50} />
          <StockStatus stock={5} />
          <StockStatus stock={0} />
        </div>
      </div>

      <div>
        <h3>Auction Status</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <AuctionStatus status="active" />
          <AuctionStatus status="ended" />
          <AuctionStatus status="upcoming" />
        </div>
      </div>

      <div>
        <h3>Payment Status</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <PaymentStatus status="pending" />
          <PaymentStatus status="completed" />
          <PaymentStatus status="failed" />
          <PaymentStatus status="refunded" />
        </div>
      </div>

      <div>
        <h3>Shipping Status</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <ShippingStatus status="pending" />
          <ShippingStatus status="processing" />
          <ShippingStatus status="shipped" />
          <ShippingStatus status="delivered" />
          <ShippingStatus status="cancelled" />
        </div>
      </div>
    </div>
  ),
};
