cd 'D:\'

[System.IO.File]::ReadLines('D:\media-tree.txt') | ForEach-Object {
    $pathOld, $pathNew = $_.split("`t")
    if (Test-Path -Path $pathOld) {
        if ($pathNew -eq 'DEL') {
            Remove-Item -Path $pathOld
        }
        else {
            $dirNew = Split-Path $pathNew
            if (!(Test-Path -Path $dirNew)) {
                New-Item -ItemType directory -Path $dirNew -Force | Out-Null
            }
            Move-Item -Path $pathOld -Destination $pathNew
        }
    }
}
