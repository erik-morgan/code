#!/bin/bash

find ~/Desktop/House\ Cleaning/Michael/Contents//Desktop/House Cleaning/Michael/Contents/ -type d -empty -delete
FILES=$(find ~/Desktop/House\ Cleaning/Michael/Contents//Desktop/House Cleaning/Michael/Contents/ -name '*' -print)
IFS=$'\n'
for F in $FILES
do
	if [ "$F" = "*.dxf" ]
	then
		rm -f "$F"
	else
		xattr -w PATH $(dirname "$F") "$F"
		F_KIND=$(mdls -name 'kMDItemKind' "$F")
		if [[ $F_KIND =~ .*Word.* ]]
		then
			TARGET_F="${F}.doc"
		elif [[ $F_KIND =~ .*PageMaker.* ]]
		then
			TARGET_F="${F}.p65"
		elif [[ $F_KIND =~ .*Excel.* ]]
		then
			TARGET_F="${F}.xls"
		elif [[ $F_KIND =~ .*EPS.* ]]
		then
			TARGET_F="${F}.eps"
		elif [[ $F_KIND =~ .*PDF.* ]]
		then
			TARGET_F="${F}.pdf"
		fi
		mv -f "$F" "$TARGET_F"
	fi
done