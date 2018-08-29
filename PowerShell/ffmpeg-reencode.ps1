$root = "D:\Happy Endings"

Get-ChildItem -Path $root -Filter "Happy*" -File -Recurse | ForEach-Object {
    $vid = Get-Item $_.FullName
    $dirvid = $vid.DirectoryName
    $dirmkv = "$dirvid-REDO"
    $name = $vid.BaseName
    $fvid = $vid.FullName
    $fsrt = "$dirvid\$name.srt"
    $fmkv = "$dirmkv\$name.mkv"
    if (!(Test-Path -Path $dirmkv)) {
        New-Item -ItemType directory -Path $dirmkv
    }
    ffmpeg -i $fvid -i $fsrt -vcodec libx264 -crf 28 -vf scale=-2:480 -acodec aac -ab 128k -ac 2 $fmkv
}
