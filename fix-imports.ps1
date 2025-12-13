# Fix Import Paths Script
# This script fixes all import paths from components/icons to the correct relative paths

$files = @(
    @{Path="src/features/admin/AutoCEOView.tsx"; From="../../components/icons"; To="../../../components/icons"},
    @{Path="src/features/ai-studio/AIStudioView.tsx"; From="../../components/icons"; To="../../../components/icons"},
    @{Path="src/features/ai-studio/KnowledgeRefiner.tsx"; From="../../components/icons"; To="../../../components/icons"},
    @{Path="src/features/ai-studio/OmniConverter.tsx"; From="../../components/icons"; To="../../../components/icons"},
    @{Path="src/features/lms/AcademyMentor.tsx"; From="../../components/icons"; To="../../../components/icons"},
    @{Path="src/features/lms/AutoCourseGenerator.tsx"; From="../../components/icons"; To="../../../components/icons"},
    @{Path="src/features/lms/CoursePlayer.tsx"; From="../../components/icons"; To="../../../components/icons"}
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
