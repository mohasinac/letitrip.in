"use client";

import { BusinessAddressStep as LibraryBusinessAddressStep, type BusinessAddressStepProps as LibraryBusinessAddressStepProps } from "@letitrip/react-library";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { logError } from "@/lib/error-logger";
import { INDIAN_STATES } from "@/constants/location";

export type BusinessAddressStepProps = Omit<LibraryBusinessAddressStepProps, "states" | "GPSButtonIcon" | "onGPSError" | "onGPSSuccess">;

export function BusinessAddressStep(props: BusinessAddressStepProps) {
  return (
    <LibraryBusinessAddressStep
      {...props}
      states={INDIAN_STATES}
      GPSButtonIcon={<MapPin className="w-4 h-4" />}
      onGPSSuccess={() => toast.success("GPS location captured")}
      onGPSError={(error) => {
        logError(error, { component: "BusinessAddressStep.getCurrentLocation" });
        toast.error("Failed to get GPS location");
      }}
    />
  );
}
