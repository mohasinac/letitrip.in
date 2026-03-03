# Fix raw HTML tags in FAQ/products/checkout/cart component files
$base = "D:\proj\letitrip.in\src\components"

function Fix-File {
  param($path, $addComponents, $removeLink, $fixRouter)
  
  $c = Get-Content $path -Raw
  
  # Tag replacements (raw content with multiline support)
  $c = $c -replace '<p(\s|>)', '<Text$1'
  $c = $c -replace '</p>', '</Text>'
  $c = $c -replace '<h1(\s|>)', '<Heading level={1}$1'
  $c = $c -replace '<h2(\s|>)', '<Heading level={2}$1'
  $c = $c -replace '<h3(\s|>)', '<Heading level={3}$1'
  $c = $c -replace '</h1>', '</Heading>'
  $c = $c -replace '</h2>', '</Heading>'
  $c = $c -replace '</h3>', '</Heading>'
  $c = $c -replace '<button(\s|>)', '<Button$1'
  $c = $c -replace '</button>', '</Button>'
  
  if ($removeLink) {
    $c = $c -replace 'import Link from "next/link";\r?\n', ''
    $c = $c -replace '<Link(\s)', '<TextLink$1'
    $c = $c -replace '</Link>', '</TextLink>'
  }
  
  if ($fixRouter) {
    $c = $c -replace 'from "next/navigation"', 'from "@/i18n/navigation"'
  }
  
  # Update @/components import
  if ($addComponents.Count -gt 0) {
    $existingMatch = [regex]::Match($c, 'import \{([^}]+)\} from "@/components"')
    if ($existingMatch.Success) {
      $existing = $existingMatch.Groups[1].Value -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
      $allComponents = ($existing + $addComponents) | Sort-Object -Unique
      $newImport = 'import { ' + ($allComponents -join ', ') + ' } from "@/components"'
      $c = $c.Replace($existingMatch.Value, $newImport)
    } else {
      # Add after last import line using regex
      $sorted = ($addComponents | Sort-Object -Unique)
      $newImportLine = 'import { ' + ($sorted -join ', ') + ' } from "@/components";'
      # Insert before the first blank line after the last import
      $lines = $c -split "`n"
      $lastImportIdx = -1
      for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^import ') { $lastImportIdx = $i }
      }
      if ($lastImportIdx -ge 0) {
        $lines = $lines[0..$lastImportIdx] + @($newImportLine) + $lines[($lastImportIdx+1)..($lines.Count-1)]
        $c = $lines -join "`n"
      }
    }
  }
  
  Set-Content $path $c -NoNewline
  Write-Host "Fixed: $(Split-Path $path -Leaf)"
}

# PromoCodeInput.tsx: Button already imported, just tag replacements
Fix-File "$base\cart\PromoCodeInput.tsx" @() $false $false

# CheckoutView.tsx: add Button
Fix-File "$base\checkout\CheckoutView.tsx" @("Button") $false $false

# OrderSuccessActions.tsx: add TextLink, remove Link
Fix-File "$base\checkout\OrderSuccessActions.tsx" @("TextLink") $true $false

# FAQAccordion.tsx: add Button, Heading, Text
Fix-File "$base\faq\FAQAccordion.tsx" @("Button","Heading","Text") $false $false

# FAQCategorySidebar.tsx: add Heading, Text, TextLink, remove Link
Fix-File "$base\faq\FAQCategorySidebar.tsx" @("Heading","Text","TextLink") $true $false

# FAQHelpfulButtons.tsx: add Button, Text
Fix-File "$base\faq\FAQHelpfulButtons.tsx" @("Button","Text") $false $false

# FAQPageContent.tsx: add Button, Heading, Text; fix useRouter
Fix-File "$base\faq\FAQPageContent.tsx" @("Button","Heading","Text") $false $true

# FAQSearchBar.tsx: add Button
Fix-File "$base\faq\FAQSearchBar.tsx" @("Button") $false $false

# RelatedFAQs.tsx: add Heading, Text, TextLink, remove Link
Fix-File "$base\faq\RelatedFAQs.tsx" @("Heading","Text","TextLink") $true $false

# AddToCartButton.tsx: add Button
Fix-File "$base\products\AddToCartButton.tsx" @("Button") $false $false

# ProductImageGallery.tsx: add Button
Fix-File "$base\products\ProductImageGallery.tsx" @("Button") $false $false

Write-Host "`nVerifying..."
$allOk = $true
$targets = @("cart\PromoCodeInput.tsx","checkout\CheckoutView.tsx","checkout\OrderSuccessActions.tsx","faq\FAQAccordion.tsx","faq\FAQCategorySidebar.tsx","faq\FAQHelpfulButtons.tsx","faq\FAQPageContent.tsx","faq\FAQSearchBar.tsx","faq\RelatedFAQs.tsx","products\AddToCartButton.tsx","products\ProductImageGallery.tsx")
foreach ($t in $targets) {
  $hits = Select-String -CaseSensitive -Path "$base\$t" -Pattern '<p[\s>]|</p>|<h[1-6][\s>]|</h[1-6]>|<button[\s>]|</button>|import Link from|from "next/navigation"' | Measure-Object | Select-Object -ExpandProperty Count
  if ($hits -gt 0) { Write-Host "REMAINING: $t => $hits"; $allOk = $false }
}
if ($allOk) { Write-Host "ALL CLEAN - Task 9 complete" }
