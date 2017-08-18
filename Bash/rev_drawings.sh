#!/bin/bash

dwgfolder="$(dirname "$0")"
logfile="${dwgfolder}/rev_drawings_log.txt"

log () {
	tstamp="$(date "+%F %T")"
	echo "[${tstamp}]    ${1}" >> "$logfile"
}

log "\$dwgfolder = $dwgfolder"
cd "$dwgfolder"
log "Entered $dwgfolder"
targetDir () {
	if [[ "${1:0:2}" == '2-' ]]; then
		echo "$dwgfolder/~2-"
	elif [[ "${1:0:2}" == '4-' ]]; then
		echo "$dwgfolder/~4-"
	elif [[ "${1:0:2}" == '6-' ]]; then
		echo "$dwgfolder/~6-"
	elif [[ "${1:0:2}" == '7-' ]]; then
		echo "$dwgfolder/~7-"
	else
		echo "$dwgfolder/~X-"
	fi
}
while read -rd '' filepath; do
	filename="$(basename -s '.pdf' "$filepath")"
	IFS='.' read -r drawnum drawrev <<< "$filename"
	dirpath="$(targetDir "$drawnum")"
	pgnum="$(/usr/local/bin/pdftk "$filepath" dump_data | grep NumberOfPages | cut -d" " -f2)"
	while read -rd '' oldfile; do
		oldname="$(basename -s '.pdf' "$oldfile")"
		IFS='.' read -r specnum olddrawrev specrev <<< "$oldname"
		outpath="${oldfile/.$olddrawrev./.$drawrev.}"
		if [[ "$specrev" == '-' ]]; then
			mv "$filepath" "$dirpath"
		else
			/usr/local/bin/pdftk A="$filepath" B="$oldfile" cat A B$((pgnum+1))-end output "$outpath"
		fi
		if [[ -f "$outpath" || -f "$dirpath/$filename.pdf" ]]; then
			rm "$oldfile"
		fi
	done < <(printf '%s\0' "$dirpath/$drawnum"*pdf)
	log "Replaced all files with drawing number $drawnum"
done < <(find ./HOPPER -name "*pdf" -print0)
log "\$? = $?"
if [[ $? ]]; then
	log "Revision Update Complete!"
else
	echo 'Script Failed! Exiting...'
	log "Script Failed! Exiting..."
fi
rm ./HOPPER/*pdf
log "Cleared out all files in HOPPER"
rm ./pull_list.txt
log "Removed pull_list.txt"

echo "Drawing Library Update Complete!"