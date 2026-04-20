import { AuthStatusPanel } from "@mohasinac/appkit";

export default function Page() {
  return (
    <AuthStatusPanel
      tone="success"
      title="Account closed"
      message="Your account has been successfully closed."
    />
  );
}