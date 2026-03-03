# Fix raw HTML tags in UI/forms/modal primitive files
$base = "D:\proj\letitrip.in\src\components"

# --- forms/Input.tsx, Select.tsx, Textarea.tsx: <p> → <Text> ---
foreach ($name in @("Input.tsx","Select.tsx","Textarea.tsx")) {
  $file = "$base\forms\$name"
  $c = Get-Content $file -Raw
  # Replace <p ...> blocks (error + helper text)
  $c = $c -replace '<p(\s)', '<Text$1'
  $c = $c -replace '</p>', '</Text>'
  # Add Text to the existing typography import
  $c = $c -replace 'import \{ Label \} from "\.\./typography/Typography"', 'import { Label, Text } from "../typography/Typography"'
  Set-Content $file $c -NoNewline
  Write-Host "Fixed: forms/$name"
}

# --- forms/Toggle.tsx: <button> → <Button> ---
$file = "$base\forms\Toggle.tsx"
$c = Get-Content $file -Raw
$c = $c -replace '<button(\s)', '<Button$1'
$c = $c -replace '</button>', '</Button>'
$c = $c -replace '(import \{ THEME_CONSTANTS \} from "@/constants";)', '$1
import { Button } from "../ui/Button";'
Set-Content $file $c -NoNewline
Write-Host "Fixed: forms/Toggle.tsx"

# --- feedback/Modal.tsx: <h2> → <Heading>, <button> → <Button> ---
$file = "$base\feedback\Modal.tsx"
$c = Get-Content $file -Raw
$c = $c -replace '<h2(\s)', '<Heading level={2}$1'
$c = $c -replace '</h2>', '</Heading>'
$c = $c -replace '<button(\s)', '<Button$1'
$c = $c -replace '</button>', '</Button>'
# Add imports after THEME_CONSTANTS import
$c = $c -replace '(import \{ THEME_CONSTANTS, UI_LABELS \} from "@/constants";)', '$1
import { Heading } from "../typography/Typography";
import { Button } from "../ui/Button";'
Set-Content $file $c -NoNewline
Write-Host "Fixed: feedback/Modal.tsx"

# --- modals/ImageCropModal.tsx: <button> → <Button> (Button already imported) ---
$file = "$base\modals\ImageCropModal.tsx"
$c = Get-Content $file -Raw
$c = $c -replace '<button(\s)', '<Button$1'
$c = $c -replace '</button>', '</Button>'
Set-Content $file $c -NoNewline
Write-Host "Fixed: modals/ImageCropModal.tsx"

# --- modals/UnsavedChangesModal.tsx: <h2> → <Heading>, <p> → <Text> ---
$file = "$base\modals\UnsavedChangesModal.tsx"
$c = Get-Content $file -Raw
$c = $c -replace '<h2(\s)', '<Heading level={2}$1'
$c = $c -replace '</h2>', '</Heading>'
$c = $c -replace '<p(\s)', '<Text$1'
$c = $c -replace '</p>', '</Text>'
# Add Heading, Text to existing @/components import
$c = $c -replace 'import \{ Button, Card \} from "@/components"', 'import { Button, Card, Heading, Text } from "@/components"'
Set-Content $file $c -NoNewline
Write-Host "Fixed: modals/UnsavedChangesModal.tsx"

Write-Host "`nVerifying..."
$allOk = $true
$targets = @(
  "forms\Input.tsx","forms\Select.tsx","forms\Textarea.tsx","forms\Toggle.tsx",
  "feedback\Modal.tsx","modals\ImageCropModal.tsx","modals\UnsavedChangesModal.tsx"
)
foreach ($t in $targets) {
  $hits = Select-String -CaseSensitive -Path "$base\$t" -Pattern '<p[\s>]|</p>|<h[0-6][\s>]|</h[0-6]>|<button[\s>]|</button>' | Measure-Object | Select-Object -ExpandProperty Count
  if ($hits -gt 0) { Write-Host "REMAINING: $t => $hits"; $allOk = $false }
}
if ($allOk) { Write-Host "ALL CLEAN - Task 8 complete" }
