"use client";

import { formatPrice } from "@letitrip/react-library";
import {
  FormLabel,
  AutoBidSetup as LibAutoBidSetup,
  type AutoBidSetupProps as LibAutoBidSetupProps,
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
