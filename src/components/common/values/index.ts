/**
 * Common Value Display Components
 *
 * These components provide consistent formatting and display for common data types
 * across the application. Use these instead of raw strings or inline formatting.
 *
 * @see Doc 32 - Common Value Components
 */

// Price & Currency
export { Price, CompactPrice } from "./Price";
export { Currency } from "./Currency";

// Dates & Time
export { DateDisplay, RelativeDate, DateRange } from "./DateDisplay";
export { TimeRemaining } from "./TimeRemaining";

// Contact Info
export { PhoneNumber } from "./PhoneNumber";
export { Email } from "./Email";
export { Address } from "./Address";

// Order & Status
export { OrderId } from "./OrderId";
export { ShippingStatus } from "./ShippingStatus";
export { PaymentStatus } from "./PaymentStatus";

// Product Info
export { Rating } from "./Rating";
export { StockStatus } from "./StockStatus";
export { SKU } from "./SKU";
export { Weight } from "./Weight";
export { Dimensions } from "./Dimensions";
export { Quantity } from "./Quantity";

// Auction Info
export { BidCount } from "./BidCount";
export { AuctionStatus } from "./AuctionStatus";

// Text & Numbers
export { Percentage } from "./Percentage";
export { TruncatedText } from "./TruncatedText";
