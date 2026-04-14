# Final pass: fix all remaining seed file field corruptions
$files = Get-ChildItem "src\db\seed-data\*.ts" -Exclude "index.ts"
$replacements = [ordered]@{
  'trimSturt:' = 'trimStart:'
  'isHeurchable:' = 'isSearchable:'
  'ishearchable:' = 'isSearchable:'
  'isFeutured:' = 'isFeatured:'
  'drufts:' = 'drafts:'
  'duft:' = 'draft:'
}

foreach ($f in $files) {
  $c = Get-Content $f.FullName -Raw -Encoding UTF8
  $changed = $false
  foreach ($key in $replacements.Keys) {
    if ($c -match [regex]::Escape($key)) {
      Write-Host "$($f.Name): fixing '$key' → '$($replacements[$key])'"
      $c = $c -replace [regex]::Escape($key), $replacements[$key]
      $changed = $true
    }
  }
  if ($changed) {
    [System.IO.File]::WriteAllText($f.FullName, $c, [System.Text.Encoding]::UTF8)
  }
}
Write-Host "Final field corruption pass completed"
