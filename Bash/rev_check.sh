#!/bin/bash

dwgfolder="$(dirname "$0")"
logfile="${dwgfolder}/rev_check_log.txt"
pullDraw=()

echo "" > "$logfile"

val () {
	[[ "$1" =~ NC|NR|0 ]] && oldrev="@" || oldrev="$1"
	[[ "$2" =~ NC|NR|0 ]] && newrev="@" || newrev="$2"
	[[ "${newrev: -1}" > "${oldrev: -1}" ]]
}

log () {
	tstamp="$(date "+%F %T")"
	echo "[${tstamp}]    ${1}" >> "$logfile"
}

log "\$dwgfolder = $dwgfolder"
key=~/Library/Keychains/login.keychain
security unlock-keychain -p '' "$key"
user="$(security find-internet-password usportal "$key" | grep acct | egrep -o '"[^"]+"$' | sed -E 's/"//g')"
pass="$(security find-internet-password -w usportal "$key")"
login="$user:$pass"
cd "$dwgfolder"
log "Entered $dwgfolder"
while read -rd '' filepath; do
	filename="$(basename -s '.pdf' $filepath)"
	dirpath="$(dirname $filepath)"
	IFS='.' read -r partnum drawrev specrev <<< "$filename"
	if [[ "$drawrev" == '-' ]]; then
		newspecrev="$(curl -s --anyauth -u $login "http://houston/ErpWeb/PartDetails.aspx?PartNumber=$partnum" | grep revisionNum | sed -E 's/^.+>([A-Z0-9]+)<.+$/\1/')"
		if val $specrev $newspecrev; then
			rm "$filepath"
			curl -s -o "./HOPPER/$partnum.pdf" "http://houston/ErpWeb/Part/PartDocumentReader.aspx?PartNumber=${partnum}&checkInProcess=1" -H 'Cookie: DqUserInfo=PartDocumentReader=AMERICAS\MorganEL' -H 'Connection: keep-alive' --compressed
			mv "./HOPPER/$partnum.pdf" "$dirpath/$partnum.$drawrev.$newspecrev.pdf"
			log "Updated file $filename from Rev $specrev to Rev $newspecrev"
		fi
	elif [[ "$specrev" == '-' ]]; then
		newdrawrev="$(curl -s --anyauth -u $login "http://houston/ErpWeb/PartDetails.aspx?PartNumber=$partnum" | grep revisionNum | sed -E 's/^.+>([A-Z0-9]+)<.+$/\1/')"
		if val $drawrev $newdrawrev; then
			pullDraw+=("$partnum")
			log "Added drawing $partnum to pullDraw to be updated from Rev $drawrev to Rev $newdrawrev"
		fi
	else
		drawnum="${partnum%-*}"
		newdrawrev="$(curl -s --anyauth -u $login "http://houston/ErpWeb/PartDetails.aspx?PartNumber=$drawnum" | grep revisionNum | sed -E 's/^.+>([A-Z0-9]+)<.+$/\1/')"
		newspecrev="$(curl -s --anyauth -u $login "http://houston/ErpWeb/PartDetails.aspx?PartNumber=$partnum" | grep revisionNum | sed -E 's/^.+>([A-Z0-9]+)<.+$/\1/')"
		if val $drawrev $newdrawrev; then
			pullDraw+=("$drawnum")
			log "Added drawing $partnum to pullDraw to be updated from Rev $drawrev to Rev $newdrawrev"
		fi
		if val $specrev $newspecrev; then
			curl -s -o "./HOPPER/$partnum.pdf" "http://houston/ErpWeb/Part/PartDocumentReader.aspx?PartNumber=${partnum}&checkInProcess=1" -H 'Cookie: DqUserInfo=PartDocumentReader=AMERICAS\MorganEL' -H 'Connection: keep-alive' --compressed
			mv "$filepath" "./HOPPER/$drawnum.pdf"
			pgnum="$(/usr/local/bin/pdftk "./HOPPER/$partnum.pdf" dump_data | grep NumberOfPages | cut -d" " -f2)"
			/usr/local/bin/pdftk A="./HOPPER/$drawnum.pdf" B="./HOPPER/$partnum.pdf" cat Arend-r$((++pgnum)) B output "$dirpath/$partnum.$drawrev.$newspecrev.pdf"
			log "Updated file $filename from Rev $specrev to Rev $newspecrev"
		fi
	fi
done < <(find . -path */~*pdf -print0)
printf "%s\n" "${pullDraw[@]}" > pull-list.txt
log "Saved list of drawings to pull in pull-list.txt"
uniq pull-list.txt pull_list.txt
log "Removed duplicates from pull-list.txt, and saved it as pull_list.txt"
rm pull-list.txt
log "Removed pull-list.txt"
rm ./HOPPER/*.pdf
log "Cleared out all files in HOPPER"

echo "Process complete! Pull drawings in pull-list.txt, and run rev_drawings.sh"