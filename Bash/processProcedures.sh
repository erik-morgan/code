#!/bin/bash

cd "/Users/HD6904/Public/Erik's Dropbox"
while IFS= read -rd '' filepath; do
    filename="$(basename -s '.indd' "$filepath")"
    if [[ -f "${filename}.pdf" ]]; then
        IFS=' ' read -r procnum rev therest <<< "$filename"
        find /Users/HD6904/Desktop/TOCs -name "$procnum*TOC.indd" -delete
        find /Users/HD6904/Desktop/PDFs -name "$procnum*pdf" -delete
        cp "$filepath" "/Users/HD6904/Desktop/TOCs/InDesign Source Files"
        if [[ "$rev" =~ r[0-9]+ ]]; then
            toc="$procnum $rev TOC.indd"
        else
            toc="$procnum TOC.indd"
        fi
        if [[ "${procnum: -2}" == 'BP' ]]; then
            mv "$filepath" "/Users/HD6904/Desktop/TOCs/BP TOCs/$toc"
            mv "$filename.pdf" "/Users/HD6904/Desktop/PDFs/BP"
        else
            mv "$filepath" "/Users/HD6904/Desktop/TOCs/$toc"
            mv "$filename.pdf" "/Users/HD6904/Desktop/PDFs"
        fi
    fi
done < <(find . -name '*.indd' -maxdepth 1 -print0)