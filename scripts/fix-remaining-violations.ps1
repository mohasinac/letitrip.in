$ErrorActionPreference = 'Stop'
Set-Location "D:\proj\letitrip.in"

# Files completely exempt (they ARE the primitive implementations)
$exemptFiles = @('Semantic.tsx','TextLink.tsx','Typography.tsx','Button.tsx','Text.tsx')
# Files where <label> should NOT be replaced (it IS the component's wrapper element)
$keepLabelFiles = @('Checkbox.tsx')

$stats = @{ changed = 0; skipped = 0 }

# Fetch all tsx files across components, features, and app pages
$files = Get-ChildItem 'src\components','src\features','src\app\[locale]' -Recurse -Filter '*.tsx' |
         Where-Object { $_.FullName -notmatch '__tests__' -and $_.Name -notin $exemptFiles }

foreach ($file in $files) {
  $orig = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $c    = $orig

  # ── Tag replacement (regex-based to handle multi-line opening tags) ────────
  # Use negative lookahead to avoid matching already-capitalised tags
  $c = $c -creplace '<span(?=[\s>\/])',  '<Span'
  $c = $c -creplace '</span>',            '</Span>'

  $c = $c -creplace '<p(?=[\s>\/])',     '<Text'
  $c = $c -creplace '</p>',              '</Text>'

  $c = $c -creplace '<ul(?=[\s>\/])',    '<Ul'
  $c = $c -creplace '</ul>',             '</Ul>'
  $c = $c -creplace '<li(?=[\s>\/])',    '<Li'
  $c = $c -creplace '</li>',             '</Li>'

  # <label> — skip if this file IS the checkbox/form implementation
  if ($file.Name -notin $keepLabelFiles) {
    $c = $c -creplace '<label(?=[\s>\/])', '<Label'
    $c = $c -creplace '</label>',           '</Label>'
  }

  if ($c -ceq $orig) { $stats.skipped++; continue }

  # ── Determine which new components are used ──────────────────────────────────
  $needsSpan  = $c -cmatch '<Span[\s>]|<Span/'
  $needsText  = $c -cmatch '<Text[\s>]|<Text/'
  $needsLabel = $c -cmatch '<Label[\s>]|<Label/'
  $needsUl    = $c -cmatch '<Ul[\s>]|<Ul/'
  $needsLi    = $c -cmatch '<Li[\s>]|<Li/'

  # ── Import additions ─────────────────────────────────────────────────────────

  # Helper: check if a name is already imported somewhere in the file
  function Has-Import($code, $name) {
    return ($code -cmatch "import[^;]*\b$name\b[^;]*from ")
  }

  # Strategy A: file already has a @/components barrel import → add to it
  if ($c -match 'from "@/components"') {
    # Parse the existing named-import list from the @/components line
    $pattern = '(import\s*\{)([^}]+)(\}\s*from\s*"@/components")'
    if ($c -match $pattern) {
      $existingList = $Matches[2]
      $existingNames = ($existingList -split ',') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
      $toAdd = @()
      if ($needsSpan  -and 'Span'  -notin $existingNames) { $toAdd += 'Span' }
      if ($needsText  -and 'Text'  -notin $existingNames) { $toAdd += 'Text' }
      if ($needsLabel -and 'Label' -notin $existingNames) { $toAdd += 'Label' }
      if ($needsUl    -and 'Ul'    -notin $existingNames) { $toAdd += 'Ul' }
      if ($needsLi    -and 'Li'    -notin $existingNames) { $toAdd += 'Li' }

      if ($toAdd.Count -gt 0) {
        $sorted   = ($existingNames + $toAdd | Sort-Object) -join ', '
        $newImport = "import { $sorted } from ""@/components"""
        $oldImport = $Matches[0]   # full match
        $c = $c.Replace($oldImport, $newImport)
      }
    }
  } else {
    # Strategy B: no barrel import → use direct/standalone imports

    # Determine relative path prefix based on directory
    $dir = Split-Path $file.FullName -Parent | Split-Path -Leaf  # e.g. "ui", "forms", "admin"
    $parentDir = Split-Path (Split-Path $file.FullName -Parent) -Leaf  # parent of dir

    # Tier-1 primitive directories: components/ui, components/forms, components/layout,
    # components/feedback, components/modals, components/admin, components/semantic, etc.
    # All are one level under src/components/
    $fromTypography = ''
    $fromSemantic   = ''

    if ($file.FullName -match 'src\\components\\') {
      # Two levels down from src: src/components/<subdir>/File.tsx
      $fromTypography = '../typography/Typography'
      $fromSemantic   = '../semantic/Semantic'
    } elseif ($file.FullName -match 'src\\features\\') {
      # Features import from barrel
      $fromTypography = '@/components'
      $fromSemantic   = '@/components'
    } elseif ($file.FullName -match 'src\\app\\') {
      $fromTypography = '@/components'
      $fromSemantic   = '@/components'
    }

    # Build needed typography exports
    $typoNeeds = @()
    if ($needsSpan  -and -not (Has-Import $c 'Span'))  { $typoNeeds += 'Span' }
    if ($needsText  -and -not (Has-Import $c 'Text'))  { $typoNeeds += 'Text' }
    if ($needsLabel -and -not (Has-Import $c 'Label')) { $typoNeeds += 'Label' }

    $semNeeds = @()
    if ($needsUl -and -not (Has-Import $c 'Ul')) { $semNeeds += 'Ul' }
    if ($needsLi -and -not (Has-Import $c 'Li')) { $semNeeds += 'Li' }

    $insertLines = @()

    if ($fromTypography -eq $fromSemantic -and ($typoNeeds.Count -gt 0 -or $semNeeds.Count -gt 0)) {
      # Same source (barrel) — merge into one import
      $allNeeds = ($typoNeeds + $semNeeds | Sort-Object) -join ', '
      $insertLines += "import { $allNeeds } from ""$fromTypography"";"
    } else {
      if ($typoNeeds.Count -gt 0) {
        $names = ($typoNeeds | Sort-Object) -join ', '
        $insertLines += "import { $names } from ""$fromTypography"";"
      }
      if ($semNeeds.Count -gt 0) {
        $names = ($semNeeds | Sort-Object) -join ', '
        $insertLines += "import { $names } from ""$fromSemantic"";"
      }
    }

    if ($insertLines.Count -gt 0) {
      # Insert after the first import line in the file
      $lines  = $c -split "`r?`n"
      $lastImportIdx = -1
      for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match '^\s*(import|"use client"|"use server")') {
          $lastImportIdx = $i
        } elseif ($lastImportIdx -ge 0 -and $lines[$i] -notmatch '^\s*(import|//|$)') {
          break
        }
      }
      if ($lastImportIdx -eq -1) { $lastImportIdx = 0 }
      $before = $lines[0..$lastImportIdx]
      $after  = if ($lastImportIdx + 1 -lt $lines.Count) { $lines[($lastImportIdx + 1)..($lines.Count - 1)] } else { @() }
      $c = ($before + $insertLines + $after) -join "`n"
    }
  }

  [System.IO.File]::WriteAllText($file.FullName, $c, [System.Text.Encoding]::UTF8)
  $stats.changed++
  Write-Host "Fixed: $($file.Name)"
}

Write-Host ""
Write-Host "Done. Changed: $($stats.changed)  Skipped: $($stats.skipped)"
