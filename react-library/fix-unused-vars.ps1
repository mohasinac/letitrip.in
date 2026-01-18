# Script to prefix unused variables with underscore
$files = @(
    @{Path="src/components/auction/AuctionInfo.tsx"; Line=69; Var="auctionId"},
    @{Path="src/components/auction/AuctionSellerInfo.tsx"; Line=31; Var="sellerId"},
    @{Path="src/components/auction/AuctionSellerInfo.tsx"; Line=37; Var="shopId"},
    @{Path="src/components/auction/AutoBidSetup.tsx"; Line=51; Var="auctionId"},
    @{Path="src/components/auction/LiveBidHistory.tsx"; Line=163; Var="auctionId"},
    @{Path="src/components/cards/AuctionCard.tsx"; Line=247; Var="isInModeration"},
    @{Path="src/components/cards/ProductCard.tsx"; Line=260; Var="handleToggleFavorite"},
    @{Path="src/components/cards/ProductCard.tsx"; Line=284; Var="handleDelete"},
    @{Path="src/components/cards/ProductCard.tsx"; Line=292; Var="handleSelect"},
    @{Path="src/components/cards/ReviewCard.tsx"; Line=40; Var="userId"},
    @{Path="src/components/cart/CartItem.tsx"; Line=49; Var="onRemove"},
    @{Path="src/components/cart/CartSummary.tsx"; Line=48; Var="taxRate"},
    @{Path="src/components/category/CategoryHeader.tsx"; Line=69; Var="id"},
    @{Path="src/components/category/CategoryHeader.tsx"; Line=71; Var="slug"},
    @{Path="src/components/category/SubcategoryGrid.tsx"; Line=72; Var="parentSlug"},
    @{Path="src/components/category/SubcategoryGrid.tsx"; Line=73; Var="loading"},
    @{Path="src/components/events/PollVoting.tsx"; Line=81; Var="eventId"},
    @{Path="src/components/filters/FilterSectionComponent.tsx"; Line=78; Var="pendingValues"},
    @{Path="src/components/filters/FilterSectionComponent.tsx"; Line=79; Var="onFieldChange"},
    @{Path="src/components/ImageUploadWithCrop.tsx"; Line=34; Var="aspectRatio"},
    @{Path="src/components/ImageUploadWithCrop.tsx"; Line=36; Var="autoDelete"},
    @{Path="src/components/mobile/MobileBottomSheet.tsx"; Line=24; Var="snapPoints"},
    @{Path="src/components/mobile/MobileBottomSheet.tsx"; Line=25; Var="initialSnap"},
    @{Path="src/components/navigation/TabNav.tsx"; Line=10; Var="T"},
    @{Path="src/components/product/ProductVariants.tsx"; Line=23; Var="currentShopId"},
    @{Path="src/components/product/ReviewForm.tsx"; Line=65; Var="productId"},
    @{Path="src/components/product/ReviewList.tsx"; Line=60; Var="productId"},
    @{Path="src/components/product/SimilarProducts.tsx"; Line=33; Var="currentShopId"},
    @{Path="src/components/product/SimilarProducts.tsx"; Line=42; Var="LinkComponent"},
    @{Path="src/components/selectors/AddressSelectorWithCreate.tsx"; Line=217; Var="onCreateAddress"},
    @{Path="src/components/selectors/ProductVariantSelector.tsx"; Line=172; Var="categoryId"},
    @{Path="src/components/selectors/TagSelectorWithCreate.tsx"; Line=217; Var="TagIcon"},
    @{Path="src/components/shop/ShopAuctions.tsx"; Line=82; Var="onSortChange"},
    @{Path="src/components/shop/ShopReviews.tsx"; Line=172; Var="loading"},
    @{Path="src/components/ui/OptimizedImage.tsx"; Line=71; Var="quality"},
    @{Path="src/components/ui/PendingUploadsWarning.tsx"; Line=122; Var="onNavigationAttempt"},
    @{Path="src/components/ui/PendingUploadsWarning.tsx"; Line=126; Var="XIcon"},
    @{Path="src/components/VideoUploadWithThumbnail.tsx"; Line=19; Var="autoDelete"},
    @{Path="src/components/wizards/CategorySelectionStep.tsx"; Line=53; Var="value"},
    @{Path="src/components/wizards/CategorySelectionStep.tsx"; Line=54; Var="onChange"},
    @{Path="src/components/wizards/ContactInfoStep.tsx"; Line=59; Var="phoneHelperText"},
    @{Path="src/components/wizards/ShopSelectionStep.tsx"; Line=56; Var="value"},
    @{Path="src/components/wizards/ShopSelectionStep.tsx"; Line=57; Var="onChange"},
    @{Path="src/components/wrappers/ResourceDetailWrapper.tsx"; Line=118; Var="context"},
    @{Path="src/hooks/useConversationState.ts"; Line=83; Var="options"},
    @{Path="src/hooks/useDialogState.ts"; Line=144; Var="dialogIds"},
    @{Path="src/hooks/useMutation.ts"; Line=92; Var="TContext"},
    @{Path="src/hooks/useNavigationGuard.ts"; Line=86; Var="e"}
)

foreach ($item in $files) {
    $filePath = $item.Path
    if (Test-Path $filePath) {
        Write-Host "Processing $filePath..."
        $content = Get-Content $filePath -Raw
        $oldVar = $item.Var
        $newVar = "_$oldVar"
        
        # Replace the variable name with underscore prefix
        $content = $content -replace "\b$oldVar\b", $newVar
        
        Set-Content -Path $filePath -Value $content -NoNewline
    }
}

Write-Host "Done!"
