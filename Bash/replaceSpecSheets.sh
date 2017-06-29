#!/bin/bash

pn="$1"
pl="$2"
hopper="$3"
pdfname="$4"
dwgs=$(dirname "$hopper")

curl -o "$hopper${pl}.pdf" "http://houston/ErpWeb/Part/PartDocumentReader.aspx?partnumber=${pl}&checkInProcess=1" -H 'Cookie: DqUserInfo=PartDocumentReader=AMERICAS\MorganEL' -H 'Connection: keep-alive' --compressed

while [[ ! -e "$hopper${pl}.pdf" ]]
do
	sleep 1
done

dirpath=$(find "$dwgs" -path '*/~*' -name "${pl}*pdf" -exec mv "{}" "$hopper${pn}.pdf" \; -exec dirname "{}" \;)
cd "$hopper"
pgnum=$(/usr/local/bin/pdftk "${pl}.pdf" dump_data | grep "NumberOfPages" | cut -d" " -f2)
/usr/local/bin/pdftk A="${pn}.pdf" B="${pl}.pdf" cat Arend-r$((pgnum+1)) B output "${dirpath}/$pdfname"
rm ./*.pdf
echo 'true'