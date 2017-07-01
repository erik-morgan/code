#!/bin/bash
cnt=1
cd '/Users/HD6904/Desktop/PDFs/-StandardDocs'
mkdir tmp
for afile in SS*pdf; do
	line="$(sed "${cnt}q;d" "drawing-list.txt")"
	num="${line%% *}"
	dwgs=(${line#* })
	lim="${#dwgs[*]}"
	/usr/local/bin/pdftk "$afile" cat 1-"$num" output tmp/00.pdf
	for ((i = 0; i < $lim; i++)); do
		if (( $i >= 9 )); then
			filenum=$((i+2))
		else
			filenum="0$((i+1))"
		fi
		find /Users/HD6904/Desktop/Drawings -path "*/~??/${dwgs[i]}*pdf" -exec cp "{}" tmp/${filenum}.pdf \;
	done
	bookmarks=$(/usr/local/bin/pdftk "$afile" dump_data output - | grep Bookmark)
	/usr/local/bin/pdftk tmp/*.pdf cat output "$afile"
	echo "$bookmarks" | /usr/local/bin/pdftk "$afile" update_info /dev/stdin output tmp/tmp.pdf && mv tmp/tmp.pdf "$afile"
	rm tmp/*.pdf
	((cnt++))
done
rmdir tmp
echo "Update to -StandardDocs complete!"