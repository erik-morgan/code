#!/bin/bash

TARGET_DIR="/Users/HD6904/Desktop/House Cleaning/Michael/pdf/"
FILES=$(find ~/Desktop/House\ Cleaning/Michael/Contents -type f -iname '*.pdf' -print)
IFS=$'\n'

for F in $FILES; do
    F_NAME=$(basename "$F")
    TARGET_F="$TARGET_DIR$F_NAME"
    xattr -w PATH $(dirname "$F") "$F"
    if [ -e "$TARGET_F" ]; then
        TARGET_MDATE=$(stat -f %m "$TARGET_F")
        F_MDATE=$(stat -f %m "$F")
        if [ $F_MDATE -ge $TARGET_MDATE ]; then
            rm -f "$F"
        else
            mv -f "$F" "$TARGET_F"
        fi
    else
        mv -n "$F" "$TARGET_F"
    fi
done