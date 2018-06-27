#!/bin/bash

dest="/Users/HD6904/Erik/Procedure Status/outlines/"
while read -rd '' fpath; do
	doc="$(basename "$fpath")"
    if ! [[ -f "$dest$doc" ]] && ! [[ "$doc" == SMR* ]] && ! [[ "$doc" == MRF* ]] && ! [[ "$doc" == SWI* ]]; then
		cp "$fpath" "$dest"
	fi
done < <(find ~/[!ALMST]* -type f \( -iname '*.docx' -o -iname '*.doc' \) -not -iname '*A-Z.doc*' -not -iname '*[1].doc*' -not -iname '*request*' -print0)
