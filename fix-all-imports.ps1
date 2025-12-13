# Fix ALL remaining import paths in src/features
$replacements = @(
    # Fix ../../ to ../../../ for files in src/features/*/
    @{Pattern="from '../../AppContext'"; Replacement="from '../../../AppContext'"},
    @{Pattern="from '../../components/seo/SEOHead'"; Replacement="from '../../../components/seo/SEOHead'"},
    @{Pattern="from '../../types'"; Replacement="from '../../../types'"},
    @{Pattern="from '../../types/lms'"; Replacement="from '../../../types/lms'"}
)

$files = Get-ChildItem -Path "src/features" -Recurse -Filter "*.tsx"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($rep in $replacements) {
        if ($content -match [regex]::Escape($rep.Pattern)) {
            $content = $content.Replace($rep.Pattern, $rep.Replacement)
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Fixed: $($file.FullName.Replace((Get-Location).Path + '\', ''))"
    }
}

Write-Host "Done!"
