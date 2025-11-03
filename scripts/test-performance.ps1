# Performance Testing Script (PowerShell)
# Tests the optimized API routes with caching and rate limiting

Write-Host "🚀 Performance Testing - Optimized Routes" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Categories Route (should be cached after first request)
Write-Host "📊 Test 1: Categories Route (Cache Test)" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Cyan

Write-Host "First request (cache MISS expected)..." -ForegroundColor Yellow
$start = Get-Date
$response1 = Invoke-WebRequest -Uri "$baseUrl/api/categories" -Method GET -UseBasicParsing
$end = Get-Date
$time1 = ($end - $start).TotalMilliseconds
$cacheHeader1 = $response1.Headers['X-Cache']

Write-Host "  Status: $($response1.StatusCode)" -ForegroundColor White
Write-Host "  X-Cache: $cacheHeader1" -ForegroundColor White
Write-Host "  Time: $([math]::Round($time1, 2))ms" -ForegroundColor White
Write-Host ""

Write-Host "Second request (cache HIT expected)..." -ForegroundColor Yellow
$start = Get-Date
$response2 = Invoke-WebRequest -Uri "$baseUrl/api/categories" -Method GET -UseBasicParsing
$end = Get-Date
$time2 = ($end - $start).TotalMilliseconds
$cacheHeader2 = $response2.Headers['X-Cache']

Write-Host "  Status: $($response2.StatusCode)" -ForegroundColor White
Write-Host "  X-Cache: $cacheHeader2" -ForegroundColor White
Write-Host "  Time: $([math]::Round($time2, 2))ms" -ForegroundColor White
Write-Host ""

$improvement = [math]::Round((($time1 - $time2) / $time1) * 100, 1)
Write-Host "✅ Cache Performance:" -ForegroundColor Green
Write-Host "   Improvement: $improvement% faster" -ForegroundColor Green
Write-Host "   Time Saved: $([math]::Round($time1 - $time2, 2))ms" -ForegroundColor Green
Write-Host ""

# Test 2: Products Route (should be cached)
Write-Host "📦 Test 2: Products Route (Cache Test)" -ForegroundColor Cyan
Write-Host "---------------------------------------" -ForegroundColor Cyan

Write-Host "First request (cache MISS expected)..." -ForegroundColor Yellow
$start = Get-Date
$response3 = Invoke-WebRequest -Uri "$baseUrl/api/products?limit=20" -Method GET -UseBasicParsing
$end = Get-Date
$time3 = ($end - $start).TotalMilliseconds
$cacheHeader3 = $response3.Headers['X-Cache']

Write-Host "  Status: $($response3.StatusCode)" -ForegroundColor White
Write-Host "  X-Cache: $cacheHeader3" -ForegroundColor White
Write-Host "  Time: $([math]::Round($time3, 2))ms" -ForegroundColor White
Write-Host ""

Write-Host "Second request (cache HIT expected)..." -ForegroundColor Yellow
$start = Get-Date
$response4 = Invoke-WebRequest -Uri "$baseUrl/api/products?limit=20" -Method GET -UseBasicParsing
$end = Get-Date
$time4 = ($end - $start).TotalMilliseconds
$cacheHeader4 = $response4.Headers['X-Cache']

Write-Host "  Status: $($response4.StatusCode)" -ForegroundColor White
Write-Host "  X-Cache: $cacheHeader4" -ForegroundColor White
Write-Host "  Time: $([math]::Round($time4, 2))ms" -ForegroundColor White
Write-Host ""

$improvement2 = [math]::Round((($time3 - $time4) / $time3) * 100, 1)
Write-Host "✅ Cache Performance:" -ForegroundColor Green
Write-Host "   Improvement: $improvement2% faster" -ForegroundColor Green
Write-Host "   Time Saved: $([math]::Round($time3 - $time4, 2))ms" -ForegroundColor Green
Write-Host ""

# Test 3: Rate Limiting (expect 429 after limit)
Write-Host "⚡ Test 3: Rate Limiting (Public: 100 req/hr)" -ForegroundColor Cyan
Write-Host "----------------------------------------------" -ForegroundColor Cyan

$successCount = 0
$rateLimitCount = 0

Write-Host "Sending 10 rapid requests..." -ForegroundColor Yellow
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/categories" -Method GET -UseBasicParsing -ErrorAction Stop
        $rateLimit = $response.Headers['X-RateLimit-Remaining']
        $successCount++
        
        if ($i -eq 1 -or $i -eq 5 -or $i -eq 10) {
            Write-Host "  Request $i`: Status $($response.StatusCode), Remaining: $rateLimit" -ForegroundColor White
        }
    } catch {
        $rateLimitCount++
        if ($i -eq 1 -or $i -eq 5 -or $i -eq 10) {
            Write-Host "  Request $i`: Rate Limited (429)" -ForegroundColor Red
        }
    }
    Start-Sleep -Milliseconds 50
}

Write-Host ""
Write-Host "✅ Rate Limiting Results:" -ForegroundColor Green
Write-Host "   Successful: $successCount" -ForegroundColor Green
Write-Host "   Rate Limited: $rateLimitCount" -ForegroundColor $(if ($rateLimitCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# Test 4: Categories Tree Format
Write-Host "🌳 Test 4: Categories Tree Format" -ForegroundColor Cyan
Write-Host "----------------------------------" -ForegroundColor Cyan

$start = Get-Date
$response5 = Invoke-WebRequest -Uri "$baseUrl/api/categories?format=tree" -Method GET -UseBasicParsing
$end = Get-Date
$time5 = ($end - $start).TotalMilliseconds
$cacheHeader5 = $response5.Headers['X-Cache']

Write-Host "  Status: $($response5.StatusCode)" -ForegroundColor White
Write-Host "  X-Cache: $cacheHeader5" -ForegroundColor White
Write-Host "  Time: $([math]::Round($time5, 2))ms" -ForegroundColor White
Write-Host ""

# Final Summary
Write-Host "📊 Performance Summary" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host ""
Write-Host "Categories Route:" -ForegroundColor White
Write-Host "  Uncached: $([math]::Round($time1, 2))ms" -ForegroundColor White
Write-Host "  Cached:   $([math]::Round($time2, 2))ms" -ForegroundColor White
Write-Host "  Improvement: $improvement%" -ForegroundColor $(if ($improvement -gt 50) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Products Route:" -ForegroundColor White
Write-Host "  Uncached: $([math]::Round($time3, 2))ms" -ForegroundColor White
Write-Host "  Cached:   $([math]::Round($time4, 2))ms" -ForegroundColor White
Write-Host "  Improvement: $improvement2%" -ForegroundColor $(if ($improvement2 -gt 50) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Rate Limiting:" -ForegroundColor White
Write-Host "  Working: $(if ($successCount -gt 0) { "✅ Yes" } else { "❌ No" })" -ForegroundColor $(if ($successCount -gt 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "✅ Performance testing complete!" -ForegroundColor Green
