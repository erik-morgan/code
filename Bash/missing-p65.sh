#!/bin/bash

while IFS= read -r N; do
    FILES=$(find /Users/HD6904/D* -type f \( -iname "$N *" -o -iname "$N *.p??" \) -not -name "*.pdf" -not -name "*.??" -not -name "*TOC*" -print)
    IFS=$'\n'
    for F in $FILES; do
        F_KIND=$(mdls -name 'kMDItemKind' "$F")
        if [[ "$F_KIND" =~ .*InDesign.* ]]; then
            TARGET_F="/Users/HD6904/Erik/PM2INDD/MISSING/${N}.indd"
        elif [[ "$F_KIND" =~ .*PageMaker.* ]]; then
            TARGET_F="/Users/HD6904/Erik/PM2INDD/MISSING/${N}.p65"
        fi
        if [ -n "$TARGET_F" ]; then
            if [ -e "$TARGET_F" ]; then
                TARGET_MDATE=$(stat -f %m "$TARGET_F")
                F_MDATE=$(stat -f %m "$F")
                if [ $F_MDATE -ge $TARGET_MDATE ]; then
                    cp -a "$F" "$TARGET_F"
                fi
            else
                cp -a "$F" "$TARGET_F"
            fi
        fi
        TARGET_F=""
    done
done < /Users/HD6904/Erik/PM2INDD/MISSING.txt