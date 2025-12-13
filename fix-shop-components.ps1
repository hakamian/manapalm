# Fix shop/components Import Paths
$files = @(
    @{Path="src/features/shop/components/CrowdfundModal.tsx"; From="../../../components/icons"; To="../../../../components/icons"},
    @{Path="src/features/shop/components/InstallmentSelector.tsx"; From="../../../components/icons"; To="../../../../components/icons"}
)

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file.Path
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $content = $content.Replace($file.From, $file.To)
        Set-Content $filePath $content -NoNewline
        Write-Host "Fixed: $($file.Path)"
    }
}

Write-Host "Done!"
