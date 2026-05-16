import { PrintCenterView } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <PrintCenterView
      store={null}
      publicBaseUrl={process.env.NEXT_PUBLIC_SITE_URL ?? "https://letitrip.in"}
    />
  );
}