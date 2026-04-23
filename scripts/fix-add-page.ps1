$path = "d:\proj\letitrip.in\src\app\[locale]\user\addresses\add\page.tsx"
$content = 'import { UserAddressesView } from "@mohasinac/appkit";

export default function Page() {
  return <UserAddressesView />;
}
'
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Fixed"
