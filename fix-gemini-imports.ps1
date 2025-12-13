# Fix geminiService Import Paths
$files = @(
    @{Path="src/features/lms/AcademyMentor.tsx"; From="../../services/geminiService"; To="../../../services/geminiService"},
    @{Path="src/features/ai-studio/OmniConverter.tsx"; From="../../services/geminiService"; To="../../../services/geminiService"},
    @{Path="src/features/lms/AutoCourseGenerator.tsx"; From="../../services/geminiService"; To="../../../services/geminiService"}
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
