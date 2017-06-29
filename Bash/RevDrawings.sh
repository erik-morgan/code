#!/bin/bash

dwgFolder="$1"

cd "$dwgFolder"

targetDir () {
	if [[ "${1:0:2}" == '2-' ]]; then
		echo "$dwgFolder/~2-"
	elif [[ "${1:0:2}" == '4-' ]]; then
		echo "$dwgFolder/~4-"
	elif [[ "${1:0:2}" == '6-' ]]; then
		echo "$dwgFolder/~6-"
	elif [[ "${1:0:2}" == '7-' ]]; then
		echo "$dwgFolder/~7-"
	else
		echo "$dwgFolder/~X-"
	fi
}

while read -rd '' filepath; do
	filename="$(basename -s '.pdf' "$filepath")"
	IFS='.' read -r drawnum drawrev <<< "$filename"
	dirpath=$(targetDir "$drawnum")
	pgnum=$(/usr/local/bin/pdftk "$filepath" dump_data | grep NumberOfPages | cut -d" " -f2)
	while read -rd '' oldfile; do
		oldname=$(basename -s '.pdf' "$oldfile")
		IFS='.' read -r specnum olddrawrev specrev <<< "$oldname"
		outpath="${oldfile/.$olddrawrev./.$drawrev.}"
		if [[ "$specrev" == '-' ]]; then
			mv "$filepath" "$dirpath"
		else
			/usr/local/bin/pdftk A="$filepath" B="$oldfile" cat A B$pgnum-end output "$outpath"
		fi
		if [[ -f "$outpath" || -f "$dirpath/$filename.pdf" ]]; then
			rm "$oldfile"
		fi
	done < <(printf '%s\0' "$dirpath/$drawnum"*pdf)
done < <(find ./HOPPER -name "*pdf" -print0)

rm ./HOPPER/*pdf

echo 'Revision Update Complete!'