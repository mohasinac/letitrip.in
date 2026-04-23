import { PolicyPageView } from "@mohasinac/appkit";

export const revalidate = 3600;

export default function Page() {
  return <PolicyPageView policy="refund" />;
}
