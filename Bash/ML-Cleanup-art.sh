#!/bin/bash

TARGET_DIR="/Users/HD6904/Desktop/House Cleaning/Michael/art/"
FILES=$(find ~/Desktop/House\ Cleaning/Michael/Contents -type f \( -iname '*.ai' -o -iname '*eps' \) -print)
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

# TARGET_HASH=$(md5 $TARGET_F)
# F_HASH=$(md5 "$F")
# if [ $TARGET_HASH = "$F"_HASH ]; then
#    rm -f "$F"
# else
#    VAR=1
#    DONE=0
#    while [ $DONE = 0 ]; do
#        NEW_TARGET_F="${TARGET_F%.*} ($VAR).${F_NAME##*.}"
#        if [ -e $NEW_TARGET_F ]; then
#            ((VAR++))
#        else
#            DONE=1
#        fi
#    done
#    mv -n "$F" $NEW_TARGET_F
# fi