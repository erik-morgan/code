#!/bin/bash
FILES=$(find -E ~/D* /Volumes/HD /Volumes/HD_HD -type f -iregex '.+/.{0,6}[a-z]{2,6} ?\d{3,4}([-\d]{2,6})?.+' -not -name "*.pdf" -not -name "*.ps" -not -name "*TOC*" -print)
IFS=$'\n'
for F in $FILES
do
	F_KIND=$(mdls -name 'kMDItemKind' "$F")
	if [[ "$F_KIND" =~ .*InDesign.* ]] || [[ "$F_KIND" =~ .*PageMaker.* ]]
	then
		echo "${F}\n" >> procs.txt
	fi
done