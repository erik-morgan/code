#!/bin/bash

cd ~/Downloads
regx=".+ART5.+"

while read -rd '' art; do
    ftype="$(mdls -n kMDItemFSCreatorCode "$art")"
    if [[ ! "$ftype" =~ $regx ]]; then
        rm -f "$art"
    fi
done < <(find ART -type f -print0)
find ART -type f -name .* -delete
find ART -type d -empty -delete
