function Remove-EmptyDir ($dirPath) {
    Get-ChildItem -LiteralPath $dirPath -Directory | ForEach-Object {
        Remove-EmptyDir $_.FullName
    }
    if ((Get-ChildItem -LiteralPath $dirPath).Length -eq 0) {
        Remove-Item -LiteralPath $dirPath -Force
    }
}

Remove-EmptyDir 'D:\'