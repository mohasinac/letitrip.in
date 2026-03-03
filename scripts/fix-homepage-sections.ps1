# Fix raw HTML tags and navigation imports in homepage sections + ContactCTA
$base = "D:\proj\letitrip.in\src"
$files = @(
  "$base\components\homepage\AdvertisementBanner.tsx",
  "$base\components\homepage\BlogArticlesSection.tsx",
  "$base\components\homepage\CustomerReviewsSection.tsx",
  "$base\components\homepage\FAQSection.tsx",
  "$base\components\homepage\FeaturedAuctionsSection.tsx",
  "$base\components\homepage\FeaturedProductsSection.tsx",
  "$base\components\homepage\HeroCarousel.tsx",
  "$base\components\homepage\HomepageSkeleton.tsx",
  "$base\components\homepage\SiteFeaturesSection.tsx",
  "$base\components\homepage\TopCategoriesSection.tsx",
  "$base\components\homepage\TrustFeaturesSection.tsx",
  "$base\components\homepage\TrustIndicatorsSection.tsx",
  "$base\components\homepage\WelcomeSection.tsx",
  "$base\components\homepage\WhatsAppCommunitySection.tsx",
  "$base\components\faq\ContactCTA.tsx"
)

foreach ($file in $files) {
  $name = Split-Path $file -Leaf
  $content = Get-Content $file -Raw

  # --- Tag replacements ---
  $content = $content -replace '<section(\s|>)', '<Section$1'
  $content = $content -replace '</section>', '</Section>'
  $content = $content -replace '<h1(\s|>)', '<Heading level={1}$1'
  $content = $content -replace '<h2(\s|>)', '<Heading level={2}$1'
  $content = $content -replace '<h3(\s|>)', '<Heading level={3}$1'
  $content = $content -replace '</h1>', '</Heading>'
  $content = $content -replace '</h2>', '</Heading>'
  $content = $content -replace '</h3>', '</Heading>'
  $content = $content -replace '<button(\s|>)', '<Button$1'
  $content = $content -replace '</button>', '</Button>'
  # Link -> TextLink (JSX tags)
  $content = $content -replace '<Link(\s)', '<TextLink$1'
  $content = $content -replace '</Link>', '</TextLink>'

  # --- Navigation imports ---
  # Replace 'next/navigation' only if importing useRouter or usePathname (not useParams/useSearchParams alone)
  if ($content -match 'from "next/navigation"') {
    if ($content -match '(useRouter|usePathname)') {
      $content = $content -replace 'from "next/navigation"', 'from "@/i18n/navigation"'
    }
  }
  # Remove 'import Link from "next/link"' line
  $content = $content -replace 'import Link from "next/link";\r?\n', ''

  # --- Update @/components import ---
  # Determine which components are needed
  $needsSection = $content -match '<Section'
  $needsHeading = $content -match '<Heading'
  $needsButton  = ($content -match '<Button' -and $content -notmatch 'import.*Button.*from')
  $needsTextLink = $content -match '<TextLink'

  # Build set of needed additions
  $toAdd = @()
  if ($needsSection)  { $toAdd += "Section" }
  if ($needsHeading)  { $toAdd += "Heading" }
  if ($needsTextLink) { $toAdd += "TextLink" }
  # Button handled separately since some files already have it

  if ($content -match 'import \{[^}]+\} from "@/components(?:/ui)?"') {
    # Extract existing imports
    $match = [regex]::Match($content, 'import \{([^}]+)\} from "@/components(?:/ui)?"')
    $existing = $match.Groups[1].Value -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
    
    # Add missing ones
    $needsButtonAdd = ($needsButton -or ($content -match '<Button' -and $existing -notcontains 'Button'))
    
    $newComponents = @()
    foreach ($c in $toAdd) { if ($existing -notcontains $c) { $newComponents += $c } }
    if ($needsButtonAdd -and $existing -notcontains 'Button') { $newComponents += 'Button' }
    
    if ($newComponents.Count -gt 0) {
      $allComponents = ($existing + $newComponents) | Sort-Object
      $newImport = "import { $($allComponents -join ', ') } from `"@/components`""
      # Replace the old import (handle both /ui and normal)
      $content = $content -replace 'import \{[^}]+\} from "@/components(?:/ui)?"', $newImport
    } else {
      # Still fix /ui -> /components if needed
      $content = $content -replace 'from "@/components/ui"', 'from "@/components"'
    }
  } else {
    # No @/components import at all - add one
    $needsButtonAdd = $content -match '<Button'
    $newComponents = @()
    foreach ($c in $toAdd) { $newComponents += $c }
    if ($needsButtonAdd) { $newComponents += 'Button' }
    
    if ($newComponents.Count -gt 0) {
      $allComponents = $newComponents | Sort-Object
      $newImportLine = "import { $($allComponents -join ', ') } from `"@/components`";`r`n"
      # Insert after the last import line
      $content = $content -replace '(import .+;\r?\n)(?!import )', "`$1$newImportLine"
    }
  }

  Set-Content $file $content -NoNewline
  Write-Host "Fixed: $name"
}
Write-Host "`nDone! Verifying residual violations..."
foreach ($file in $files) {
  $name = Split-Path $file -Leaf
  $hits = Select-String -Path $file -Pattern '<section|</section>|<h[1-6][\s>]|</h[1-6]>|<button[\s>]|</button>|from "next/navigation"' | Measure-Object | Select-Object -ExpandProperty Count
  if ($hits -gt 0) { Write-Host "REMAINING: $name => $hits hits" }
}
Write-Host "Verification complete."
