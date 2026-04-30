Param()

$Root = Get-Location
$Target = Join-Path $Root "frontend"

Write-Host "Creating $Target"
New-Item -ItemType Directory -Force -Path $Target | Out-Null

$files = @('index.html','package.json','postcss.config.mjs','vite.config.ts','README.md')
foreach ($f in $files) {
    $src = Join-Path $Root $f
    if (Test-Path $src) {
        Write-Host "Moving $f"
        Move-Item -Path $src -Destination $Target -Force
    }
}

$dirs = @('src','styles','guidelines')
foreach ($d in $dirs) {
    $src = Join-Path $Root $d
    if (Test-Path $src) {
        Write-Host "Moving $d"
        Move-Item -Path $src -Destination $Target -Force
    }
}

Write-Host "Frontend reorganized into $Target"
