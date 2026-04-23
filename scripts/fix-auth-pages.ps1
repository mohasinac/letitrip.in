$b = "d:\proj\letitrip.in\src\app\[locale]"
function W($rel, $txt) {
  $path = Join-Path $b $rel
  [System.IO.File]::WriteAllText($path, $txt, [System.Text.Encoding]::UTF8)
  Write-Host "OK: $rel"
}

W "auth\login\page.tsx" 'import { LoginPageClient } from "@/components/auth/LoginPageClient";

export default function Page() {
  return <LoginPageClient />;
}
'

W "auth\register\page.tsx" 'import { RegisterPageClient } from "@/components/auth/RegisterPageClient";

export default function Page() {
  return <RegisterPageClient />;
}
'

W "auth\forgot-password\page.tsx" 'import { ForgotPasswordPageClient } from "@/components/auth/ForgotPasswordPageClient";

export default function Page() {
  return <ForgotPasswordPageClient />;
}
'

W "auth\reset-password\page.tsx" 'import { ResetPasswordPageClient } from "@/components/auth/ResetPasswordPageClient";

export default function Page() {
  return <ResetPasswordPageClient />;
}
'

W "auth\verify-email\page.tsx" 'import { Suspense } from "react";
import { VerifyEmailPageClient } from "@/components/auth/VerifyEmailPageClient";

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailPageClient />
    </Suspense>
  );
}
'

Write-Host "Auth pages updated"
