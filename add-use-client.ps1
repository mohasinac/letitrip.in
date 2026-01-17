$files = @(
  "react-library/src/components/faq/FAQItem.tsx",
  "react-library/src/components/faq/FAQSection.tsx",
  "react-library/src/components/filters/FilterSectionComponent.tsx",
  "react-library/src/components/filters/FilterSidebar.tsx",
  "react-library/src/components/filters/MobileFilterSidebar.tsx",
  "react-library/src/components/filters/PriceRangeFilter.tsx",
  "react-library/src/components/filters/ProductFilters.tsx",
  "react-library/src/components/filters/SearchBar.tsx",
  "react-library/src/components/filters/UnifiedFilterSidebar.tsx",
  "react-library/src/components/forms/FormCheckbox.tsx",
  "react-library/src/components/forms/FormCurrencyInput.tsx",
  "react-library/src/components/forms/FormDatePicker.tsx",
  "react-library/src/components/forms/FormFileUpload.tsx",
  "react-library/src/components/forms/FormInput.tsx",
  "react-library/src/components/forms/FormKeyValueInput.tsx",
  "react-library/src/components/forms/FormListInput.tsx",
  "react-library/src/components/forms/FormModal.tsx",
  "react-library/src/components/forms/FormPhoneInput.tsx",
  "react-library/src/components/forms/FormSelect.tsx",
  "react-library/src/components/forms/FormTextarea.tsx",
  "react-library/src/components/forms/PincodeInput.tsx",
  "react-library/src/components/forms/RichTextEditor.tsx",
  "react-library/src/components/forms/SlugInput.tsx",
  "react-library/src/components/forms/TagInput.tsx",
  "react-library/src/components/forms/WizardSteps.tsx",
  "react-library/src/components/ImageUploadWithCrop.tsx",
  "react-library/src/components/search/CollapsibleFilter.tsx",
  "react-library/src/components/search/ContentTypeFilter.tsx",
  "react-library/src/components/search/MobileFilterDrawer.tsx",
  "react-library/src/components/search/SearchableDropdown.tsx",
  "react-library/src/components/search/SearchInput.tsx",
  "react-library/src/components/selectors/AddressSelectorWithCreate.tsx",
  "react-library/src/components/selectors/CategorySelector.tsx",
  "react-library/src/components/selectors/ContactSelectorWithCreate.tsx",
  "react-library/src/components/selectors/DocumentSelectorWithUpload.tsx",
  "react-library/src/components/selectors/LanguageSelector.tsx",
  "react-library/src/components/selectors/StateSelector.tsx",
  "react-library/src/components/selectors/TagSelectorWithCreate.tsx",
  "react-library/src/components/tables/ActionMenu.tsx",
  "react-library/src/components/tables/BulkActionBar.tsx",
  "react-library/src/components/tables/DataTable.tsx",
  "react-library/src/components/tables/InlineEditor.tsx",
  "react-library/src/components/tables/InlineEditRow.tsx",
  "react-library/src/components/tables/QuickCreateRow.tsx",
  "react-library/src/components/tables/TableCheckbox.tsx",
  "react-library/src/components/ui/ConfirmDialog.tsx",
  "react-library/src/components/ui/FavoriteButton.tsx",
  "react-library/src/components/ui/GPSButton.tsx",
  "react-library/src/components/ui/HorizontalScrollContainer.tsx",
  "react-library/src/components/ui/InlineImageUpload.tsx",
  "react-library/src/components/ui/MobileInput.tsx",
  "react-library/src/components/ui/MobileStickyBar.tsx",
  "react-library/src/components/ui/OptimizedImage.tsx",
  "react-library/src/components/ui/PendingUploadsWarning.tsx",
  "react-library/src/components/ui/ThemeToggle.tsx",
  "react-library/src/components/ui/Toast.tsx",
  "react-library/src/components/ui/UploadProgress.tsx",
  "react-library/src/components/VideoUploadWithThumbnail.tsx",
  "react-library/src/components/wrappers/SmartAddressForm.tsx"
)

foreach ($file in $files) {
  if (Test-Path $file) {
    $content = Get-Content $file | Out-String
    if ($content -notmatch '"use client"') {
      $lines = Get-Content $file
      $newContent = @('"use client";', '') + $lines
      Set-Content -Path $file -Value $newContent
      Write-Host "Added to: $file"
    }
  }
}
