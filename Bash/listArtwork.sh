#!/bin/bash

cd "/Volumes/share/SERVICE/Writing Department Art Work/"
outfile='/Users/HD6904/art_list.txt'
while IFS= read -rd '' filepath; do
    fpath="$(dirname "$filepath")"
    fname="$(basename "$filepath")"
    fkind="$(mdls -name 'kMDItemKind' "$filepath")"
    fmakr="$(mdls -name 'kMDItemFSCreatorCode' "$filepath")"
    ftype="$(mdls -name 'kMDItemFSTypeCode' "$filepath")"
    echo -e "${fpath}\t${fname}\t${fkind}\t${fmakr}\t${ftype}" >> "$outfile"
done < <(find . -type f -name '*' -print0)
