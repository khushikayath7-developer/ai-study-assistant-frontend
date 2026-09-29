$ErrorActionPreference = 'Stop'

$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$buildRoot = 'D:\a'
$sourceApk = Join-Path $buildRoot 'android\app\build\outputs\apk\release\app-release.apk'
$destinationDir = Join-Path $sourceRoot 'android\app\build\outputs\apk\release'
$destinationApk = Join-Path $destinationDir 'app-release.apk'

Write-Host 'Syncing the project to a Windows-safe short build path...'
& robocopy $sourceRoot $buildRoot /E /XD node_modules .git build .cxx release-output /XF '*.apk' /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -ge 8) {
    throw "Project sync failed with robocopy exit code $LASTEXITCODE."
}

Push-Location $buildRoot
try {
    Write-Host 'Installing exact dependencies...'
    & npm ci
    if ($LASTEXITCODE -ne 0) {
        throw 'npm ci failed.'
    }

    Write-Host 'Building the release APK...'
    Push-Location (Join-Path $buildRoot 'android')
    try {
        & .\gradlew.bat assembleRelease
        if ($LASTEXITCODE -ne 0) {
            throw 'Gradle release build failed.'
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}

if (-not (Test-Path -LiteralPath $sourceApk)) {
    throw "The build completed but the APK was not found at $sourceApk."
}

New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
Copy-Item -LiteralPath $sourceApk -Destination $destinationApk -Force

$apk = Get-Item -LiteralPath $destinationApk
Write-Host ''
Write-Host 'APK BUILD SUCCESSFUL' -ForegroundColor Green
Write-Host "APK: $($apk.FullName)"
Write-Host ('Size: {0:N2} MB' -f ($apk.Length / 1MB))
