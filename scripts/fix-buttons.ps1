$files = @(
  "src\components\admin\bids\BidTableColumns.tsx",
  "src\components\admin\carousel\CarouselTableColumns.tsx",
  "src\components\admin\categories\CategoryTableColumns.tsx",
  "src\components\admin\coupons\CouponTableColumns.tsx",
  "src\components\admin\faqs\FaqTableColumns.tsx",
  "src\components\admin\orders\OrderTableColumns.tsx",
  "src\components\admin\products\ProductTableColumns.tsx",
  "src\components\admin\reviews\ReviewTableColumns.tsx",
  "src\components\admin\sections\SectionTableColumns.tsx",
  "src\components\admin\users\UserTableColumns.tsx",
  "src\components\admin\faqs\FaqForm.tsx",
  "src\components\admin\payouts\PayoutStatusForm.tsx",
  "src\components\admin\users\UserFilters.tsx"
)
foreach ($f in $files) {
  if (-not (Test-Path $f)) { Write-Host "NOT FOUND: $f"; continue }
  $c = Get-Content $f -Raw
  $c = $c.Replace("<button", "<Button").Replace("</button>", "</Button>")
  Set-Content $f $c -NoNewline
  $remaining = (Select-String -Path $f -Pattern '<button|</button' -CaseSensitive).Count
  Write-Host "$f => $remaining raw button tags remaining"
}
Write-Host "All done"
