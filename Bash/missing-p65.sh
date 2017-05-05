#!/bin/bash
while IFS= read -r N
do
	FILES=$(find ~/ -type f -not -path "*/PM2INDD/*" -name "$N*" -not -name "*.???" -print)
	for F in $FILES
	do
		F_KIND=$(mdls -name 'kMDItemKind' "$F")
		if [[ "$F_KIND" =~ .*InDesign.* ]] || [[ "$F_KIND" =~ .*PageMaker.* ]]
		then
			cp -a "$F" /Users/HD6904/Erik/PM2INDD/MISSING
		fi
	done
done < /Users/HD6904/Erik/PM2INDD/MISSING.txt