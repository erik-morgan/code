#!/bin/bash

outlinedoc="$1"
textutil -convert txt "$outlinedoc"
outlinetxt="${outlinedoc%.*}.txt"
pulldir="$(cd "$(dirname "$outlinedoc")"; echo "$(dirname "$PWD")/Pull")"
partslist="$pulldir/pull.txt"
regx="^([-0-9]+|TP ?37002.*)$"
missing=()

egrep -o -i '^([2467]-)?([A-Z][A-Z][- ]?)?[0-9]{5,}\S*' "$outlinetxt" | sort -iu > "$partslist"
cd "$(dirname "$0")"

while IFS='' read -r line || [[ -n "$line" ]]; do
    read -rd '\t' part bs <<< "$line"
    if [[ "$part" == 2-SD-30021* ]]; then
        partfile="SS-15 Stack-Ups (SDVB30036).pdf"
    elif [[ "$part" =~ $regx ]]; then
        partfile="$(find . -name $part.*pdf)"
    else
        partfile="$(find ~/Desktop/NetworkFS/Libraries/Drawings -name $part.*pdf)"
    fi
    if [[ "$partfile" == "" ]]; then
        missing+=("$part")
    else
        cp -n "$partfile" "$pulldir"
    fi
done < "$partslist"

if [[ ${#missing[@]} -gt 0 ]]; then
    printf "%s\n" "${missing[@]}" > "$(dirname "$pulldir")/new-pulls.txt"
fi

rm "$outlinetxt" "$partslist"

echo "Pull complete."
