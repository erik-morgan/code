#!/bin/bash

update () {
	pn="$1"
	oldrev="$2"
	newrev="$3"
	hopper="$4"
	dwgs=$(dirname "$hopper")
	dirpath=$(find "$dwgs" -path '*/~*' -name "${pn}*pdf" -exec mv "{}" "$hopper" \; -exec dirname "{}" \; | head -n 1)
	cd "$hopper"
	filenames=$(find . -not -name "${pn}.pdf" -name "${pn}*pdf" -exec basename "{}" \;)
	pgnum=$(/usr/local/bin/pdftk "${pn}.pdf" dump_data | grep "NumberOfPages" | cut -d" " -f2)
	for file in $filenames
	do
		pdfname="${file/.$oldrev./.$newrev.}"
		/usr/local/bin/pdftk A="${pn}.pdf" B="$file" cat A B$((pgnum+1))-end output "${dirpath}/$pdfname"
	done
	rm "./${pn}*pdf"
}

replace () {
	pn="$1"
	newrev="$2"
	hopper="$3"
	dwgs=$(dirname "$hopper")
	dirpath=$(find "$dwgs" -path '*/~*' -name "${pn}*pdf" -exec dirname "{}" \; -delete)
	cd "$hopper"
	mv "${pn}.pdf" "$dirpath/${pn}.${newrev}.pdf"
	rm "./${pn}*pdf"
}

if [[ "$#" -eq 3 ]]
then
	replace "$1" "$2" "$3"
else
	update "$1" "$2" "$3" "$4"
fi
echo 'true'