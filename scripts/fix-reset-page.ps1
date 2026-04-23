$p = Join-Path "d:\proj\letitrip.in\src\app\[locale]\auth" "reset-password\page.tsx"
[System.IO.File]::WriteAllText($p, 'import { Suspense } from "react";
import { ResetPasswordPageClient } from "@/components/auth/ResetPasswordPageClient";

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
', [System.Text.Encoding]::UTF8)
Write-Host "done"
