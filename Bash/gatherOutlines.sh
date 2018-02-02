#!/bin/bash

cd '/Users/HD6904/Desktop/Digital SM Bank'
dlimit="$(date -j -f "%Y" "2007" +%s)"

while read -rd '' fpath; do
    created="$(mdls -name 'kMDItemContentCreationDate' "$fpath")"
    dcreated="${created/kMDItemContentCreationDate = /}"
    dorigin="$(date -j -f '%Y-%m-%d %H:%M:%S' "$dcreated" +%s)"
    if [[ $dorigin -ge $dlimit ]]; then
        cp "$fpath" '/Users/HD6904/Erik/Procedure Status/Outlines'
    fi
done < <(find -E . -iregex '.+/outline.+docx?' -print0)