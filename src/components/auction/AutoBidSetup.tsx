"use client";

import { formatPrice } from "@/lib/price.utils";
import {
  AutoBidSetup as LibAutoBidSetup,
  type AutoBidSetupProps as LibAutoBidSetupProps,
  FormLabel,
} from "@letitrip/react-library";

export type AutoBidSetupProps = Omit<
  LibAutoBidSetupProps,
  "formatPrice" | "FormLabelComponent"
>;

export function AutoBidSetup(props: AutoBidSetupProps) {
  return (
    <LibAutoBidSetup
      {...props}
      formatPrice={formatPrice}
      FormLabelComponent={FormLabel}
    />
  );
}

export default AutoBidSetup;
