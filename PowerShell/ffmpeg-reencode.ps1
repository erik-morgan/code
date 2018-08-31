$root = "D:\Happy Endings"

Get-ChildItem -Path $root -Filter "*mkv" -File -Recurse | ForEach-Object {
    $dirvid = $_.DirectoryName
    $dirmkv = "$dirvid-REDO"
    $name = $_.BaseName
    $fvid = $_.FullName
    $fsrt = "$dirvid\$name.srt"
    $fmkv = "$dirmkv\$name.mkv"
    if (!(Test-Path -Path "$dirmkv")) {
        New-Item -ItemType directory -Path "$dirmkv"
    }
    ffmpeg -i "$fvid" -i "$fsrt" -vcodec libx264 -crf 28 -vf scale=-2:480 -acodec aac -ab 128k -ac 2 "$fmkv"
}
