#!/bin/bash

while IFS= read -rd '' file; do
	newpath="${file/ (OCR-SIE)/}"
	mv "$file" "$newpath"
done < <(find '/Users/HD6904/Desktop/Digital SM Bank' -name '*(OCR-SIE).pdf' -print0)