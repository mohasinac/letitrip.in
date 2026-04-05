<#
.SYNOPSIS
  Deploys Firestore composite indexes from firestore.indexes.json.

.DESCRIPTION
  Runs `firebase deploy --only firestore:indexes` to push index definitions
  to the configured Firebase project.
#>

Write-Host "Deploying Firestore indexes..." -ForegroundColor Cyan

firebase deploy --only firestore:indexes

if ($LASTEXITCODE -eq 0) {
    Write-Host "Firestore indexes deployed successfully." -ForegroundColor Green
} else {
    Write-Host "Deployment failed with exit code $LASTEXITCODE." -ForegroundColor Red
    exit $LASTEXITCODE
}
