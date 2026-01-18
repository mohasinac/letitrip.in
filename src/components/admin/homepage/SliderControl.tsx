"use client";

import { SliderControl as LibrarySliderControl } from "@letitrip/react-library";

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function SliderControl(props: SliderControlProps) {
  return <LibrarySliderControl {...props} />;
}
