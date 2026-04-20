import { AuthStatusPanel } from "@mohasinac/appkit/client";

export default function Page() {
  return (
    <AuthStatusPanel
      tone="success"
      title="Account closed"
      message="Your account has been successfully closed."
    />
  );
}