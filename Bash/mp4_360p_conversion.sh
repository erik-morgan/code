#!/bin/bash

while read -rd '' vidin; do
    vid="${vidin/IT_EDU/it_edu_vids}";
    </dev/null ffmpeg -i "$vidin" -c:v libx265 -crf 28 -b:v 250k -maxrate 250k -bufsize 500k -vf scale=-1:360 -acodec aac -ab 96k "$vid";
done < <(find IT_EDU -name *.mp4 -print0)